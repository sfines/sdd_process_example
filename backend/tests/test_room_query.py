"""Tests for room query methods in RoomManager."""

import pytest
from redis import Redis

from sdd_process_example.services.room_manager import RoomManager


@pytest.fixture
def redis_client() -> Redis:  # type: ignore[type-arg]
    """Create Redis client for testing."""
    client = Redis(host="localhost", port=6379, db=0, decode_responses=True)
    # Clean up test keys before each test
    for key in client.scan_iter("room:TEST-*"):
        client.delete(key)
    yield client
    # Clean up after test
    for key in client.scan_iter("room:TEST-*"):
        client.delete(key)


@pytest.fixture
def room_manager(redis_client: Redis) -> RoomManager:  # type: ignore[type-arg]
    """Create RoomManager instance for testing."""
    return RoomManager(redis_client)


def test_get_room_returns_existing_room(room_manager: RoomManager) -> None:
    """Test that get_room() returns room state for existing room."""
    # Create a room
    room = room_manager.create_room("Alice")

    # Query the room
    retrieved_room = room_manager.get_room(room.room_code)

    # Verify room was retrieved
    assert retrieved_room is not None
    assert retrieved_room.room_code == room.room_code
    assert retrieved_room.creator_player_id == room.creator_player_id
    assert len(retrieved_room.players) == 1
    assert retrieved_room.players[0].name == "Alice"


def test_get_room_returns_none_for_nonexistent_room(room_manager: RoomManager) -> None:
    """Test that get_room() returns None for non-existent room."""
    # Query non-existent room
    retrieved_room = room_manager.get_room("NONEXISTENT-9999")

    # Verify None returned
    assert retrieved_room is None


def test_room_exists_returns_true_for_existing_room(room_manager: RoomManager) -> None:
    """Test that room_exists() returns True for existing room."""
    # Create a room
    room = room_manager.create_room("Bob")

    # Check if room exists
    exists = room_manager.room_exists(room.room_code)

    # Verify room exists
    assert exists is True


def test_room_exists_returns_false_for_nonexistent_room(
    room_manager: RoomManager,
) -> None:
    """Test that room_exists() returns False for non-existent room."""
    # Check if non-existent room exists
    exists = room_manager.room_exists("NONEXISTENT-8888")

    # Verify room does not exist
    assert exists is False


def test_get_room_capacity_returns_current_and_max(room_manager: RoomManager) -> None:
    """Test that get_room_capacity() returns current player count and max capacity."""
    # Create a room
    room = room_manager.create_room("Charlie")

    # Get capacity
    current, max_capacity = room_manager.get_room_capacity(room.room_code)

    # Verify capacity
    assert current == 1  # One player (creator)
    assert max_capacity == 8  # Max capacity from spec


def test_get_room_capacity_for_nonexistent_room_raises_error(
    room_manager: RoomManager,
) -> None:
    """Test that get_room_capacity() raises error for non-existent room."""
    # Try to get capacity for non-existent room
    with pytest.raises(ValueError, match="Room .* not found"):
        room_manager.get_room_capacity("NONEXISTENT-7777")
