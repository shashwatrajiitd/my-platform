"""
Phase 4 — RAG Streaming API (SSE)

Exposes the Phase 3/4 RAG pipeline as a ChatGPT-like streaming endpoint.
"""

from __future__ import annotations

import json
import os

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from .pipeline import run_rag_stream
from .schemas import RAGChatRequest

router = APIRouter(prefix="/api/rag", tags=["RAG"])


@router.post("/chat")
async def rag_chat(req: RAGChatRequest):
    async def event_generator():
        # Emit an immediate first event so clients don't appear "stuck"
        # while embeddings / vectorstore / LLM work happens.
        yield f"data: {json.dumps({'token': '', 'done': False})}\n\n"

        # Fail fast if Gemini is not configured (otherwise the stream can hang
        # before the first meaningful token is produced).
        if not (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")):
            yield f"data: {json.dumps({'token': 'RAG is not configured: set GOOGLE_API_KEY (or GEMINI_API_KEY) on the API server.', 'done': True})}\n\n"
            return

        try:
            for event in run_rag_stream(req.message, req.profile):
                yield f"data: {json.dumps(event.model_dump())}\n\n"
        except Exception as e:
            # Never let the SSE connection hang on server-side errors.
            msg = str(e) or "RAG error"
            yield f"data: {json.dumps({'token': msg, 'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
