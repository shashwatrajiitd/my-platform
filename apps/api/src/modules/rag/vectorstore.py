from __future__ import annotations

import os
from typing import Literal

VALID_PROFILES = ("recruiter", "developer", "adventurer", "stalker")
Profile = Literal["recruiter", "developer", "adventurer", "stalker"]


def _get_persist_dir() -> str:
    # Spec default is local `./chroma` (relative to the process working directory).
    return os.getenv("CHROMA_PERSIST_DIR", "./chroma")


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


def get_collection(profile: str):
    """
    Profile-aware collections for hard isolation.
    """

    if profile not in VALID_PROFILES:
        raise ValueError(f"Invalid profile '{profile}'. Expected one of: {', '.join(VALID_PROFILES)}")

    client = get_client()
    return client.get_or_create_collection(name=f"{profile}_docs")

