from __future__ import annotations

import functools
import os
import socket
import time
from typing import List
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

# Gemini embedding model.
# NOTE: If you change this, you MUST recreate the vector store (collection) and re-embed docs,
# because Chroma collections are dimension-fixed after first insert.
#
# This repo uses google-generativeai (Gemini API, v1beta) which exposes embeddings as:
# - models/gemini-embedding-001
EMBEDDING_MODEL = "models/gemini-embedding-001"


def _extract_embedding(obj) -> List[float] | None:
    """
    Normalize a single embedding payload to a flat list[float].

    The google-generativeai SDK has returned multiple shapes across versions:
    - {"embedding": [..floats..]}
    - {"embedding": {"values": [..floats..]}}
    - {"values": [..floats..]}
    - response objects with .embedding / .embeddings attributes
    """

    if obj is None:
        return None

    # Flat vector already.
    if isinstance(obj, list) and (not obj or isinstance(obj[0], (int, float))):
        return obj  # type: ignore[return-value]

    # Nested dict shapes.
    if isinstance(obj, dict):
        if "values" in obj:
            return _extract_embedding(obj.get("values"))
        if "embedding" in obj:
            return _extract_embedding(obj.get("embedding"))
        if "vector" in obj:
            return _extract_embedding(obj.get("vector"))
        return None

    # Response objects.
    maybe = getattr(obj, "values", None)
    if isinstance(maybe, list):
        return _extract_embedding(maybe)

    maybe = getattr(obj, "embedding", None)
    if maybe is not None:
        return _extract_embedding(maybe)

    return None


@functools.lru_cache(maxsize=1)
def _configure_genai():
    """
    Lazy configure to avoid import-time side effects.
    Requires GOOGLE_API_KEY to be set in the environment.
    """

    # Load local env file for CLI usage (e.g., `apps/api/.env`) if present.
    # This is intentionally best-effort: production should use real env vars/secret managers.
    try:
        from dotenv import load_dotenv  # type: ignore

        load_dotenv()
    except Exception:
        pass

    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "Missing GOOGLE_API_KEY (or GEMINI_API_KEY). "
            "Set it to use Gemini embeddings."
        )

    # google-generativeai SDK
    import google.generativeai as genai  # type: ignore

    genai.configure(api_key=api_key)
    return genai


def embed_texts(texts: List[str]) -> List[List[float]]:
    """
    Embed a batch of texts using Gemini embeddings.

    Notes:
    - This is intentionally isolated so the retriever stays model-agnostic.
    - The SDK's response shape has varied over time, so we normalize to
      List[List[float]] here.
    """

    if not texts:
        return []

    genai = _configure_genai()

    # Avoid indefinite hangs: allow an explicit timeout via env var.
    # google-generativeai methods typically accept `request_options={"timeout": <seconds>}`.
    timeout_s_raw = os.getenv("RAG_EMBED_TIMEOUT_S", "60").strip()
    try:
        timeout_s = float(timeout_s_raw)
    except Exception:
        timeout_s = 60.0

    debug = os.getenv("RAG_EMBED_DEBUG", "").strip().lower() in ("1", "true", "yes", "y")
    t0 = time.time()

    # Ensure low-level sockets don't hang forever (DNS/TCP/SSL handshakes).
    # This is process-global, but this CLI is single-purpose; it's a pragmatic safety net.
    socket.setdefaulttimeout(timeout_s)

    def _call_embed():
        # In the google-generativeai SDK, embed_content supports batch content.
        try:
            return genai.embed_content(
                model=EMBEDDING_MODEL,
                content=texts,
                request_options={"timeout": timeout_s},
            )
        except TypeError:
            # Older SDK versions may not support request_options; fall back.
            return genai.embed_content(model=EMBEDDING_MODEL, content=texts)

    # Hard timeout: even if the SDK ignores request_options, do not hang forever.
    # Note: we can't forcibly kill the underlying call, but we can at least surface
    # a clear error quickly.
    with ThreadPoolExecutor(max_workers=1) as ex:
        fut = ex.submit(_call_embed)
        try:
            response = fut.result(timeout=timeout_s + 5)
        except FutureTimeoutError as e:
            raise RuntimeError(
                "Embedding request timed out. This usually means network/SSL/proxy/DNS issues "
                "or the Generative Language API endpoint is blocked. "
                "Try: (1) VPN off/on, (2) different network, (3) ensure outbound HTTPS to "
                "generativelanguage.googleapis.com works, (4) reduce RAG_EMBED_TIMEOUT_S."
            ) from e

    if debug:
        dt = time.time() - t0
        print(f"[embed] batch={len(texts)} timeout_s={timeout_s} elapsed_s={dt:.2f}")

    # Normalize common response shapes.
    if isinstance(response, dict):
        # google-generativeai 0.3.x batch shape:
        # {"embedding": [[...],[...],...]}
        emb_field = response.get("embedding")
        if isinstance(emb_field, list):
            # Batch: list of vectors
            if emb_field and isinstance(emb_field[0], list):
                if not emb_field[0] or isinstance(emb_field[0][0], (int, float)):
                    return emb_field  # type: ignore[return-value]
            # Single: one vector
            if emb_field and isinstance(emb_field[0], (int, float)):
                return [emb_field]  # type: ignore[list-item]

        # Single embedding style.
        single = _extract_embedding(response.get("embedding")) or _extract_embedding(response.get("vector"))
        if single is not None:
            return [single]

        # Batch styles.
        for key in ("embeddings", "data", "results"):
            items = response.get(key)
            if isinstance(items, list):
                out: List[List[float]] = []
                for item in items:
                    emb = _extract_embedding(item)
                    if emb is not None:
                        out.append(emb)
                if out:
                    return out

    # Fallback: try attribute-based response objects.
    embeddings = getattr(response, "embeddings", None)
    if embeddings is not None:
        out = []
        for item in embeddings:
            emb = _extract_embedding(item)
            out.append(emb if emb is not None else item)
        return out

    # Some SDK versions return a single embedding object at `.embedding`.
    single_obj = getattr(response, "embedding", None)
    single = _extract_embedding(single_obj)
    if single is not None:
        return [single]

    raise RuntimeError(f"Unexpected embed_content response shape: {type(response)}")

