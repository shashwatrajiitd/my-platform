from __future__ import annotations

import sys
from pathlib import Path

_API_DIR = Path(__file__).resolve().parents[1]  # .../apps/api
if str(_API_DIR) not in sys.path:
    sys.path.insert(0, str(_API_DIR))

from src.modules.rag.pipeline import run_rag


def main():
    query = "What experience do you have?"
    for profile in ["recruiter", "developer", "adventurer", "stalker"]:
        print(f"\n\n===== profile={profile} =====")
        answer = run_rag(query=query, profile=profile)
        print(answer)


if __name__ == "__main__":
    main()