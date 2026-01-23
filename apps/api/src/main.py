"""
FastAPI Backend - Main Application Entry Point

TODO: Add middleware, CORS, rate limiting, etc.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.modules.code_runner.router import router as code_runner_router
from src.modules.rag.router import router as rag_router

# Best-effort load of `apps/api/.env` so local development works even when
# uvicorn is launched from the repo root (common in monorepos).
try:
    from dotenv import load_dotenv  # type: ignore

    api_root = Path(__file__).resolve().parents[1]  # .../apps/api
    load_dotenv(api_root / ".env")
except Exception:
    pass

app = FastAPI(
    title="Portfolio API",
    description="Backend API for portfolio application",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Module routers
# Note: code_runner router owns its `/api/code` prefix (Phase-1 requirement).
app.include_router(code_runner_router)
app.include_router(rag_router)


@app.get("/")
async def root():
    return {
        "message": "Portfolio API",
        "version": "1.0.0",
        "status": "operational",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
