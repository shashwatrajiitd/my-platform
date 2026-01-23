class CodeRunnerError(Exception):
    """Base exception for code runner."""


class UnsafeCodeError(CodeRunnerError):
    """Raised when static validation detects unsafe code."""


class ExecutionTimeoutError(CodeRunnerError):
    """Raised when code execution exceeds the configured timeout."""


class ExecutionRuntimeError(CodeRunnerError):
    """Raised when the execution engine fails (not a user-code error)."""

