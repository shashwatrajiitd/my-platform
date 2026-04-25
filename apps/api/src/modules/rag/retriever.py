from __future__ import annotations

import functools
import math
from typing import Any, Dict, List

from .embeddings import embed_texts
from .schemas import RetrievedChunk, RetrievalResult
from .vectorstore import get_collection

# ----------------------------
# Phase 2 — Retrieval Config
# ----------------------------

DEFAULT_TOP_K = 5
MAX_TOP_K = 10
MIN_RELEVANCE_SCORE = 0.15


@functools.lru_cache(maxsize=256)
def _embed_query_cached(query: str) -> tuple:
    return tuple(embed_texts([query])[0])


def embed_query(query: str) -> list[float]:
    return list(_embed_query_cached(query))


def query_collection(profile: str, query_embedding: list[float], top_k: int) -> Dict[str, Any]:
    """
    Raw vector search against the profile-specific Chroma collection.

    Returns Chroma's query payload with keys like:
    - ids, documents, metadatas, distances
    """

    collection = get_collection(profile)

    # Prefer explicit include for determinism. Some Chroma 0.4.x builds reject "ids"
    # in include (ids are returned regardless), so fall back safely.
    try:
        return collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances", "ids"],
        )
    except Exception:
        return collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )


def distance_to_score(distance: float) -> float:
    """
    Convert Chroma distance (lower = better) into a bounded relevance score (higher = better).
    """

    # stable, monotonic, bounded in (0, 1]
    return math.exp(-distance)


def retrieve(query: str, profile: str, top_k: int = DEFAULT_TOP_K) -> RetrievalResult:
    """
    Query → embedding → similarity search → normalized, filtered, ranked chunks.
    """

    if not query or not query.strip():
        raise ValueError("query must be a non-empty string")
    if top_k <= 0:
        raise ValueError("top_k must be > 0")

    top_k = min(top_k, MAX_TOP_K)

    query_embedding = embed_query(query)
    raw = query_collection(profile, query_embedding, top_k)

    ids = (raw.get("ids") or [[]])[0]
    docs = (raw.get("documents") or [[]])[0]
    metas = (raw.get("metadatas") or [[]])[0]
    dists = (raw.get("distances") or [[]])[0]

    chunks: List[RetrievedChunk] = []

    n = min(len(ids), len(docs), len(metas), len(dists))
    for i in range(n):
        distance = dists[i]
        # Defensive: if a backend returns None, treat as worst-match.
        if distance is None:
            continue

        score = distance_to_score(float(distance))
        if score < MIN_RELEVANCE_SCORE:
            continue

        chunks.append(
            RetrievedChunk(
                id=str(ids[i]),
                content=str(docs[i]),
                score=float(score),
                metadata=metas[i] if isinstance(metas[i], dict) else {"raw": metas[i]},
            )
        )

    # Guarantee monotonic best-first ordering.
    chunks.sort(key=lambda c: c.score, reverse=True)

    return RetrievalResult(query=query, profile=profile, chunks=chunks)
