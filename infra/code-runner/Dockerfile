FROM python:3.11-slim

# Minimal non-root runtime user.
RUN useradd -m runner

WORKDIR /sandbox
USER runner

# Isolated, no-site, unbuffered execution.
ENTRYPOINT ["python", "-I", "-S", "-u"]

