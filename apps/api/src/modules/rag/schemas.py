from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel


class RAGChatRequest(BaseModel):
    # User input
    message: str
    # recruiter | developer | adventurer | stalker
    profile: Literal["recruiter", "developer", "adventurer", "stalker"]
    # Enables future memory
    conversation_id: Optional[str] = None


class RAGSource(BaseModel):
    id: str
    title: str
    snippet: str


class RAGStreamEvent(BaseModel):
    # One token or text chunk
    token: Optional[str] = None
    # Only sent once at end
    sources: Optional[List[RAGSource]] = None
    # Signals completion
    done: bool = False


# ----------------------------
# Phase 2 — Retrieval Schemas
# ----------------------------


class RetrievedChunk(BaseModel):
    id: str
    content: str
    score: float  # normalized relevance score (higher = better)
    metadata: dict  # profile, section_id, section_title


class RetrievalResult(BaseModel):
    query: str
    profile: str
    chunks: List[RetrievedChunk]

