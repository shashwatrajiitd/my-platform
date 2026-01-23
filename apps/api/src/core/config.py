"""
Application Configuration

Centralized settings loaded via pydantic-settings.
"""

from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Settings
    API_V1_PREFIX: str = "/api"
    DEBUG: bool = False
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    
    # TODO: RAG Settings
    # RAG_VECTOR_DB_PATH: str = "./data/vectorstore"
    # RAG_EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    # RAG_LLM_MODEL: str = "gpt-4"
    # RAG_LLM_API_KEY: str = ""

    # RAG (Phase 2+)
    # These are used directly by the RAG modules via os.getenv, but we also
    # define them here so BaseSettings won't reject them as "extra" when
    # present in `.env` / environment.
    GOOGLE_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    CHROMA_PERSIST_DIR: str = "./chroma"
    
    # TODO: Code Runner Settings
    # Phase-2A: executor selection
    # - local: Phase-1 subprocess (fallback / debug)
    # - docker: Docker sandbox (isolation)
    CODE_EXECUTOR_MODE: str = "local"  # local | docker

    # Phase-2A: Docker sandbox settings (explicit, auditable)
    CODE_RUNNER_DOCKER_IMAGE: str = "code-runner:latest"
    CODE_RUNNER_CPUS: float = 1.0
    CODE_RUNNER_MEMORY_MB: int = 512
    CODE_RUNNER_PIDS_LIMIT: int = 64
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
