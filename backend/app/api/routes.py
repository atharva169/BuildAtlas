"""
BuildAtlas GenAI — API Routes
All FastAPI endpoint handlers.  Each returns a consistent {success, data, error} envelope.
"""

from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, HTTPException, Request

from app.ai.gemini_client import GeminiClient
from app.data.mock_data import COMPLIANCE_CHECKLIST, CITY_APPROVALS, MATERIALS
from app.engines.cost_engine import CostEngine
from app.engines.floorplan_engine import FloorPlanEngine
from app.engines.material_engine import MaterialEngine
from app.engines.resource_engine import ResourceEngine
from app.engines.reverse_planning_engine import ReversePlanningEngine
from app.engines.risk_engine import RiskEngine
from app.engines.schedule_engine import ScheduleEngine
from app.models import (
    APIResponse,
    ChecklistItem,
    ComplianceChecklist,
    CopilotRequest,
    CopilotResponse,
    DelayCascadeInput,
    MaterialSwapResult,
    ProjectInput,
    WhatIfParams,
)

logger = logging.getLogger("buildatlas.routes")

router = APIRouter(prefix="/api")

# ── Engine singletons (stateless, safe to reuse) ──────────────────────
_cost_engine = CostEngine()
_schedule_engine = ScheduleEngine()
_floorplan_engine = FloorPlanEngine()
_risk_engine = RiskEngine()
_resource_engine = ResourceEngine()
_reverse_engine = ReversePlanningEngine()
_material_engine = MaterialEngine()
_gemini = GeminiClient()

# ── In-memory project store (for hackathon MVP) ──────────────────────
_projects: dict[str, dict] = {}


# ══════════════════════════════════════════════════════════════════════
# Health
# ══════════════════════════════════════════════════════════════════════

@router.get("/health")
async def health_check():
    """Health probe for uptime monitoring."""
    return {"status": "ok", "gemini_available": _gemini.is_available}


# ══════════════════════════════════════════════════════════════════════
# Project
# ══════════════════════════════════════════════════════════════════════

@router.post("/project")
async def create_project(project: ProjectInput):
    """Store a project and return its ID."""
    pid = str(uuid.uuid4())[:8]
    _projects[pid] = project.model_dump()
    return APIResponse(
        success=True,
        data={"project_id": pid, "project_name": project.project_name, "plot_area_sqft": project.plot_area_sqft},
    ).model_dump()


@router.get("/project/{project_id}")
async def get_project(project_id: str):
    """Retrieve a stored project by ID."""
    if project_id not in _projects:
        raise HTTPException(status_code=404, detail="Project not found")
    return APIResponse(success=True, data=_projects[project_id]).model_dump()


# ══════════════════════════════════════════════════════════════════════
# Floor Plan
# ══════════════════════════════════════════════════════════════════════

@router.post("/floorplan")
async def generate_floorplan(project: ProjectInput):
    """Generate a 2D room layout for the given project."""
    result = _floorplan_engine.generate(project)
    return APIResponse(success=True, data=result.model_dump()).model_dump()


# ══════════════════════════════════════════════════════════════════════
# Cost Estimation
# ══════════════════════════════════════════════════════════════════════

@router.post("/estimate")
async def estimate_cost(project: ProjectInput):
    """Generate P10/P50/P90 cost bands with BOQ breakdown."""
    result = _cost_engine.estimate(project)
    return APIResponse(success=True, data=result.model_dump()).model_dump()


# ══════════════════════════════════════════════════════════════════════
# Schedule
# ══════════════════════════════════════════════════════════════════════

@router.post("/schedule")
async def generate_schedule(project: ProjectInput):
    """Generate a CPM-based construction schedule with monsoon lockout."""
    result = _schedule_engine.generate(project)
    return APIResponse(success=True, data=result.model_dump()).model_dump()


# ══════════════════════════════════════════════════════════════════════
# Resources
# ══════════════════════════════════════════════════════════════════════

@router.post("/resources")
async def generate_resource_plan(project: ProjectInput):
    """Generate crew and equipment allocation across phases."""
    schedule = _schedule_engine.generate(project)
    phase_data = [{"name": p.name, "adjusted_weeks": p.adjusted_weeks} for p in schedule.phases]
    result = _resource_engine.plan(project, phase_data)
    return APIResponse(success=True, data=result.model_dump()).model_dump()


# ══════════════════════════════════════════════════════════════════════
# Risk Assessment
# ══════════════════════════════════════════════════════════════════════

