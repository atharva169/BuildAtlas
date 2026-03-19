"""
BuildAtlas GenAI — FastAPI Application Entry Point
CORS-enabled, all routers mounted, health check, error handlers, request logging.
"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router as api_router

# ── Logging ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("buildatlas")


# ── Lifespan (startup / shutdown) ─────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: run startup tasks before yielding."""
    logger.info("🚀 BuildAtlas GenAI backend starting up")
    logger.info("   CORS origins: http://localhost:5173, http://localhost:3000")

    # Future: load FAISS index here
    # from app.ai.gemini_client import GeminiClient
    # gemini = GeminiClient()  # already lazy-loaded in routes

    yield

    logger.info("BuildAtlas GenAI backend shutting down")


# ── App Instance ──────────────────────────────────────────────────────
app = FastAPI(
    title="BuildAtlas GenAI",
    description="Smart Construction Intelligence Platform for India",
    version="1.0.0",
    lifespan=lifespan,
)


# ── CORS Middleware ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://build-atlas.vercel.app", # <-- ADD YOUR EXACT VERCEL DOMAIN HERE!
        "*" # The asterisk acts as a hackathon fail-safe 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request Logging Middleware ────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every request with method, path, and response time."""
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s → %d (%.0fms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response


# ── Mount Router ──────────────────────────────────────────────────────
app.include_router(api_router)


# ── Error Handlers ────────────────────────────────────────────────────
@app.exception_handler(400)
async def bad_request_handler(request: Request, exc):
    """Handle 400 Bad Request."""
    return JSONResponse(
        status_code=400,
        content={"success": False, "data": None, "error": str(exc.detail) if hasattr(exc, "detail") else "Bad request"},
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 Not Found."""
    return JSONResponse(
        status_code=404,
        content={"success": False, "data": None, "error": str(exc.detail) if hasattr(exc, "detail") else "Resource not found"},
    )


@app.exception_handler(422)
async def validation_error_handler(request: Request, exc):
    """Handle 422 Validation Error."""
    return JSONResponse(
        status_code=422,
        content={"success": False, "data": None, "error": f"Validation error: {exc}"},
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Handle 500 Internal Server Error."""
    logger.exception("Internal server error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"success": False, "data": None, "error": "Internal server error"},
    )


# ── Root Redirect ─────────────────────────────────────────────────────
@app.get("/")
async def root():
    """Root endpoint — redirects to docs."""
    return {
        "name": "BuildAtlas GenAI API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }
