"""FastAPI application for the SDD Process Example."""

import socketio
from fastapi import FastAPI

from .logging_config import configure_logging
from .socket_manager import sio

# Configure structured logging
configure_logging()

app = FastAPI(title="SDD Process Example", version="0.1.0")

# Create Socket.IO ASGI app
socket_app = socketio.ASGIApp(sio, app)


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}
