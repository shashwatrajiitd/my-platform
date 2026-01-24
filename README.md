# Portfolio Netflix (Monorepo)

A Netflix-style, profile-driven portfolio with a **streaming RAG assistant**, a **browser-based Python IDE + streaming terminal**, and a **security-first code execution backend**.

## Project status (important)

**Recruiter profile is currently the only up-to-date experience.** The other profiles (`developer`, `adventurer`, `stalker`) are still under active development and may be incomplete or inconsistent.

## Snapshots

### Recruiter profile (current / up-to-date)

![Recruiter profile](https://drive.google.com/uc?export=view&id=1ZNtsF7T_FTxQFQ-6KCdB2gu1JfbryGlQ)

### AI assistant (RAG) — Recruiter profile only (currently)

![AI assistant (RAG)](https://drive.google.com/uc?export=view&id=1euHxEtyo0IsAu2EpFZfl_w2jLKfyqyt8)

### Python IDE + Terminal — Developer profile only (currently)

![Python IDE + Terminal](https://drive.google.com/uc?export=view&id=1R-AWAtYO15YiYph323TJzrI9LZiyIMVv)

## What’s inside

- **Profiles**: `developer`, `recruiter`, `stalker`, `adventurer` — redesigned layouts + richer content.
- **Python IDE + Terminal**: Monaco editor + terminal UI that streams stdout/stderr over **SSE**.
- **RAG Assistant (SSE)**: Profile-aware, grounded answers backed by **ChromaDB** + **Gemini** (embeddings + generation).
- **Drag interactions**: Netflix carousel supports **drag-to-scroll** via a custom draggable scrollbar.

## Architecture (high level)

```mermaid
flowchart LR
  U["User Browser"] -->|Next.js App Router| W["apps/web"]
  W -->|SSE: /api/rag/chat| API["apps/api<br/>(FastAPI)"]
  W -->|SSE: /api/code/run/stream| API
  API -->|retrieve| VS[(ChromaDB<br/>per-profile collections)]
  API -->|stream tokens| LLM["Gemini LLM"]
  API -->|embed| EMB["Gemini Embeddings"]
  API -->|execute code| EXE["Executor<br/>local or docker"]
```

### RAG architecture diagram

![RAG architecture diagram](https://drive.google.com/uc?export=view&id=19MEc26WQ2_q99Yu-AhQNRYrTQfS_lsRg)

## Repo layout

```
portfolio-netflix/
├── apps/
│   ├── web/          # Next.js frontend (App Router + TypeScript)
│   └── api/          # FastAPI backend (RAG + Code Runner)
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TS types
│   └── utils/        # Shared utilities
├── infra/            # Docker / nginx + code-runner image
└── docs/             # System design + diagrams
```

## Quick start (dev)

### Prerequisites

- Node.js **18+**
- npm **9+**
- Python **3.10+**
- Optional: Docker (only required for `CODE_EXECUTOR_MODE=docker`)

### Install & run

```bash
npm install
npm run dev
```

- **Web**: `http://localhost:3000`
- **API**: `http://localhost:8000` (see `apps/api`)

## Configuration

### Backend env vars (RAG + executor)

Create `apps/api/.env`:

```bash
GOOGLE_API_KEY=...            # required for embeddings + LLM
CHROMA_PERSIST_DIR=./chroma   # persisted vector DB dir (local)
CODE_EXECUTOR_MODE=local      # local | docker
CODE_RUNNER_DOCKER_IMAGE=code-runner:latest
```

## Documentation

- **Architecture & system design**: `docs/ARCHITECTURE.md`
- **Detailed system deep dive (recommended)**: `docs/DETAILED_SYSTEM_DESIGN.md`
- **RAG design + data flow**: `docs/RAG.md`
- **Python runner (security + SSE protocol)**: `docs/CODE_RUNNER.md`
- **Frontend structure (profiles, IDE, drag UI)**: `docs/FRONTEND.md`

## License

Private — all rights reserved.
