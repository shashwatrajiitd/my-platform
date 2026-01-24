# Documentation

This repo is intentionally documented around **system design and architecture** (not migration notes).

## Project status (important)

**Recruiter profile is currently the only up-to-date experience.** The other profiles (`developer`, `adventurer`, `stalker`) are still under active development and may be incomplete or inconsistent.

## Contents

- `ARCHITECTURE.md` — monorepo architecture + service boundaries (with diagrams)
- `DETAILED_SYSTEM_DESIGN.md` — end-to-end deep dive (RAG + Python runner + UI/UX) with diagrams and contracts
- `RAG.md` — ingestion → retrieval → prompt → streaming generation (SSE), plus contracts
- `CODE_RUNNER.md` — Python execution engine, safety model, executor modes, SSE protocol
- `FRONTEND.md` — Next.js app structure, profile architecture, Python IDE/terminal UI, drag-to-scroll UI

