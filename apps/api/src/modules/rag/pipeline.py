"""
Phase 3 — RAG Pipeline Orchestration (non-streaming, no API endpoints yet)

retrieval → prompt → LLM
"""

from __future__ import annotations

from typing import Iterator

from .llm import generate
from .llm_stream import generate_stream
from .prompts import build_prompt
from .retriever import retrieve
from .schemas import RAGSource, RAGStreamEvent


NO_CONTEXT_FALLBACK = "I don’t have enough information to answer that."


def run_rag(query: str, profile: str) -> str:
    """
    Entry point for Phase 3.

    - Uses deterministic retrieval from Phase 2
    - Builds a profile-aware, context-grounded prompt
    - Invokes Gemini (non-streaming)
    """

    retrieval = retrieve(query, profile)

    if not retrieval.chunks:
        return NO_CONTEXT_FALLBACK

    prompt = build_prompt(retrieval)
    return generate(prompt)


def run_rag_stream(query: str, profile: str) -> Iterator[RAGStreamEvent]:
    """
    Phase 4 streaming entry point.

    Yields `RAGStreamEvent` objects suitable for SSE framing.
    """

    retrieval = retrieve(query, profile)

    if not retrieval.chunks:
        yield RAGStreamEvent(token=NO_CONTEXT_FALLBACK, done=True)
        return

    prompt = build_prompt(retrieval)

    for token in generate_stream(prompt):
        yield RAGStreamEvent(token=token)

    sources: list[RAGSource] = []
    for chunk in retrieval.chunks:
        sources.append(
            RAGSource(
                id=chunk.id,
                title=str(chunk.metadata.get("section_title", "") or ""),
                snippet=chunk.content[:200],
            )
        )

    yield RAGStreamEvent(sources=sources, done=True)


# Back-compat: keep the earlier stub class shape in case anything imports it.
class RAGPipeline:
    def retrieve(self, query: str, top_k: int = 5):
        return retrieve(query=query, profile="recruiter", top_k=top_k)  # legacy placeholder

    def generate(self, query: str, context):
        raise NotImplementedError("Use run_rag() in Phase 3.")
