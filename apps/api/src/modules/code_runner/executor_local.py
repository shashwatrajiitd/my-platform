from __future__ import annotations

import os
import subprocess
import sys
import tempfile
import threading
import time
from queue import Empty, Queue

from .errors import ExecutionRuntimeError, ExecutionTimeoutError
from .executor_base import BaseExecutor, ExecutionResult


class LocalExecutor(BaseExecutor):
    """
    Phase-1 executor preserved verbatim in behavior.

    Executes Python locally via subprocess with a strict timeout.
    """

    def __init__(self, *, timeout_seconds: int = 5) -> None:
        self._timeout_seconds = int(timeout_seconds)

    def execute(self, code: str) -> ExecutionResult:
        tmp_path: str | None = None
        try:
            with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
                tmp_path = f.name
                f.write(code)

            # -I: isolated mode (ignores user site-packages and env var PYTHON*)
            # -S: don't import site
            # -u: unbuffered I/O (more deterministic capture)
            cmd = [sys.executable, "-I", "-S", "-u", tmp_path]

            env = os.environ.copy()
            env["PYTHONHASHSEED"] = "0"

            completed = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self._timeout_seconds,
                env=env,
            )

            return {
                "stdout": completed.stdout or "",
                "stderr": completed.stderr or "",
                "exit_code": int(completed.returncode),
            }
        except subprocess.TimeoutExpired as e:
            stdout = e.stdout if isinstance(e.stdout, str) else ""
            stderr = e.stderr if isinstance(e.stderr, str) else ""
            err = ExecutionTimeoutError(
                f"Execution timed out after {self._timeout_seconds} seconds."
            )
            # Preserve any partial output produced before the timeout.
            setattr(err, "stdout", stdout)
            setattr(err, "stderr", stderr)
            raise err from None
        except OSError as e:
            raise ExecutionRuntimeError("Failed to start Python subprocess.") from e
        finally:
            if tmp_path:
                try:
                    os.remove(tmp_path)
                except OSError:
                    # Best-effort cleanup; do not fail the request.
                    pass

    def stream(self, code: str):
        """
        Stream stdout/stderr in near-real-time (best-effort ordering).

        Yields:
          ('stdout', chunk) | ('stderr', chunk) | ('exit', '{"exit_code": N}') | ('error', msg)
        """
        tmp_path: str | None = None
        proc: subprocess.Popen[str] | None = None
        q: "Queue[tuple[str, str]]" = Queue()
        stop = threading.Event()

        def _reader(pipe: "subprocess._FILE", event_type: str) -> None:  # type: ignore[attr-defined]
            try:
                for line in iter(pipe.readline, ""):
                    if stop.is_set():
                        break
                    if line:
                        q.put((event_type, line))
            finally:
                try:
                    pipe.close()
                except Exception:
                    pass

        try:
            with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
                tmp_path = f.name
                f.write(code)

            cmd = [sys.executable, "-I", "-S", "-u", tmp_path]
            env = os.environ.copy()
            env["PYTHONHASHSEED"] = "0"

            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                env=env,
            )
            assert proc.stdout is not None
            assert proc.stderr is not None

            t_out = threading.Thread(target=_reader, args=(proc.stdout, "stdout"), daemon=True)
            t_err = threading.Thread(target=_reader, args=(proc.stderr, "stderr"), daemon=True)
            t_out.start()
            t_err.start()

            start = time.monotonic()
            while True:
                if (time.monotonic() - start) > self._timeout_seconds:
                    stop.set()
                    try:
                        proc.kill()
                    except Exception:
                        pass
                    yield ("exit", '{"exit_code": 124}')
                    return

                try:
                    event_type, chunk = q.get(timeout=0.05)
                    yield (event_type, chunk)
                    continue
                except Empty:
                    pass

                if proc.poll() is not None:
                    # Drain any remaining queued output.
                    while True:
                        try:
                            event_type, chunk = q.get_nowait()
                            yield (event_type, chunk)
                        except Empty:
                            break
                    yield ("exit", f'{{"exit_code": {int(proc.returncode or 0)}}}')
                    return

        except OSError:
            yield ("error", "Failed to start Python subprocess.")
            return
        finally:
            stop.set()
            if proc is not None and proc.poll() is None:
                try:
                    proc.kill()
                except Exception:
                    pass
            if tmp_path:
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