@router.post("/risks")
async def assess_risks(project: ProjectInput):
    """Score risks and generate AI narratives."""
    register = _risk_engine.assess(project)

    # Enhance with Gemini narratives (if available)
    for risk in register.risks:
        narrative = await _gemini.generate("risk_narrative", {
            "city": project.city,
            "project_type": project.project_type.value,
            "floors": project.floors,
            "builtup_sqft": project.builtup_sqft,
            "risk_title": risk.title,
            "score": risk.score,
            "category": risk.category,
        })
        risk.ai_narrative = narrative

    return APIResponse(success=True, data=register.model_dump()).model_dump()


# ══════════════════════════════════════════════════════════════════════
# What-If Simulation
# ══════════════════════════════════════════════════════════════════════

@router.post("/whatif")
async def simulate_whatif(project: ProjectInput, params: WhatIfParams):
    """Calculate cost impact of parameter changes."""
    result = _cost_engine.what_if(project, params)
    return APIResponse(success=True, data=result.model_dump()).model_dump()


# ══════════════════════════════════════════════════════════════════════
# Reverse Planning
# ══════════════════════════════════════════════════════════════════════

@router.post("/reverse")
async def reverse_plan(project: ProjectInput):
    """Generate 3 feasible build configurations for a given budget + deadline."""
    if not project.budget_lakhs or not project.deadline_months:
        raise HTTPException(
            status_code=400,
            detail="budget_lakhs and deadline_months are required for reverse planning",
        )

    result = _reverse_engine.solve(project)

    # Add AI recommendation
    configs_summary = "\n".join(
        f"- {o.label}: {o.feasible_sqft:.0f} sqft, ₹{o.estimated_cost_lakhs}L, "
        f"{o.required_months} months, {'✓ feasible' if o.timeline_feasible else '✗ exceeds deadline'}"
        for o in result.options
    )
    rec = await _gemini.generate("reverse_planning", {
        "budget_lakhs": result.budget_lakhs,
        "city": result.city,
        "configs": configs_summary,
    })
    result.ai_recommendation = rec

    return APIResponse(success=True, data=result.model_dump()).model_dump()


# ══════════════════════════════════════════════════════════════════════
# Delay Cascade
# ══════════════════════════════════════════════════════════════════════

@router.post("/cascade")
async def delay_cascade(project: ProjectInput, cascade_input: DelayCascadeInput):
    """Simulate a delay in one phase and show downstream cascade."""
    schedule = _schedule_engine.generate(project)
    result = _schedule_engine.cascade(project, schedule, cascade_input)
    return APIResponse(success=True, data=result.model_dump()).model_dump()


# ══════════════════════════════════════════════════════════════════════
# Materials
# ══════════════════════════════════════════════════════════════════════

@router.get("/materials/{category}")
async def list_materials(category: str):
    """List all materials in a category."""
    items = _material_engine.list_category(category)
    if not items:
        available = _material_engine.list_categories()
        raise HTTPException(
            status_code=404,
            detail=f"Category '{category}' not found. Available: {available}",
        )
    return APIResponse(success=True, data={"category": category, "materials": [m.model_dump() for m in items]}).model_dump()


