"""Room management service."""

import json
import uuid
from datetime import UTC, datetime

import structlog
from redis import Redis

from sdd_process_example.models import Player, RoomState
from sdd_process_example.utils.room_code_generator import (
    generate_room_code,
    is_code_available,
)
from sdd_process_example.utils.validation import (
    sanitize_player_name,
    validate_player_name,
)

logger = structlog.get_logger()

# Room TTL: 18000 seconds = 5 hours
ROOM_TTL_SECONDS = 18000

# Max retries for room code collision
MAX_COLLISION_RETRIES = 10


class RoomManager:
    """Manages game room operations."""

    def __init__(self, redis_client: Redis) -> None:  # type: ignore
        """Initialize room manager with Redis client.

        Args:
            redis_client: Redis client instance for room storage
        """
        self.redis = redis_client

    def create_room(self, player_name: str) -> RoomState:
        """Create a new room with unique code.

        Args:
            player_name: Name of the room creator

        Returns:
            RoomState: The created room state

        Raises:
            ValueError: If player_name is invalid
            RuntimeError: If unique room code cannot be generated

        Example:
            >>> manager = RoomManager(redis_client)
            >>> room = manager.create_room("Alice")
            >>> room.room_code
            'ALPHA-1234'
        """
        # Validate player name
        is_valid, error_message = validate_player_name(player_name)
        if not is_valid:
            logger.warning(
                "room_create_validation_failed",
                player_name=player_name,
                error=error_message,
            )
            raise ValueError(error_message)

        # Sanitize player name
        sanitized_name = sanitize_player_name(player_name)

        # Generate unique room code with collision detection
        room_code = None
        for attempt in range(MAX_COLLISION_RETRIES):
            candidate_code = generate_room_code()
            if is_code_available(candidate_code, self.redis):
                room_code = candidate_code
                break
            logger.debug(
                "room_code_collision",
                candidate_code=candidate_code,
                attempt=attempt + 1,
            )

        if room_code is None:
            logger.error("room_code_generation_failed", attempts=MAX_COLLISION_RETRIES)
            raise RuntimeError(
                "Could not generate unique room code after "
                f"{MAX_COLLISION_RETRIES} attempts"
            )

        # Create player
        player_id = str(uuid.uuid4())
        player = Player(
            player_id=player_id,
            name=sanitized_name,
            connected=True,
        )

        # Create room state
        created_at = datetime.now(UTC).isoformat()
        room = RoomState(
            room_code=room_code,
            mode="Open",
            created_at=created_at,
            creator_player_id=player_id,
            players=[player],
            roll_history=[],
        )

        # Store in Redis
        self._store_room(room)

        logger.info(
            "room_created",
            room_code=room_code,
            player_name=sanitized_name,
            player_id=player_id,
        )

        return room

    def _store_room(self, room: RoomState) -> None:
        """Store room state in Redis with TTL.

        Args:
            room: Room state to store
        """
        redis_key = f"room:{room.room_code}"

        # Convert room to dict for Redis storage
        room_dict = room.model_dump()

        # Serialize complex types to JSON
        room_data = {
            "room_code": room_dict["room_code"],
            "mode": room_dict["mode"],
            "created_at": room_dict["created_at"],
            "creator_player_id": room_dict["creator_player_id"],
            "players": json.dumps(room_dict["players"]),
            "roll_history": json.dumps(room_dict["roll_history"]),
        }

        # Store as Redis hash
        self.redis.hset(redis_key, mapping=room_data)

        # Set TTL
        self.redis.expire(redis_key, ROOM_TTL_SECONDS)

        logger.debug(
            "room_stored",
            room_code=room.room_code,
            ttl_seconds=ROOM_TTL_SECONDS,
        )
