"""Socket.IO server manager for WebSocket connections."""

import os
from typing import Any

import socketio
from redis import Redis

from .logging_config import get_logger
from .models import HelloMessage, WorldMessage
from .services.room_manager import RoomManager

logger = get_logger(__name__)

# Create Socket.IO server with CORS enabled for local development
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=["http://localhost", "http://localhost:3000"],
    logger=False,
    engineio_logger=False,
)


def get_redis_client() -> Redis:  # type: ignore
    """Get Redis client instance.

    Returns:
        Redis: Redis client configured from environment

    Example:
        >>> redis = get_redis_client()
        >>> redis.ping()
        True
    """
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", "6379"))
    redis_db = int(os.getenv("REDIS_DB", "0"))

    return Redis(
        host=redis_host,
        port=redis_port,
        db=redis_db,
        decode_responses=True,
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


@sio.event  # type: ignore[misc]
async def create_room(sid: str, data: dict[str, Any]) -> None:
    """Handle create_room event from client.

    Args:
        sid: Socket.IO session ID
        data: Event data containing player_name

    Expected data format:
        {
            "player_name": str  # 1-20 characters, will be sanitized
        }

    Emits:
        room_created: On success with RoomState data
        error: On failure with error message
    """
    try:
        # Extract player name
        player_name = data.get("player_name")

        if not player_name:
            logger.warning(
                "[CREATE_ROOM] Missing player_name",
                event_type="create_room",
                session_id=sid,
            )
            await sio.emit(
                "error",
                {"message": "player_name is required"},
                to=sid,
            )
            return

        # Get Redis client and create room manager
        redis_client = get_redis_client()
        room_manager = RoomManager(redis_client)

        # Create room
        room = room_manager.create_room(player_name)

        logger.info(
            "[ROOM_CREATE] Room created successfully",
            event_type="create_room",
            session_id=sid,
            room_code=room.room_code,
            player_name=player_name,
        )

        # Emit success
        await sio.emit("room_created", room.model_dump(), to=sid)

    except ValueError as e:
        # Validation error
        logger.warning(
            "[CREATE_ROOM] Validation error",
            event_type="create_room",
            session_id=sid,
            error=str(e),
        )
        await sio.emit(
            "error",
            {"message": str(e)},
            to=sid,
        )
    except Exception as e:
        # Unexpected error
        logger.error(
            "[CREATE_ROOM] Failed to create room",
            event_type="create_room",
            session_id=sid,
            error=str(e),
        )
        await sio.emit(
            "error",
            {"message": "Failed to create room"},
            to=sid,
        )
