"""
FastAPI Backend - Main Application Entry Point

TODO: Add middleware, CORS, rate limiting, etc.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
import logging
from src.modules.code_runner.router import router as code_runner_router
from src.modules.rag.ingestion import ingest_from_json
from src.modules.rag.vectorstore import VALID_PROFILES, get_collection
from src.modules.rag.router import router as rag_router

# Best-effort load of `apps/api/.env` so local development works even when
# uvicorn is launched from the repo root (common in monorepos).
try:
    from dotenv import load_dotenv  # type: ignore

    api_root = Path(__file__).resolve().parents[1]  # .../apps/api
    load_dotenv(api_root / ".env")
except Exception:
    pass

logger = logging.getLogger(__name__)

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


@app.on_event("startup")
def _rag_auto_ingest_if_needed() -> None:
    """
    Best-effort auto-ingest of bundled portfolio data into Chroma.

    Why: in Docker we store Chroma in a named volume (recommended for SQLite),
    which starts empty on first run. Without ingestion, retrieval returns zero
    chunks and RAG falls back with "I don't have enough information".
    """

    import os

    raw = os.getenv("RAG_AUTO_INGEST", "1").strip().lower()
    if raw in ("0", "false", "no", "off"):
        logger.info("RAG auto-ingest disabled via RAG_AUTO_INGEST=%r", raw)
        return

    if not (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")):
        logger.warning("RAG auto-ingest skipped: GOOGLE_API_KEY/GEMINI_API_KEY not set.")
        return

    for profile in VALID_PROFILES:
        try:
            col = get_collection(profile)
            if col.count() > 0:
                continue
        except Exception as e:
            logger.warning("RAG collection count failed for %s: %s", profile, str(e))

        try:
            chunks, _src = ingest_from_json(profile, reset=False)
            logger.info("RAG auto-ingest complete: profile=%s chunks=%s", profile, chunks)
        except Exception as e:
            logger.exception("RAG auto-ingest failed for profile=%s: %s", profile, str(e))


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
