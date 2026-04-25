"""
Phase 4 — Gemini LLM Wrapper (streaming)

Isolated so streaming can be swapped in without touching prompt logic.
"""

from __future__ import annotations

from typing import Any, Dict, Iterator, List

from .llm import _extract_system_text, _to_gemini_contents, _get_model, MODEL


def generate_stream(messages: List[Dict[str, Any]]) -> Iterator[str]:
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

    model = _get_model(MODEL)
    stream = model.generate_content(contents, stream=True)

    for chunk in stream:
        text = getattr(chunk, "text", None)
        if text:
            yield text

