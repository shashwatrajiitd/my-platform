# Quick Start Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Python >= 3.10 (for backend)
 - Optional: Docker (only if using `CODE_EXECUTOR_MODE=docker`)

## Initial Setup

```bash
# Install root dependencies
npm install

# (Optional) Install backend deps directly (recommended for API dev)
cd apps/api
pip install -r requirements.txt
cd ../..
```

## Development

### Start Frontend Only

```bash
cd apps/web
npm run dev
```

Frontend will be available at http://localhost:3000

### Start Backend Only

```bash
cd apps/api
uvicorn src.main:app --reload
```

Backend will be available at http://localhost:8000

### Start Both (Recommended)

From root directory:

```bash
npm run dev
```

This uses Turbo to run both frontend and backend concurrently.

## RAG setup (local)

RAG uses **ChromaDB** (local persistent storage) + **Gemini** (embeddings + generation).

1) Create `apps/api/.env`:

```bash
GOOGLE_API_KEY=...
CHROMA_PERSIST_DIR=./chroma
```

2) Ingest profile knowledge into Chroma:

```bash
cd apps/api
python -m src.modules.rag.ingest --all --reset
```

## Building

```bash
# Build all packages and apps
npm run build

# Build frontend only
cd apps/web
npm run build

# Build backend only
cd apps/api
# Backend doesn't require build step (Python)
```

## Project Structure

- `apps/web/` - Next.js frontend
- `apps/api/` - FastAPI backend
- `packages/` - Shared packages
- `infra/` - Infrastructure configs

## Docs

- `docs/ARCHITECTURE.md` — system design + diagrams
- `docs/RAG.md` — ingestion/retrieval/generation/streaming
- `docs/CODE_RUNNER.md` — security model + SSE protocol
- `docs/FRONTEND.md` — profiles + IDE + drag UI
