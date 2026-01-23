from src.modules.rag.vectorstore import get_collection

for profile in ["recruiter", "developer", "adventurer", "stalker"]:
    col = get_collection(profile)
    try:
        n = col.count()
    except Exception as e:
        print(profile, "count() failed:", e)
        continue

    print(f"{profile}: {n} docs")

    if n:
        sample = col.get(limit=min(3, n), include=["documents", "metadatas"])
        print("  sample ids:", sample.get("ids", [])[:3])
        print("  sample titles:", [m.get("section_title") for m in (sample.get("metadatas") or [])][:3])

        