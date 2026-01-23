"""
Executor selection shim.

IMPORTANT:
- `router.py` imports `execute_python` from this module and MUST remain unchanged.
- Phase-2A introduces an executor abstraction and Docker isolation behind this stable API.
"""

from __future__ import annotations

from src.core.config import settings

from .errors import ExecutionRuntimeError
from .executor_base import BaseExecutor, ExecutionResult
from .executor_docker import DockerExecutor
from .executor_local import LocalExecutor


def get_executor(*, timeout_seconds: int = 5) -> BaseExecutor:
    """
    Select the executor implementation based on configuration.

    NOTE: The router must not contain branching logic; selection happens here.
    """

    mode = (getattr(settings, "CODE_EXECUTOR_MODE", "local") or "local").lower().strip()
    if mode == "docker":
        return DockerExecutor(
            timeout_seconds=timeout_seconds,
            docker_image=getattr(settings, "CODE_RUNNER_DOCKER_IMAGE", "code-runner:latest"),
            cpus=getattr(settings, "CODE_RUNNER_CPUS", 1.0),
            memory_mb=getattr(settings, "CODE_RUNNER_MEMORY_MB", 512),
            pids_limit=getattr(settings, "CODE_RUNNER_PIDS_LIMIT", 64),
        )
    if mode == "local":
        return LocalExecutor(timeout_seconds=timeout_seconds)

    raise ExecutionRuntimeError(
        "Invalid CODE_EXECUTOR_MODE. Expected 'local' or 'docker'."
    )


def execute_python(code: str, *, timeout_seconds: int = 5) -> ExecutionResult:
    """
    Execute Python code using the configured executor and return
    `{stdout, stderr, exit_code}`.

    API contract is frozen in Phase-1; callers (router) rely on this function.
    """

    executor = get_executor(timeout_seconds=timeout_seconds)
    return executor.execute(code)


def stream_python(code: str, *, timeout_seconds: int = 5):
    """
    Stream Python execution output using the configured executor.

    Yields (event_type, data) tuples, where event_type is one of:
    'stdout' | 'stderr' | 'exit' | 'error'
    """
    executor = get_executor(timeout_seconds=timeout_seconds)
    return executor.stream(code)
