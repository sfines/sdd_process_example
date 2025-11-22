"""Socket.IO server manager for WebSocket connections."""

import os
import re
from typing import Any

import socketio
from redis import Redis

from .logging_config import get_logger
from .models import HelloMessage, WorldMessage
from .services.dice_engine import DiceEngine
from .services.room_manager import (
    RoomCapacityExceededError,
    RoomManager,
    RoomNotFoundError,
)

logger = get_logger(__name__)

# Create Socket.IO server with CORS enabled for local development
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8090",
    ],
    logger=False,
    engineio_logger=False,
)


def get_redis_client() -> Redis:  # type: ignore[type-arg]
    """Get Redis client instance.

    Returns:
        Redis: Redis client configured from environment

    Example:
        >>> redis = get_redis_client()
        >>> redis.ping()
        True
    """
    redis_host = os.getenv("REDIS_URL", "redis://localhost:6379")

    return Redis.from_url(
        redis_host,
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

        # Add socket to Socket.IO room
        await sio.enter_room(sid, room.room_code)

        logger.info(
            "[ROOM_CREATE] Room created successfully",
            event_type="create_room",
            session_id=sid,
            room_code=room.room_code,
            player_name=player_name,
        )

        # Emit success
        room_data = room.model_dump()
        await sio.emit("room_created", room_data, to=sid)

        logger.info(
            "[ROOM_CREATE] Emitted room_created event",
            event_type="create_room",
            session_id=sid,
            room_code=room.room_code,
            data_keys=list(room_data.keys()),
        )

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


@sio.event  # type: ignore[misc]
async def join_room(sid: str, data: dict[str, Any]) -> None:
    """Handle join_room event from client.

    Args:
        sid: Socket.IO session ID
        data: Event data containing room_code and player_name

    room_code: str | None = None  # Initialize room_code

    Expected data format:
        {
            "room_code": str  # Room code to join (e.g., "ALPHA-1234")
            "player_name": str  # 1-20 characters, will be sanitized
        }

    Emits:
        room_joined: To joining player with full RoomState
        player_joined: Broadcast to other players in room with new player info
        error: On failure with error message
    """
    room_code: str | None = None  # Initialize room_code

    try:
        # Extract parameters
        room_code = data.get("room_code")
        player_name = data.get("player_name")

        # Validate inputs
        if not room_code:
            logger.warning(
                "[JOIN_ROOM] Missing room_code",
                event_type="join_room",
                session_id=sid,
            )
            await sio.emit(
                "error",
                {"message": "room_code is required"},
                to=sid,
            )
            return

        if not player_name:
            logger.warning(
                "[JOIN_ROOM] Missing player_name",
                event_type="join_room",
                session_id=sid,
                room_code=room_code,
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

        # Join room
        room = room_manager.join_room(room_code, player_name)

        # Add socket to Socket.IO room
        await sio.enter_room(sid, room_code)

        # Get the newly added player (last in list)
        new_player = room.players[-1]

        logger.info(
            "[PLAYER_JOIN] Player joined room successfully",
            event_type="join_room",
            session_id=sid,
            room_code=room_code,
            player_name=player_name,
            player_id=new_player.player_id,
            total_players=len(room.players),
        )

        # Emit room_joined to joining player with their player_id
        room_data = room.model_dump()
        room_data["current_player_id"] = new_player.player_id
        await sio.emit("room_joined", room_data, to=sid)

        # Broadcast player_joined to all other players in room
        await sio.emit(
            "player_joined",
            {"player_id": new_player.player_id, "name": new_player.name},
            room=room_code,
            skip_sid=sid,  # Don't send to joining player
        )

    except RoomNotFoundError as e:
        # Room doesn't exist
        logger.warning(
            "[JOIN_ROOM] Room not found",
            event_type="join_room",
            session_id=sid,
            room_code=room_code,
            error=str(e),
        )
        await sio.emit(
            "error",
            {"message": f"Room {room_code} not found"},
            to=sid,
        )
    except RoomCapacityExceededError as e:
        # Room is full
        logger.warning(
            "[JOIN_ROOM] Room at capacity",
            event_type="join_room",
            session_id=sid,
            room_code=room_code,
            error=str(e),
        )
        await sio.emit(
            "error",
            {"message": f"Room {room_code} is at full capacity"},
            to=sid,
        )
    except ValueError as e:
        # Validation error (invalid player name)
        logger.warning(
            "[JOIN_ROOM] Validation error",
            event_type="join_room",
            session_id=sid,
            room_code=room_code,
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
            "[JOIN_ROOM] Failed to join room",
            event_type="join_room",
            session_id=sid,
            room_code=room_code,
            error=str(e),
        )
        await sio.emit(
            "error",
            {"message": "Failed to join room"},
            to=sid,
        )


@sio.event  # type: ignore[misc]
async def roll_dice(sid: str, data: dict[str, Any]) -> None:
    """Handle roll_dice event from client.

    Args:
        sid: Socket.IO session ID
        data: Event data containing formula, player_name, and room_code

    Expected data format:
        {
            "formula": str,  # Dice formula (e.g., "1d20+5")
            "player_name": str,  # Name of player rolling
            "room_code": str  # Room code
        }

    Emits:
        roll_result: Broadcast to room with DiceResult
        error: On failure with error message
    """
    logger.info(
        "[ROLL_DICE] Roll dice event received",
        event_type="roll_dice",
        session_id=sid,
    )

    try:
        # Extract and validate parameters
        formula = data.get("formula")
        player_name = data.get("player_name")
        room_code = data.get("room_code")

        if not formula:
            logger.warning(
                "[ROLL_DICE] Missing formula",
                event_type="roll_dice",
                session_id=sid,
            )
            await sio.emit(
                "error",
                {"message": "formula is required"},
                to=sid,
            )
            return

        if not player_name:
            logger.warning(
                "[ROLL_DICE] Missing player_name",
                event_type="roll_dice",
                session_id=sid,
            )
            await sio.emit(
                "error",
                {"message": "player_name is required"},
                to=sid,
            )
            return

        if not room_code:
            logger.warning(
                "[ROLL_DICE] Missing room_code",
                event_type="roll_dice",
                session_id=sid,
            )
            await sio.emit(
                "error",
                {"message": "room_code is required"},
                to=sid,
            )
            return

        logger.info(
            "[ROLL_DICE] Roll validated successfully",
            event_type="roll_dice",
            session_id=sid,
            formula=formula,
            room_code=room_code,
        )

        # Parse modifier from formula (e.g., "1d20+5" -> modifier=5)
        modifier = 0
        match = re.search(r"([+-]\d+)$", formula)
        if match:
            modifier = int(match.group(1))

        # Generate dice roll using DiceEngine
        dice_engine = DiceEngine()
        # For now, assuming it's always 1d20 (will extend later for other dice)
        roll_result = dice_engine.roll_d20(
            modifier=modifier, player_id=sid, player_name=player_name
        )

        logger.info(
            "[ROLL_DICE] Roll generated",
            event_type="roll_dice",
            session_id=sid,
            roll_id=roll_result.roll_id,
            formula=roll_result.formula,
            total=roll_result.total,
        )

        # Broadcast roll result to all players in room
        await sio.emit(
            "roll_result",
            roll_result.model_dump(mode="json"),
            room=room_code,
        )

        logger.info(
            "[ROLL_DICE] Roll broadcast to room",
            event_type="roll_dice",
            session_id=sid,
            room_code=room_code,
            roll_id=roll_result.roll_id,
        )

        # Persist roll to room history
        redis_client = get_redis_client()
        room_manager = RoomManager(redis_client)
        room_manager.add_roll_to_history(room_code, roll_result)

        logger.debug(
            "[ROLL_DICE] Roll persisted to history",
            event_type="roll_dice",
            session_id=sid,
            room_code=room_code,
            roll_id=roll_result.roll_id,
        )

    except Exception as e:
        logger.error(
            "[ROLL_DICE] Failed to process roll",
            event_type="roll_dice",
            session_id=sid,
            error=str(e),
        )
        await sio.emit(
            "error",
            {"message": "Failed to process roll"},
            to=sid,
        )
