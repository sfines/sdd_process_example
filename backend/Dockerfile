# Use the official Python image
FROM python:3.13-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Change the working directory to the `app` directory
WORKDIR /app

# Copy the project files
COPY pyproject.toml uv.lock ./
COPY backend/src ./backend/src

# Install the project and its dependencies
RUN uv sync --frozen

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Run the FastAPI application
CMD ["uvicorn", "sdd_process_example.main:socket_app", "--host", "0.0.0.0", "--port", "8000"]
