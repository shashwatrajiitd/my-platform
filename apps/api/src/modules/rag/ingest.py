from __future__ import annotations

import argparse
import json
from typing import List

from .embeddings import embed_texts
from .ingestion import ingest_from_json
from .vectorstore import get_collection


VALID_PROFILES: List[str] = ["recruiter", "developer", "adventurer", "stalker"]


def main() -> int:
    parser = argparse.ArgumentParser(description="Ingest portfolio documents into Chroma (per-profile).")
    parser.add_argument("--profile", choices=VALID_PROFILES, help="Ingest a single profile")
    parser.add_argument("--all", action="store_true", help="Ingest all profiles")
    parser.add_argument("--reset", action="store_true", help="Best-effort reset (delete known ids) before ingesting")
    parser.add_argument(
        "--batch-size",
        type=int,
        default=64,
        help="Embedding batch size (smaller can be more reliable if requests are slow).",
    )
    parser.add_argument("--verbose", action="store_true", help="Print progress while embedding/ingesting")
    parser.add_argument(
        "--sanity-query",
        default="What experience do you have?",
        help="Run a post-ingest similarity query (requires embeddings to work)",
    )
    parser.add_argument("--top-k", type=int, default=3, help="Top-K results for sanity query")
    args = parser.parse_args()

    profiles = VALID_PROFILES if args.all or not args.profile else [args.profile]

    total_chunks = 0
    for profile in profiles:
        count, src = ingest_from_json(
            profile,
            reset=args.reset,
            batch_size=args.batch_size,
            verbose=args.verbose,
        )
        total_chunks += count
        print(f"[ingest] profile={profile} sections={len(src.get('sections', []))} chunks={count}")

    if args.sanity_query:
        # Simple validation: embed query then query the profile collection (no LLM).
        profile = profiles[0]
        q_emb = embed_texts([args.sanity_query])[0]
        col = get_collection(profile)
        res = col.query(
            query_embeddings=[q_emb],
            n_results=args.top_k,
            # Chroma 0.4.x doesn't allow "ids" in include (ids are returned regardless).
            include=["documents", "metadatas", "distances"],
        )
        print(f"\n[sanity] profile={profile} query={args.sanity_query!r}\n")
        print(json.dumps(res, indent=2, ensure_ascii=False))

    print(f"\nDone. Total chunks ingested: {total_chunks}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

