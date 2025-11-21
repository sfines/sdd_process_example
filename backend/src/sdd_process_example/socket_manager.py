"""Socket.IO server manager for WebSocket connections."""

from typing import Any

import socketio

from .logging_config import get_logger
from .models import HelloMessage, WorldMessage

logger = get_logger(__name__)

# Create Socket.IO server with CORS enabled for local development
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=["http://localhost", "http://localhost:3000"],
    logger=False,
    engineio_logger=False,
)


@sio.event  # type: ignore[misc]
async def connect(sid: str, environ: dict[str, Any]) -> None:
    """Handle client connection."""
    logger.info(
        "[CONNECT] Client connected",
        event_type="connect",
        session_id=sid,
    )


@sio.event  # type: ignore[misc]
async def disconnect(sid: str) -> None:
    """Handle client disconnection."""
    logger.info(
        "[DISCONNECT] Client disconnected",
        event_type="disconnect",
        session_id=sid,
    )


@sio.event  # type: ignore[misc]
async def hello_message(sid: str, data: dict[str, Any]) -> None:
    """Handle hello_message from client."""
    try:
        # Validate message payload
        hello = HelloMessage(**data)

        logger.info(
            "[MESSAGE] Received hello_message",
            event_type="hello_message",
            session_id=sid,
            message=hello.message,
        )

        # Send world_message back to client
        world = WorldMessage(message="World from server!")
        await sio.emit("world_message", world.model_dump(), to=sid)

        logger.info(
            "[MESSAGE] Sent world_message",
            event_type="world_message",
            session_id=sid,
            message=world.message,
        )
    except Exception as e:
        logger.error(
            "[ERROR] Failed to process hello_message",
            event_type="hello_message",
            session_id=sid,
            error=str(e),
        )
