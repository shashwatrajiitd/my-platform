from __future__ import annotations

import json
import sys
from pathlib import Path

import httpx
import pytest

# Ensure `apps/api` is on sys.path so `import src.*` works when running pytest from repo root.
_API_DIR = Path(__file__).resolve().parents[4]  # .../apps/api
if str(_API_DIR) not in sys.path:
    sys.path.insert(0, str(_API_DIR))


@pytest.mark.asyncio
async def test_rag_chat_sse_contract(monkeypatch):
    """
    Contract:
    - POST /api/rag/chat returns text/event-stream
    - Body is framed as: data: <json>\n\n per event
    - done=true emitted exactly once
    - sources only emitted on the final done=true event
    """
    from fastapi import FastAPI

    from src.modules.rag.router import router as rag_router
    import src.modules.rag.router as rag_router_module

    class _Evt:
        def __init__(self, payload: dict):
            self._payload = payload

        def model_dump(self):
            return self._payload

    def fake_run_rag_stream(message: str, profile: str):
        yield _Evt({"token": "Hel", "done": False})
        yield _Evt({"token": "lo", "done": False})
        yield _Evt(
            {
                "token": None,
                "sources": [{"id": "c1", "title": "T1", "snippet": "S1"}],
                "done": True,
            }
        )

    monkeypatch.setattr(rag_router_module, "run_rag_stream", fake_run_rag_stream)

    app = FastAPI()
    app.include_router(rag_router)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/rag/chat", json={"message": "hi", "profile": "recruiter"})
        assert res.status_code == 200
        assert res.headers["content-type"].startswith("text/event-stream")

        # Parse SSE blocks
        blocks = [b.strip() for b in res.text.split("\n\n") if b.strip()]
        assert len(blocks) >= 3

        payloads: list[dict] = []
        for b in blocks:
            assert b.startswith("data: ")
            payloads.append(json.loads(b[len("data: ") :]))

        # done exactly once
        assert sum(1 for p in payloads if p.get("done") is True) == 1

        # tokens before done
        for p in payloads[:-1]:
            assert p.get("done") is False
            assert p.get("sources") in (None,)

        # final event has sources + done true
        last = payloads[-1]
        assert last.get("done") is True
        assert isinstance(last.get("sources"), list)
        assert len(last["sources"]) >= 1