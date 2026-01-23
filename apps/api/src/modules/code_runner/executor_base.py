from __future__ import annotations

from collections.abc import Iterator
from typing import TypedDict


class ExecutionResult(TypedDict):
    stdout: str
    stderr: str
    exit_code: int


class BaseExecutor:
    def execute(self, code: str) -> ExecutionResult:
        """Execute code and return {stdout, stderr, exit_code}"""
        raise NotImplementedError

    def stream(self, code: str) -> Iterator[tuple[str, str]]:
        """
        Stream execution output as (event_type, data) tuples.

        event_type: 'stdout' | 'stderr' | 'exit' | 'error'
        """
        raise NotImplementedError
