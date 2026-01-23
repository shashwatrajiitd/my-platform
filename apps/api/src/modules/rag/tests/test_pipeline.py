from __future__ import annotations

import sys
from pathlib import Path


# Ensure `apps/api` is on sys.path so `import src.*` works when running pytest from repo root.
_API_DIR = Path(__file__).resolve().parents[4]  # .../apps/api
if str(_API_DIR) not in sys.path:
    sys.path.insert(0, str(_API_DIR))


def test_pipeline_smoke(monkeypatch):
    from src.modules.rag import pipeline as p
    from src.modules.rag.schemas import RetrievedChunk, RetrievalResult

    monkeypatch.setattr(
        p,
        "retrieve",
        lambda query, profile: RetrievalResult(
            query=query,
            profile=profile,
            chunks=[
                RetrievedChunk(
                    id="c1",
                    content="I have experience building RAG pipelines.",
                    score=0.9,
                    metadata={"section_title": "Experience"},
                )
            ],
        ),
    )
    monkeypatch.setattr(p, "generate", lambda messages: "Mocked answer")

    answer = p.run_rag(query="What experience do you have?", profile="recruiter")
    assert isinstance(answer, str)
    assert len(answer) > 0


def test_pipeline_handles_empty_retrieval(monkeypatch):
    from src.modules.rag import pipeline as p
    from src.modules.rag.schemas import RetrievalResult

    monkeypatch.setattr(
        p,
        "retrieve",
        lambda query, profile: RetrievalResult(query=query, profile=profile, chunks=[]),
    )

    answer = p.run_rag(query="Anything?", profile="recruiter")
    assert answer == p.NO_CONTEXT_FALLBACK


def test_run_rag_stream_smoke(monkeypatch):
    from src.modules.rag import pipeline as p
    from src.modules.rag.schemas import RetrievedChunk, RetrievalResult

    monkeypatch.setattr(
        p,
        "retrieve",
        lambda query, profile: RetrievalResult(
            query=query,
            profile=profile,
            chunks=[
                RetrievedChunk(
                    id="c1",
                    content="I have experience building RAG pipelines.",
                    score=0.9,
                    metadata={"section_title": "Experience"},
                )
            ],
        ),
    )

    monkeypatch.setattr(p, "generate_stream", lambda _: iter(["Hello", " world"]))

    events = list(p.run_rag_stream("hi", "recruiter"))
    assert any(e.token for e in events)
    assert events[-1].done is True
    assert events[-1].sources is not None

