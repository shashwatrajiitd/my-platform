"""
Phase 4 — RAG Streaming API (SSE)

Exposes the Phase 3/4 RAG pipeline as a ChatGPT-like streaming endpoint.
"""

from __future__ import annotations

import json
import os
import threading
import time
from queue import Empty, Queue

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from .ingestion import ingest_from_json
from .pipeline import run_rag_stream
from .schemas import RAGChatRequest
from .vectorstore import VALID_PROFILES, get_collection

router = APIRouter(prefix="/api/rag", tags=["RAG"])


@router.post("/ingest")
async def rag_ingest(profile: str = "all", reset: bool = False):
    """
    Ingest bundled portfolio JSON data into Chroma.

    - profile: one of {developer,recruiter,adventurer,stalker} or "all"
    - reset: best-effort delete known ids before ingesting (idempotent-ish)
    """

    if not (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")):
        raise HTTPException(
            status_code=400,
            detail="Missing GOOGLE_API_KEY (or GEMINI_API_KEY). Needed to compute embeddings during ingest.",
        )

    profiles = list(VALID_PROFILES) if profile == "all" else [profile]
    for p in profiles:
        if p not in VALID_PROFILES:
            raise HTTPException(status_code=400, detail=f"Invalid profile '{p}'.")

    results: dict[str, int] = {}
    for p in profiles:
        chunks, _src = ingest_from_json(p, reset=reset)
        results[p] = int(chunks)

    counts: dict[str, int] = {}
    for p in profiles:
        try:
            counts[p] = int(get_collection(p).count())
        except Exception:
            counts[p] = -1

    return {"ingested_chunks": results, "collection_counts": counts}


@router.post("/chat")
async def rag_chat(req: RAGChatRequest):
    # NOTE: Use a *sync* generator. In practice this flushes the first SSE chunk
    # more reliably in local dev than an async generator (prevents "hang with 200 OK").
    def event_generator():
        def _send(obj: dict) -> str:
            return f"data: {json.dumps(obj)}\n\n"

        # Emit an immediate first event so clients don't appear "stuck"
        # while embeddings / vectorstore / LLM work happens.
        yield _send({"token": "", "done": False})

        # Fail fast if Gemini is not configured.
        if not (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")):
            yield _send(
                {
                    "token": "RAG is not configured: set GOOGLE_API_KEY (or GEMINI_API_KEY) on the API server.",
                    "done": True,
                }
            )
            return

        # Guard against long blocks (network calls / broken SDKs) by running the
        # pipeline in a background thread and streaming from a queue with timeouts.
        q: "Queue[dict]" = Queue()
        done_flag = threading.Event()

        def _runner() -> None:
            try:
                for event in run_rag_stream(req.message, req.profile):
                    q.put(event.model_dump())
            except Exception as e:
                q.put({"token": str(e) or "RAG error", "done": True})
            finally:
                done_flag.set()

        threading.Thread(target=_runner, daemon=True).start()

        first_chunk_deadline = time.monotonic() + 20.0
        total_deadline = time.monotonic() + 45.0
        saw_any = False

        while True:
            now = time.monotonic()
            if now > total_deadline:
                yield _send({"token": "RAG timed out. Check Gemini connectivity / embeddings setup.", "done": True})
                return

            try:
                item = q.get(timeout=0.25)
                saw_any = True
                yield _send(item)
                if item.get("done") is True:
                    return
            except Empty:
                if not saw_any and time.monotonic() > first_chunk_deadline:
                    yield _send(
                        {
                            "token": "RAG is taking too long to respond. Check your internet access, or Retry the query",
                            "done": True,
                        }
                    )
                    return
                if done_flag.is_set() and q.empty():
                    # Pipeline finished without a terminal 'done' event (unexpected).
                    yield _send({"token": "RAG ended unexpectedly.", "done": True})
                    return

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            # Helpful when behind proxies like nginx.
            "X-Accel-Buffering": "no",
        },
    )
