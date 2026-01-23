"""
Phase 4 — RAG Streaming API (SSE)

Exposes the Phase 3/4 RAG pipeline as a ChatGPT-like streaming endpoint.
"""

from __future__ import annotations

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from .pipeline import run_rag_stream
from .schemas import RAGChatRequest

router = APIRouter(prefix="/api/rag", tags=["RAG"])


@router.post("/chat")
async def rag_chat(req: RAGChatRequest):
    async def event_generator():
        for event in run_rag_stream(req.message, req.profile):
            yield f"data: {json.dumps(event.model_dump())}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
