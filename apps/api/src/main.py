"""
FastAPI Backend - Main Application Entry Point

TODO: Add middleware, CORS, rate limiting, etc.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.modules.code_runner.router import router as code_runner_router
from src.modules.rag.router import router as rag_router

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
