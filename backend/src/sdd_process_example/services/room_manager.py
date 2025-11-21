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

# Max players per room
MAX_ROOM_CAPACITY = 8


class RoomNotFoundError(Exception):
    """Raised when attempting to access a room that doesn't exist."""

    pass


class RoomCapacityExceededError(Exception):
    """Raised when attempting to join a room at full capacity."""

    pass


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

    def get_room(self, room_code: str) -> RoomState | None:
        """Retrieve room state from Redis.

        Args:
            room_code: Room code to query

        Returns:
            RoomState if room exists, None otherwise

        Example:
            >>> manager = RoomManager(redis_client)
            >>> room = manager.get_room("ALPHA-1234")
            >>> if room:
            ...     print(f"Room has {len(room.players)} players")
        """
        redis_key = f"room:{room_code}"

        # Check if room exists
        if not self.redis.exists(redis_key):
            return None

        # Retrieve room data from Redis hash
        room_data = self.redis.hgetall(redis_key)

        if not room_data:
            return None

        # Deserialize JSON fields
        players_data = json.loads(room_data["players"])  # type: ignore[index]
        roll_history_data = json.loads(room_data["roll_history"])  # type: ignore[index]

        # Convert players back to Player objects
        players = [Player(**player) for player in players_data]

        # Reconstruct RoomState
        room = RoomState(
            room_code=room_data["room_code"],  # type: ignore[index]
            mode=room_data["mode"],  # type: ignore[index]
            created_at=room_data["created_at"],  # type: ignore[index]
            creator_player_id=room_data["creator_player_id"],  # type: ignore[index]
            players=players,
            roll_history=roll_history_data,  # Will be proper RollResult objects later
        )

        logger.debug("room_retrieved", room_code=room_code)

        return room

    def room_exists(self, room_code: str) -> bool:
        """Check if room exists in Redis.

        Args:
            room_code: Room code to check

        Returns:
            True if room exists, False otherwise

        Example:
            >>> manager = RoomManager(redis_client)
            >>> if manager.room_exists("ALPHA-1234"):
            ...     print("Room found!")
        """
        redis_key = f"room:{room_code}"
        exists = bool(self.redis.exists(redis_key))

        logger.debug("room_exists_check", room_code=room_code, exists=exists)

        return exists

    def get_room_capacity(self, room_code: str) -> tuple[int, int]:
        """Get current player count and max capacity for room.

        Args:
            room_code: Room code to query

        Returns:
            Tuple of (current_player_count, max_capacity)

        Raises:
            ValueError: If room does not exist

        Example:
            >>> manager = RoomManager(redis_client)
            >>> current, max_cap = manager.get_room_capacity("ALPHA-1234")
            >>> print(f"Room has {current}/{max_cap} players")
        """
        room = self.get_room(room_code)

        if room is None:
            raise ValueError(f"Room {room_code} not found")

        current_count = len(room.players)
        max_capacity = MAX_ROOM_CAPACITY

        logger.debug(
            "room_capacity_check",
            room_code=room_code,
            current=current_count,
            max=max_capacity,
        )

        return current_count, max_capacity

    def join_room(self, room_code: str, player_name: str) -> RoomState:
        """Add player to existing room.

        Args:
            room_code: Code of room to join
            player_name: Name of player joining

        Returns:
            Updated RoomState with new player added

        Raises:
            ValueError: If player_name is invalid
            RoomNotFoundError: If room does not exist
            RoomCapacityExceededError: If room is at capacity (8 players)

        Example:
            >>> manager = RoomManager(redis_client)
            >>> room = manager.join_room("ALPHA-1234", "Bob")
            >>> len(room.players)
            2
        """
        # Validate player name
        is_valid, error_message = validate_player_name(player_name)
        if not is_valid:
            logger.warning(
                "join_room_validation_failed",
                room_code=room_code,
                player_name=player_name,
                error=error_message,
            )
            raise ValueError(error_message)

        # Sanitize player name
        sanitized_name = sanitize_player_name(player_name)

        # Check if room exists
        room = self.get_room(room_code)
        if room is None:
            logger.warning("join_room_not_found", room_code=room_code)
            raise RoomNotFoundError(f"Room {room_code} not found")

        # Check capacity
        if len(room.players) >= MAX_ROOM_CAPACITY:
            logger.warning(
                "join_room_capacity_exceeded",
                room_code=room_code,
                current_players=len(room.players),
            )
            raise RoomCapacityExceededError(
                f"Room {room_code} is at full capacity ({MAX_ROOM_CAPACITY} players)"
            )

        # Generate unique player ID
        player_id = str(uuid.uuid4())

        # Create new player
        new_player = Player(
            player_id=player_id,
            name=sanitized_name,
            connected=True,
        )

        # Add player to room
        room.players.append(new_player)

        # Store updated room state
        self._store_room(room)

        logger.info(
            "player_joined_room",
            room_code=room_code,
            player_name=sanitized_name,
            player_id=player_id,
            total_players=len(room.players),
        )

        return room
