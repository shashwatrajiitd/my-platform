from __future__ import annotations

import sys
from pathlib import Path


# Ensure `apps/api` is on sys.path so `import src.*` works when running pytest from repo root.
_API_DIR = Path(__file__).resolve().parents[4]  # .../apps/api
if str(_API_DIR) not in sys.path:
    sys.path.insert(0, str(_API_DIR))


def test_retrieve_basic(monkeypatch):
    """
    Unit test (no external embeddings / no real Chroma IO):
    verifies schema, score normalization, filtering, and required metadata contract.
    """

    from src.modules.rag import retriever as r

    monkeypatch.setattr(r, "embed_query", lambda query: [0.01, 0.02, 0.03])

    def _fake_query_collection(profile: str, query_embedding: list[float], top_k: int):
        assert profile == "recruiter"
        assert isinstance(query_embedding, list)
        assert top_k == 5
        return {
            "ids": [["c1", "c2"]],
            "documents": [["doc1", "doc2"]],
            "metadatas": [[{"section_title": "About"}, {"section_title": "Experience"}]],
            "distances": [[0.0, 2.0]],  # exp(-2) ~= 0.135 < MIN_RELEVANCE_SCORE => filtered
        }

    monkeypatch.setattr(r, "query_collection", _fake_query_collection)

    result = r.retrieve(query="What experience do you have?", profile="recruiter", top_k=5)

    assert result.profile == "recruiter"
    assert result.query == "What experience do you have?"
    assert len(result.chunks) > 0

    for chunk in result.chunks:
        assert chunk.score > 0
        assert chunk.score <= 1
        assert "section_title" in chunk.metadata


def test_retrieve_orders_best_first(monkeypatch):
    from src.modules.rag import retriever as r

    monkeypatch.setattr(r, "embed_query", lambda query: [0.01, 0.02, 0.03])
    monkeypatch.setattr(
        r,
        "query_collection",
        lambda profile, query_embedding, top_k: {
            "ids": [["a", "b", "c"]],
            "documents": [["A", "B", "C"]],
            "metadatas": [[{"section_title": "tA"}, {"section_title": "tB"}, {"section_title": "tC"}]],
            "distances": [[1.5, 0.1, 0.7]],  # out of order distances
        },
    )

    result = r.retrieve(query="q", profile="recruiter", top_k=5)
    scores = [c.score for c in result.chunks]
    assert scores == sorted(scores, reverse=True)


def test_retrieve_caps_top_k(monkeypatch):
    from src.modules.rag import retriever as r

    monkeypatch.setattr(r, "embed_query", lambda query: [0.01, 0.02, 0.03])

    seen = {"top_k": None}

    def _fake_query_collection(profile: str, query_embedding: list[float], top_k: int):
        seen["top_k"] = top_k
        return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

    monkeypatch.setattr(r, "query_collection", _fake_query_collection)

    r.retrieve(query="q", profile="recruiter", top_k=10_000)
    assert seen["top_k"] == r.MAX_TOP_K

