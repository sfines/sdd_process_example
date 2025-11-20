# Build stage
FROM python:3.13-slim as builder

WORKDIR /tmp

COPY pyproject.toml uv.lock* ./

RUN pip install --no-cache-dir uv && \
    uv sync --frozen

# Runtime stage
FROM python:3.13-slim

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /tmp/.venv /app/.venv

# Copy application code
COPY backend/src/sdd_process_example/ ./sdd_process_example/

ENV PATH=/app/.venv/bin:$PATH

EXPOSE 8000

CMD ["uvicorn", "sdd_process_example.main:app", "--host", "0.0.0.0", "--port", "8000"]