@router.post("/materials/swap")
async def swap_materials(category: str, original_id: str, alternative_id: str, project: ProjectInput):
    """Calculate trade-off delta for a material swap."""
    try:
        result = _material_engine.swap(category, original_id, alternative_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Add AI recommendation
    rec = await _gemini.generate("material_reasoning", {
        "city": project.city,
        "project_type": project.project_type.value,
        "from_material": result.original.name,
        "from_is_code": result.original.is_code,
        "to_material": result.alternative.name,
        "to_is_code": result.alternative.is_code,
    })
    result.ai_recommendation = rec

    return APIResponse(success=True, data=result.model_dump()).model_dump()


# ══════════════════════════════════════════════════════════════════════
# AI Copilot
# ══════════════════════════════════════════════════════════════════════

@router.post("/copilot")
async def copilot_chat(req: CopilotRequest):
    """RAG-powered AI construction copilot."""
    context_str = ""
    if req.project_context:
        context_str = _gemini.build_project_context_string(req.project_context)

    reply = await _gemini.generate("copilot", {
        "project_context": context_str or "No active project loaded.",
    })

    # Prepend user message to the prompt for actual generation
    if _gemini.is_available:
        full_prompt = f"User question: {req.message}\n\nProject context:\n{context_str}"
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel("gemini-1.5-flash")
            system_prompt = (
                "You are BuildAtlas AI Copilot — a senior construction expert for Indian projects. "
                "Answer in 3–5 sentences. Cite IS codes when relevant. Use Indian terms (lakh, crore, sqft)."
            )
            raw = model.generate_content(f"{system_prompt}\n\n{full_prompt}")
            if raw and raw.text:
                reply = raw.text.strip()
        except Exception as exc:
            logger.warning("Copilot Gemini call failed: %s", exc)

    # Extract IS code references from reply
    sources: list[str] = []
    import re
    is_refs = re.findall(r"IS\s+\d+[\w:.\- ]*", reply)
    sources.extend(is_refs[:5])

    return APIResponse(
        success=True,
        data=CopilotResponse(
            reply=reply,
            sources=sources,
            ai_generated=_gemini.is_available,
        ).model_dump(),
    ).model_dump()


# ══════════════════════════════════════════════════════════════════════
# AI Report Generator
# ══════════════════════════════════════════════════════════════════════

@router.post("/report")
async def generate_report(project: ProjectInput):
    """Generate a full AI-powered project feasibility report."""
    # Aggregate all engine outputs
    cost = _cost_engine.estimate(project)
    schedule = _schedule_engine.generate(project)
    risk_register = _risk_engine.assess(project)

    # Build rich data context for Gemini
    top_risks = sorted(risk_register.risks, key=lambda r: r.score, reverse=True)[:3]
    risk_summary = "\n".join(
        f"- {r.title}: {r.score}/10 ({r.severity}) — {r.mitigation}"
        for r in top_risks
    )

    project_data = (
        f"Project: {project.project_name}\n"
        f"City: {project.city} | Type: {project.project_type.value} | Floors: {project.floors}\n"
        f"Built-up Area: {project.builtup_sqft} sqft | Quality: {project.quality.value}\n"
        f"Plot: {project.plot_length_ft}x{project.plot_width_ft} ft | Soil: {project.soil_type}\n"
        f"Start: Month {project.start_month}/{project.start_year} | Vastu: {'Yes' if project.vastu else 'No'}\n\n"
        f"COST ESTIMATE:\n"
        f"  P10 (Optimistic): ₹{cost.total.p10:.2f}L\n"
        f"  P50 (Median):     ₹{cost.total.p50:.2f}L\n"
        f"  P90 (Pessimistic): ₹{cost.total.p90:.2f}L\n"
        f"  Cost/sqft (P50):  ₹{cost.cost_per_sqft.p50:.0f}\n"
        f"  Variance Driver:  {cost.variance_driver}\n\n"
        f"SCHEDULE:\n"
        f"  Total Duration:   {schedule.total_months} months ({schedule.total_weeks} weeks)\n"
        f"  Monsoon Lockout:  {schedule.monsoon_lockout_weeks} weeks\n"
        f"  Approval Wait:    {schedule.approval_wait_weeks} weeks\n"
        f"  Critical Path:    {' → '.join(schedule.phases[i].name for i in schedule.critical_path_indices)}\n\n"
        f"TOP RISKS (Overall: {risk_register.overall_score}/10):\n{risk_summary}"
    )

    # Generate report via Gemini
    report_md = await _gemini.generate("project_report", {
        "project_data": project_data,
        "project_name": project.project_name,
    })

    return APIResponse(
        success=True,
        data={
            "report_markdown": report_md,
            "ai_generated": _gemini.is_available,
            "project_name": project.project_name,
        },
    ).model_dump()


# ══════════════════════════════════════════════════════════════════════
# Compliance
# ══════════════════════════════════════════════════════════════════════

@router.post("/compliance")
async def generate_compliance(project: ProjectInput):
    """Generate a regulatory compliance checklist for the project's city."""
    authorities = CITY_APPROVALS.get(project.city, ["Municipal", "RERA"])

    items: list[ChecklistItem] = []
    for auth in authorities:
        for entry in COMPLIANCE_CHECKLIST.get(auth, []):
            items.append(ChecklistItem(**entry))

    # Always include IS code checks
    for entry in COMPLIANCE_CHECKLIST.get("IS_CODES", []):
        items.append(ChecklistItem(**entry))

    # Add CLRA if floors > 1 (contract labour likely)
    if project.floors > 1:
        for entry in COMPLIANCE_CHECKLIST.get("CLRA", []):
            items.append(ChecklistItem(**entry))

    checklist = ComplianceChecklist(
        city=project.city,
        applicable_bodies=authorities + ["IS_CODES"] + (["CLRA"] if project.floors > 1 else []),
        items=items,
        total_items=len(items),
        mandatory_count=sum(1 for i in items if i.mandatory),
    )

    return APIResponse(success=True, data=checklist.model_dump()).model_dump()
