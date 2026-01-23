### code-runner sandbox image (Phase-2A)

This image is the **isolated Python runtime** used by the backend Docker executor.

#### Build

```bash
docker build -t code-runner:latest -f infra/code-runner/Dockerfile .
```

#### Enable Docker executor

Set `CODE_EXECUTOR_MODE=docker` for the API service environment.

