from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Tuple

from .embeddings import embed_texts
from .vectorstore import get_collection


DEFAULT_CHUNK_TOKENS = 250
DEFAULT_CHUNK_OVERLAP_TOKENS = 30


def _tokenize(text: str) -> List[str]:
    # Simple token approximation (word-ish tokens). Phase 1 focuses on stability.
    return re.findall(r"\S+", text or "")


def _detokenize(tokens: List[str]) -> str:
    return " ".join(tokens).strip()


def chunk_text(
    text: str,
    chunk_tokens: int = DEFAULT_CHUNK_TOKENS,
    overlap_tokens: int = DEFAULT_CHUNK_OVERLAP_TOKENS,
) -> List[str]:
    """
    Chunk by semantic boundaries first (paragraphs), then enforce token windowing.
    Token counting is approximated by whitespace tokens (good enough for stable behavior).
    """

    if not text or not text.strip():
        return []
    if chunk_tokens <= 0:
        raise ValueError("chunk_tokens must be > 0")
    if overlap_tokens < 0:
        raise ValueError("overlap_tokens must be >= 0")
    if overlap_tokens >= chunk_tokens:
        raise ValueError("overlap_tokens must be < chunk_tokens")

    paragraphs = [p.strip() for p in re.split(r"\n\s*\n+", text.strip()) if p.strip()]

    chunks: List[str] = []
    buf_tokens: List[str] = []

    def flush():
        nonlocal buf_tokens
        if not buf_tokens:
            return
        chunks.append(_detokenize(buf_tokens))
        # start next buffer with overlap
        if overlap_tokens:
            buf_tokens = buf_tokens[-overlap_tokens:]
        else:
            buf_tokens = []

    for para in paragraphs:
        ptoks = _tokenize(para)
        if not ptoks:
            continue

        # If paragraph alone is too large, split it directly.
        if len(ptoks) > chunk_tokens:
            # flush whatever we have before splitting huge para
            flush()
            start = 0
            while start < len(ptoks):
                end = min(start + chunk_tokens, len(ptoks))
                chunks.append(_detokenize(ptoks[start:end]))
                if end == len(ptoks):
                    break
                start = max(0, end - overlap_tokens)
            buf_tokens = []
            continue

        # If adding this paragraph would overflow, flush first.
        if buf_tokens and len(buf_tokens) + len(ptoks) > chunk_tokens:
            flush()

        # Add paragraph tokens. (We drop explicit newlines to keep token logic simple/stable.)
        buf_tokens += ptoks

        if len(buf_tokens) >= chunk_tokens:
            flush()

    flush()
    # Final cleanup: drop any empty artifacts.
    return [c for c in (c.strip() for c in chunks) if c]


def _data_dir() -> Path:
    return Path(__file__).parent / "data"


def load_profile_source(profile: str) -> Dict[str, Any]:
    path = _data_dir() / f"{profile}.json"
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def ingest_profile(
    profile: str,
    sections: List[Dict[str, Any]],
    *,
    chunk_tokens: int = DEFAULT_CHUNK_TOKENS,
    overlap_tokens: int = DEFAULT_CHUNK_OVERLAP_TOKENS,
    batch_size: int = 64,
    reset: bool = False,
) -> int:
    """
    Ingest a single profile's sections into its dedicated Chroma collection.

    Returns the number of chunks ingested.
    """

    collection = get_collection(profile)

    documents: List[str] = []
    metadatas: List[Dict[str, Any]] = []
    ids: List[str] = []

    for section in sections:
        section_id = str(section.get("id", "")).strip()
        section_title = str(section.get("title", "")).strip()
        content = str(section.get("content", "")).strip()
        if not section_id or not content:
            continue

        chunks = chunk_text(content, chunk_tokens=chunk_tokens, overlap_tokens=overlap_tokens)
        for i, chunk in enumerate(chunks):
            documents.append(chunk)
            metadatas.append(
                {
                    "profile": profile,
                    "section_id": section_id,
                    "section_title": section_title,
                }
            )
            ids.append(f"{profile}_{section_id}_{i}")

    if reset and ids:
        # Best-effort delete; some Chroma versions require ids only.
        try:
            collection.delete(ids=ids)
        except Exception:
            pass

    # Embed + add in batches to avoid SDK limits.
    total = 0
    for i in range(0, len(documents), batch_size):
        docs_batch = documents[i : i + batch_size]
        meta_batch = metadatas[i : i + batch_size]
        ids_batch = ids[i : i + batch_size]

        embeddings = embed_texts(docs_batch)
        if len(embeddings) != len(docs_batch):
            raise RuntimeError(
                f"Embedding count mismatch: got {len(embeddings)} embeddings for {len(docs_batch)} documents"
            )

        # Prefer upsert for idempotency, fall back to add.
        if hasattr(collection, "upsert"):
            collection.upsert(
                documents=docs_batch,
                embeddings=embeddings,
                metadatas=meta_batch,
                ids=ids_batch,
            )
        else:
            collection.add(
                documents=docs_batch,
                embeddings=embeddings,
                metadatas=meta_batch,
                ids=ids_batch,
            )

        total += len(docs_batch)

    return total


def ingest_from_json(profile: str, *, reset: bool = False) -> Tuple[int, Dict[str, Any]]:
    src = load_profile_source(profile)
    sections = src.get("sections") or []
    if not isinstance(sections, list):
        raise ValueError("Invalid source JSON: `sections` must be a list")

    count = ingest_profile(profile, sections, reset=reset)
    return count, src

