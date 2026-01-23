# Portfolio API - FastAPI Backend

Production-grade FastAPI backend for portfolio application.

## Architecture

```
apps/api/
├── src/
│   ├── main.py              # FastAPI app entry point
│   │
│   ├── modules/
│   │   ├── rag/             # RAG-based AI chat
│   │   │   ├── router.py
│   │   │   ├── pipeline.py
│   │   │   ├── retriever.py
│   │   │   ├── vectorstore.py
│   │   │   └── prompts.py
│   │   │
│   │   ├── code_runner/     # Python code execution (sync + SSE)
│   │   │   ├── router.py
│   │   │   ├── executor.py
│   │   │   ├── executor_local.py
│   │   │   ├── executor_docker.py
│   │   │   └── validator.py
│   │   │
│   │   └── profiles/        # Profile data API
│   │       └── router.py
│   │
│   ├── core/
│   │   ├── config.py        # Configuration
│   │   ├── logging.py       # Logging setup
│   │   └── security.py      # Auth & security
│   │
│   └── shared/
│       ├── schemas.py       # Shared Pydantic models
│       └── constants.py     # Constants
│
└── requirements.txt
```

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn src.main:app --reload

# Run with Docker
docker build -t portfolio-api .
docker run -p 8000:8000 portfolio-api
```

## Configuration

Create `apps/api/.env`:

```bash
GOOGLE_API_KEY=...
CHROMA_PERSIST_DIR=./chroma

# local | docker
CODE_EXECUTOR_MODE=local
CODE_RUNNER_DOCKER_IMAGE=code-runner:latest
```

## RAG ingestion (local)

```bash
python -m src.modules.rag.ingest --all --reset
```

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `POST /api/rag/chat` - RAG chat (SSE)
- `POST /api/code/run` - Python execution (sync)
- `POST /api/code/run/stream` - Python execution (SSE)
