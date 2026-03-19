"""FastAPI application — all routes for BuildAtlas."""
import json
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from backend.config import settings
from backend.dependencies import get_data_store
from backend.ai.client import AIClient
from backend.models.schemas import (
    ProjectInput, FullAnalysisResponse,
    WhatIfParams, WhatIfResponse,
    CascadeResponse, MaterialSwapResponse,
    ReverseResponse, ComplianceResponse,
)
from backend.engines.floorplan_engine import FloorPlanEngine
from backend.engines.cost_engine import CostEngine
from backend.engines.schedule_engine import ScheduleEngine
from backend.engines.resource_engine import ResourceEngine
from backend.engines.risk_engine import RiskEngine
from backend.engines.whatif_engine import WhatIfEngine
from backend.engines.compliance_engine import ComplianceEngine
from backend.engines.reverse_engine import ReverseEngine
from backend.engines.cascade_engine import CascadeEngine
from backend.engines.material_swap_engine import MaterialSwapEngine

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

# ── Lifespan: load data + AI client at startup ──
data_store = None
ai_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global data_store, ai_client
    data_store = get_data_store()
    ai_client = AIClient(settings.gemini_api_key)
    logger.info(f"DataStore loaded. AI available: {ai_client.is_available}")
    yield

app = FastAPI(
    title="BuildAtlas API",
    description="Construction Decision Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helper to get engines ──
def engines():
    return {
        "floorplan": FloorPlanEngine(data_store),
        "cost": CostEngine(data_store),
        "schedule": ScheduleEngine(data_store),
        "resource": ResourceEngine(data_store),
        "risk": RiskEngine(data_store),
        "whatif": WhatIfEngine(data_store),
        "compliance": ComplianceEngine(data_store),
        "reverse": ReverseEngine(data_store),
        "cascade": CascadeEngine(data_store),
        "material_swap": MaterialSwapEngine(data_store),
    }


# ═══ FULL PIPELINE ═══
@app.post("/api/project/analyze", response_model=FullAnalysisResponse)
async def analyze_project(input: ProjectInput):
    """Run the full analysis pipeline: floorplan → cost → schedule → resource → risk → compliance."""
    e = engines()

    # Sequential pipeline — each feeds the next
    floorplan = e["floorplan"].compute(input)
    cost = e["cost"].compute(input, floorplan=floorplan)
    schedule = e["schedule"].compute(input, cost=cost)
    resources = e["resource"].compute(input, schedule=schedule)
    risk = e["risk"].compute(input, cost=cost, schedule=schedule)
    compliance = e["compliance"].compute(input)

    # AI narration (non-blocking, with fallback)
    if ai_client and ai_client.is_available:
        try:
            narratives = await ai_client.generate_risk_narratives(risk.narrative_context)
            for r in risk.risks:
                if r.id in narratives:
                    r.narrative = narratives[r.id]
                elif not r.narrative:
                    r.narrative = r.default_narrative
        except Exception:
            for r in risk.risks:
                r.narrative = r.default_narrative
    else:
        for r in risk.risks:
            r.narrative = r.default_narrative

    return FullAnalysisResponse(
        floorplan=floorplan,
        cost=cost,
        schedule=schedule,
        resources=resources,
        risk=risk,
        compliance=compliance,
    )


# ═══ INDIVIDUAL ENDPOINTS ═══

@app.post("/api/floorplan/generate")
async def generate_floorplan(input: ProjectInput):
    return engines()["floorplan"].compute(input)


@app.post("/api/cost/estimate")
async def estimate_cost(input: ProjectInput):
    fp = engines()["floorplan"].compute(input)
    return engines()["cost"].compute(input, floorplan=fp)


@app.post("/api/schedule/generate")
async def generate_schedule(input: ProjectInput):
    return engines()["schedule"].compute(input)


@app.post("/api/resource/allocate")
async def allocate_resources(input: ProjectInput):
    sched = engines()["schedule"].compute(input)
    return engines()["resource"].compute(input, schedule=sched)


@app.post("/api/risk/assess")
async def assess_risk(input: ProjectInput):
    e = engines()
    cost = e["cost"].compute(input, floorplan=e["floorplan"].compute(input))
    sched = e["schedule"].compute(input)
    result = e["risk"].compute(input, cost=cost, schedule=sched)
    # Add AI narratives
    for r in result.risks:
        r.narrative = r.default_narrative
    if ai_client and ai_client.is_available:
        try:
            narratives = await ai_client.generate_risk_narratives(result.narrative_context)
            for r in result.risks:
                if r.id in narratives:
                    r.narrative = narratives[r.id]
        except Exception:
            pass
    return result


# ── What-If ──
class WhatIfRequest(BaseModel):
    project: ProjectInput
    params: WhatIfParams

@app.post("/api/whatif/simulate", response_model=WhatIfResponse)
async def simulate_whatif(req: WhatIfRequest):
    e = engines()
    fp = e["floorplan"].compute(req.project)
    cost = e["cost"].compute(req.project, floorplan=fp)
    sched = e["schedule"].compute(req.project)
    return e["whatif"].compute(req.project, params=req.params, cost=cost, schedule=sched)


@app.post("/api/compliance/check")
async def check_compliance(input: ProjectInput):
    return engines()["compliance"].compute(input)


@app.post("/api/reverse/plan", response_model=ReverseResponse)
async def reverse_plan(input: ProjectInput):
    return engines()["reverse"].compute(input)


# ── Delay Cascade ──
class CascadeRequest(BaseModel):
    project: ProjectInput
    delayed_phase_id: str = "foundation"
    delay_days: int = 14

@app.post("/api/cascade/predict", response_model=CascadeResponse)
async def predict_cascade(req: CascadeRequest):
    e = engines()
    sched = e["schedule"].compute(req.project)
    result = e["cascade"].compute(
        req.project, schedule=sched,
        delayed_phase_id=req.delayed_phase_id,
        delay_days=req.delay_days,
    )
    # Add AI mitigations
    if ai_client and ai_client.is_available and result.affected_phases:
        try:
            mitigations = await ai_client.generate_delay_mitigations(
                req.delayed_phase_id, req.delay_days,
                json.dumps([a.model_dump() for a in result.affected_phases]),
            )
            result.mitigations = mitigations
        except Exception:
            pass
    return result


@app.post("/api/materials/swap", response_model=MaterialSwapResponse)
async def swap_materials(input: ProjectInput):
    return engines()["material_swap"].compute(input)


# ═══ COPILOT WEBSOCKET ═══
@app.websocket("/api/copilot/chat")
async def copilot_chat(websocket: WebSocket):
    await websocket.accept()
    context = None
    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            if msg.get("type") == "context":
                context = msg.get("data", {})
                await websocket.send_json({"type": "system", "content": "Context loaded."})
                continue

            if msg.get("type") == "message":
                user_msg = msg.get("content", "")
                if ai_client and ai_client.is_available:
                    async for token in ai_client.stream_copilot(context, user_msg):
                        await websocket.send_json({"type": "token", "content": token})
                else:
                    # Fallback: return a helpful default
                    fallback = (
                        "AI Copilot is running in offline mode (no API key configured). "
                        "I can still help with general construction guidance. "
                        "For personalized AI responses, set GEMINI_API_KEY in backend/.env"
                    )
                    await websocket.send_json({"type": "token", "content": fallback})
                await websocket.send_json({"type": "done"})

    except WebSocketDisconnect:
        logger.info("Copilot WebSocket disconnected")
    except Exception as e:
        logger.error(f"Copilot error: {e}")
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except Exception:
            pass


# ── Health check ──
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "ai_available": ai_client.is_available if ai_client else False,
        "data_loaded": data_store is not None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
