"""
Phase 3 — Gemini LLM Wrapper (non-streaming)

Isolated so streaming + tooling can be swapped in Phase 4 without touching prompt logic.
"""

from __future__ import annotations

import functools
import os
from typing import Any, Dict, List, Optional

MODEL = "gemini-3-flash-preview"


@functools.lru_cache(maxsize=1)
def _get_model(model_name: str = MODEL):
    import google.generativeai as genai  # type: ignore

    api_key: Optional[str] = os.getenv("GOOGLE_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
    return genai.GenerativeModel(model_name)


def _extract_system_text(messages: List[Dict[str, Any]]) -> str:
    return "\n\n".join([m.get("content", "") for m in messages if m.get("role") == "system"]).strip()


def _to_gemini_contents(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Convert our simple {role, content} format into Gemini SDK `contents`.
    Gemini only supports roles like 'user' and 'model' in contents; system is handled separately.
    """

    contents: list[dict] = []
    for m in messages:
        role = m.get("role")
        if role == "system":
            continue
        if role == "assistant":
            gemini_role = "model"
        else:
            gemini_role = "user"
        contents.append({"role": gemini_role, "parts": [{"text": str(m.get("content", ""))}]})
    return contents


def generate(messages: List[Dict[str, Any]], model_name: str = MODEL) -> str:
    system_instruction = _extract_system_text(messages)
    contents = _to_gemini_contents(messages)

    if system_instruction:
        if contents:
            first = contents[0]
            parts = first.get("parts") or []
            parts = [{"text": f"{system_instruction}\n\n"}] + parts
            first["parts"] = parts
            contents[0] = first
        else:
            contents = [{"role": "user", "parts": [{"text": system_instruction}]}]

    model = _get_model(model_name)
    response = model.generate_content(contents)
    return getattr(response, "text", "") or ""

