from __future__ import annotations

import functools
import os
from typing import Literal

from .embeddings import EMBEDDING_MODEL

VALID_PROFILES = ("recruiter", "developer", "adventurer", "stalker")
Profile = Literal["recruiter", "developer", "adventurer", "stalker"]


def _get_persist_dir() -> str:
    # Spec default is local `./chroma` (relative to the process working directory).
    return os.getenv("CHROMA_PERSIST_DIR", "./chroma")


@functools.lru_cache(maxsize=1)
def get_client():
    """
    Chroma persistent client (file-backed).
    Kept in a function to avoid import-time failures when deps aren't installed yet.
    """

    # Chroma 0.4.18 expects the old posthog-python `capture(distinct_id, event, properties)` API.
    # Some environments pull in newer `posthog` (e.g. 7.x) where `capture(event, **kwargs)`:
    # monkeypatch a compat shim to avoid noisy TypeErrors in telemetry code paths.
    try:
        import inspect
        import posthog  # type: ignore

        _orig_capture = getattr(posthog, "capture", None)
        if callable(_orig_capture):
            sig = str(inspect.signature(_orig_capture))
            if sig.startswith("(event:") or sig.startswith("(event,") or sig.startswith("(event "):
                # Newer posthog SDKs don't support Chroma's expected positional signature.
                # We don't need telemetry here, so make it a safe no-op.
                def _compat_capture(distinct_id, event, properties=None, *args, **kwargs):
                    return None

                posthog.capture = _compat_capture  # type: ignore[assignment]
    except Exception:
        pass

    import chromadb  # type: ignore
    from chromadb.config import Settings  # type: ignore

    # Disable Chroma telemetry by default to avoid noisy warnings and keep dev deterministic.
    # If explicitly set, respect the env var.
    raw = os.getenv("ANONYMIZED_TELEMETRY")
    anonymized = False if raw is None else raw.strip().lower() in ("1", "true", "yes", "y")

    return chromadb.PersistentClient(
        path=_get_persist_dir(),
        settings=Settings(anonymized_telemetry=anonymized),
    )


@functools.lru_cache(maxsize=4)
def get_collection(profile: str):
    """
    Profile-aware collections for hard isolation.
    """

    if profile not in VALID_PROFILES:
        raise ValueError(f"Invalid profile '{profile}'. Expected one of: {', '.join(VALID_PROFILES)}")

    client = get_client()
    name = f"{profile}_docs"

    # Store the embedding model used to build this collection so future upgrades
    # can detect mismatches and force a rebuild.
    desired_metadata = {"embedding_model": EMBEDDING_MODEL}

    # Prefer fetching first so we can read metadata (if present).
    try:
        col = client.get_collection(name=name)
        meta = getattr(col, "metadata", None) or {}
        if isinstance(meta, dict) and meta.get("embedding_model") == EMBEDDING_MODEL:
            return col
        # If metadata is missing or mismatched, we keep the existing collection.
        # Rebuilds are handled explicitly via `recreate_collection()` (used by `--reset` ingest).
        return col
    except Exception:
        # Collection doesn't exist yet: create with metadata.
        return client.get_or_create_collection(name=name, metadata=desired_metadata)


def recreate_collection(profile: str):
    """
    Delete and recreate the profile collection.

    This is required when changing embedding models, because Chroma collections
    are dimension-fixed after the first insert.
    """

    if profile not in VALID_PROFILES:
        raise ValueError(f"Invalid profile '{profile}'. Expected one of: {', '.join(VALID_PROFILES)}")

    client = get_client()
    name = f"{profile}_docs"
    try:
        client.delete_collection(name=name)
    except Exception:
        pass

    get_collection.cache_clear()
    return client.get_or_create_collection(name=name, metadata={"embedding_model": EMBEDDING_MODEL})

