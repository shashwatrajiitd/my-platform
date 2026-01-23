"""
Phase 4 — Gemini LLM Wrapper (streaming)

Isolated so streaming can be swapped in without touching prompt logic.
"""

from __future__ import annotations

import os
from typing import Any, Dict, Iterator, List, Optional

import google.generativeai as genai

from .llm import _extract_system_text, _to_gemini_contents

MODEL = "gemini-3-flash-preview"


def generate_stream(messages: List[Dict[str, Any]]) -> Iterator[str]:
    """
    Stream Gemini output as text chunks.

    Requires `GOOGLE_API_KEY` in environment (or any mechanism supported by google-generativeai).
    """

    api_key: Optional[str] = os.getenv("GOOGLE_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)

    system_instruction = _extract_system_text(messages)
    contents = _to_gemini_contents(messages)

    # Mirror Phase 3 behavior: fold system text into the first user turn.
    if system_instruction:
        if contents:
            first = contents[0]
            parts = first.get("parts") or []
            parts = [{"text": f"{system_instruction}\n\n"}] + parts
            first["parts"] = parts
            contents[0] = first
        else:
            contents = [{"role": "user", "parts": [{"text": system_instruction}]}]

    model = genai.GenerativeModel(MODEL)
    stream = model.generate_content(contents, stream=True)

    for chunk in stream:
        text = getattr(chunk, "text", None)
        if text:
            yield text

