import asyncio

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from .errors import ExecutionRuntimeError, ExecutionTimeoutError, UnsafeCodeError
from .executor import execute_python, stream_python
from .schemas import CodeRunRequest, CodeRunResponse
from .validator import validate_code

router = APIRouter(prefix="/api/code", tags=["Code Runner"])


@router.post("/run", response_model=CodeRunResponse)
def run_code(payload: CodeRunRequest) -> CodeRunResponse:
    # Phase-1 supports Python only.
    if payload.language != "python":
        raise HTTPException(status_code=400, detail="Only language='python' is supported.")

    try:
        validate_code(payload.code)
    except UnsafeCodeError as e:
        raise HTTPException(status_code=400, detail=str(e)) from None

    try:
        result = execute_python(payload.code, timeout_seconds=5)
        return CodeRunResponse(**result)
    except ExecutionTimeoutError as e:
        return CodeRunResponse(
            stdout=str(getattr(e, "stdout", "")) or "",
            stderr=str(getattr(e, "stderr", "")) or str(e),
            exit_code=124,
        )
    except ExecutionRuntimeError:
        # Execution engine failure (not user code). Don't leak internals.
        raise HTTPException(status_code=500, detail="Execution engine error.") from None


def _format_sse(event_type: str, data: str) -> str:
    # SSE requires each line of data to be prefixed with `data:`.
    payload = (data or "").replace("\r\n", "\n").replace("\r", "\n")
    # Most chunks we stream come from `readline()` and include a trailing "\n".
    # Avoid turning that trailing newline into an extra empty `data:` line.
    if payload.endswith("\n"):
        payload = payload[:-1]
    lines = payload.split("\n")
    return f"event: {event_type}\n" + "\n".join(f"data: {line}" for line in lines) + "\n\n"


@router.post("/run/stream")
async def run_code_stream(payload: CodeRunRequest, request: Request):
    # Phase-1 supports Python only.
    if payload.language != "python":
        raise HTTPException(status_code=400, detail="Only language='python' is supported.")

    # Unsafe code should fail fast with HTTP 400 (no stream).
    try:
        validate_code(payload.code)
    except UnsafeCodeError as e:
        raise HTTPException(status_code=400, detail=str(e)) from None

    async def event_generator():
        gen = stream_python(payload.code, timeout_seconds=5)
        try:
            for event_type, chunk in gen:
                # If the client disconnects, stop streaming and let the executor clean up.
                if await request.is_disconnected():
                    try:
                        gen.close()
                    except Exception:
                        pass
                    break
                yield _format_sse(event_type, str(chunk))
                # Give the event loop a chance to flush chunks promptly.
                await asyncio.sleep(0)
        except Exception:
            # Engine-level failure: emit a single error event (no HTTP 500 mid-stream).
            yield _format_sse("error", "Execution engine error")
        finally:
            try:
                gen.close()
            except Exception:
                pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            # Helpful when behind proxies like nginx.
            "X-Accel-Buffering": "no",
        },
    )
