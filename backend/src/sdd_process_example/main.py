"""FastAPI application for the SDD Process Example."""

from fastapi import FastAPI

app = FastAPI(title="SDD Process Example", version="0.1.0")


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}
