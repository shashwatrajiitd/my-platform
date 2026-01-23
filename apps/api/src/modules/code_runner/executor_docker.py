from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import threading
import time
import uuid
from queue import Empty, Queue

from .errors import ExecutionRuntimeError, ExecutionTimeoutError
from .executor_base import BaseExecutor, ExecutionResult


class DockerExecutor(BaseExecutor):
    """
    Phase-2A Docker-backed executor.

    Runs user code inside a locked-down Docker container using the Docker CLI
    (explicit flags, no Docker SDK).
    """

    def __init__(
        self,
        *,
        timeout_seconds: int = 5,
        docker_image: str = "code-runner:latest",
        cpus: float = 1.0,
        memory_mb: int = 512,
        pids_limit: int = 64,
    ) -> None:
        self._timeout_seconds = int(timeout_seconds)
        self._docker_image = docker_image
        self._cpus = float(cpus)
        self._memory_mb = int(memory_mb)
        self._pids_limit = int(pids_limit)

    def execute(self, code: str) -> ExecutionResult:
        if shutil.which("docker") is None:
            raise ExecutionRuntimeError("Docker CLI not found on host.")

        tmp_path: str | None = None
        container_name = f"code-runner-{uuid.uuid4().hex}"

        try:
            with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
                tmp_path = f.name
                f.write(code)

            # Keep the container filesystem read-only, but allow a minimal writable /tmp.
            # Use explicit, auditable flags (no implicit defaults).
            docker_cmd: list[str] = [
                "docker",
                "run",
                "--rm",
                "--name",
                container_name,
                f"--cpus={self._cpus}",
                f"--memory={self._memory_mb}m",
                "--network=none",
                "--read-only",
                f"--pids-limit={self._pids_limit}",
                "--tmpfs",
                "/tmp:rw,noexec,nosuid,size=64m",
                "-w",
                "/sandbox",
                "-e",
                "PYTHONHASHSEED=0",
                "-v",
                f"{tmp_path}:/sandbox/code.py:ro",
                self._docker_image,
                # NOTE: the `code-runner` image sets ENTRYPOINT to:
                #   ["python", "-I", "-S", "-u"]
                # so we only pass the script path here.
                "/sandbox/code.py",
            ]

            completed = subprocess.run(
                docker_cmd,
                capture_output=True,
                text=True,
                timeout=self._timeout_seconds,
            )

            stdout = completed.stdout or ""
            stderr = completed.stderr or ""

            # Heuristic: distinguish Docker/runtime failures from user-code failures.
            # User code errors should return exit_code != 0 (router treats as normal).
            if completed.returncode != 0 and _looks_like_docker_engine_failure(stderr):
                raise ExecutionRuntimeError("Docker execution failed.")

            return {
                "stdout": stdout,
                "stderr": stderr,
                "exit_code": int(completed.returncode),
            }

        except subprocess.TimeoutExpired as e:
            stdout = e.stdout if isinstance(e.stdout, str) else ""
            stderr = e.stderr if isinstance(e.stderr, str) else ""

            # Best-effort: stop and remove container in case `docker run` was interrupted.
            _best_effort_docker_cleanup(container_name)

            err = ExecutionTimeoutError(
                f"Execution timed out after {self._timeout_seconds} seconds."
            )
            setattr(err, "stdout", stdout)
            setattr(err, "stderr", stderr)
            raise err from None
        except OSError as e:
            raise ExecutionRuntimeError("Failed to invoke Docker CLI.") from e
        finally:
            if tmp_path:
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass

    def stream(self, code: str):
        """
        Stream stdout/stderr from the Docker sandbox in near-real-time.

        Yields:
          ('stdout', chunk) | ('stderr', chunk) | ('exit', '{"exit_code": N}') | ('error', msg)

        Notes:
        - stdout and stderr are streamed separately (best-effort ordering).
        - On timeout, container is killed and an exit event with code 124 is yielded.
        - Engine-level failures yield a single 'error' event (no HTTP 500 mid-stream).
        """
        if shutil.which("docker") is None:
            yield ("error", "Docker CLI not found on host.")
            return

        tmp_path: str | None = None
        container_name = f"code-runner-{uuid.uuid4().hex}"
        proc: subprocess.Popen[str] | None = None

        q: "Queue[tuple[str, str]]" = Queue()
        stop = threading.Event()
        stderr_tail = ""

        def _reader(pipe, event_type: str) -> None:
            nonlocal stderr_tail
            try:
                for line in iter(pipe.readline, ""):
                    if stop.is_set():
                        break
                    if not line:
                        continue
                    if event_type == "stderr":
                        # Keep a small tail to detect docker-engine failures at the end.
                        stderr_tail = (stderr_tail + line)[-4000:]
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

            docker_cmd: list[str] = [
                "docker",
                "run",
                "--rm",
                "--name",
                container_name,
                f"--cpus={self._cpus}",
                f"--memory={self._memory_mb}m",
                "--network=none",
                "--read-only",
                f"--pids-limit={self._pids_limit}",
                "--tmpfs",
                "/tmp:rw,noexec,nosuid,size=64m",
                "-w",
                "/sandbox",
                "-e",
                "PYTHONHASHSEED=0",
                "-v",
                f"{tmp_path}:/sandbox/code.py:ro",
                self._docker_image,
                "/sandbox/code.py",
            ]

            proc = subprocess.Popen(
                docker_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
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
                    _best_effort_docker_cleanup(container_name)
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

                    rc = int(proc.returncode or 0)
                    if rc != 0 and _looks_like_docker_engine_failure(stderr_tail):
                        yield ("error", "Docker execution failed.")
                        return

                    yield ("exit", f'{{"exit_code": {rc}}}')
                    return

        except OSError:
            yield ("error", "Failed to invoke Docker CLI.")
            return
        finally:
            stop.set()
            if proc is not None and proc.poll() is None:
                try:
                    proc.kill()
                except Exception:
                    pass
            # Ensure no zombie containers if the client disconnects mid-stream.
            _best_effort_docker_cleanup(container_name)
            if tmp_path:
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass


def _looks_like_docker_engine_failure(stderr: str) -> bool:
    s = (stderr or "").strip()
    if not s:
        return False
    needles = [
        "docker:",
        "cannot connect to the docker daemon",
        "is the docker daemon running",
        "pull access denied",
        "repository does not exist",
        "error response from daemon",
        "unknown flag:",
        "invalid reference format",
        "unable to find image",
        "no such image",
        "failed to create task",
        "oci runtime",
    ]
    s_lower = s.lower()
    return any(n in s_lower for n in needles)


def _best_effort_docker_cleanup(container_name: str) -> None:
    if not container_name:
        return
    if shutil.which("docker") is None:
        return
    try:
        subprocess.run(
            ["docker", "kill", container_name],
            capture_output=True,
            text=True,
            timeout=2,
        )
    except Exception:
        pass
    try:
        subprocess.run(
            ["docker", "rm", "-f", container_name],
            capture_output=True,
            text=True,
            timeout=2,
        )
    except Exception:
        pass

