"""Tests for join_room functionality in RoomManager."""

import pytest
from redis import Redis

from sdd_process_example.services.room_manager import (
    RoomCapacityExceededError,
    RoomManager,
    RoomNotFoundError,
)


@pytest.fixture
def redis_client() -> Redis:  # type: ignore
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
def room_manager(redis_client: Redis) -> RoomManager:  # type: ignore
    """Create RoomManager instance for testing."""
    return RoomManager(redis_client)


def test_join_room_adds_player_to_existing_room(room_manager: RoomManager) -> None:
    """Test that join_room() adds player to existing room."""
    # Create a room
    room = room_manager.create_room("Alice")
    
    # Join the room
    updated_room = room_manager.join_room(room.room_code, "Bob")
    
    # Verify Bob was added
    assert len(updated_room.players) == 2
    assert updated_room.players[0].name == "Alice"
    assert updated_room.players[1].name == "Bob"
    assert updated_room.players[1].connected is True


def test_join_room_raises_error_for_nonexistent_room(
    room_manager: RoomManager,
) -> None:
    """Test that join_room() raises RoomNotFoundError for non-existent room."""
    # Try to join non-existent room
    with pytest.raises(RoomNotFoundError, match="Room .* not found"):
        room_manager.join_room("NONEXISTENT-9999", "Charlie")


def test_join_room_raises_error_when_room_at_capacity(
    room_manager: RoomManager,
) -> None:
    """Test that join_room() raises RoomCapacityExceededError when room full."""
    # Create a room
    room = room_manager.create_room("Player1")
    
    # Add 7 more players (total 8 - at capacity)
    for i in range(2, 9):
        room = room_manager.join_room(room.room_code, f"Player{i}")
    
    # Verify we have 8 players
    assert len(room.players) == 8
    
    # Try to add 9th player
    with pytest.raises(RoomCapacityExceededError, match="Room .* is at full capacity"):
        room_manager.join_room(room.room_code, "Player9")


def test_join_room_sanitizes_player_name(room_manager: RoomManager) -> None:
    """Test that join_room() sanitizes player names to prevent XSS."""
    # Create a room
    room = room_manager.create_room("Alice")
    
    # Join with XSS payload
    xss_name = "<script>x</script>"  # 18 chars sanitized to fit in 20
    updated_room = room_manager.join_room(room.room_code, xss_name)
    
    # Verify name was sanitized - check it contains escaped characters
    assert "&lt;" in updated_room.players[1].name
    assert "&gt;" in updated_room.players[1].name
    # Original dangerous characters should NOT be present
    assert "<" not in updated_room.players[1].name
    assert ">" not in updated_room.players[1].name


def test_join_room_generates_unique_player_id(room_manager: RoomManager) -> None:
    """Test that join_room() generates unique player_id for each player."""
    # Create a room
    room = room_manager.create_room("Player1")
    
    # Add 3 more players
    room = room_manager.join_room(room.room_code, "Player2")
    room = room_manager.join_room(room.room_code, "Player3")
    
    # Collect all player IDs
    player_ids = [player.player_id for player in room.players]
    
    # Verify all IDs are unique
    assert len(player_ids) == len(set(player_ids))
    assert len(player_ids) == 3


def test_join_room_refreshes_ttl(
    room_manager: RoomManager,
    redis_client: Redis,  # type: ignore[type-arg]
) -> None:
    """Test that join_room() refreshes room TTL."""
    # Create a room
    room = room_manager.create_room("Alice")
    redis_key = f"room:{room.room_code}"
    
    # Get initial TTL
    initial_ttl = int(redis_client.ttl(redis_key))  # type: ignore[arg-type]
    
    # Join room
    room_manager.join_room(room.room_code, "Bob")
    
    # Get TTL after join
    ttl_after_join = int(redis_client.ttl(redis_key))  # type: ignore[arg-type]
    
    # Verify TTL was refreshed (should be close to 18000)
    assert ttl_after_join >= initial_ttl
    assert ttl_after_join >= 17900  # Allow small time difference


def test_join_room_validates_player_name(room_manager: RoomManager) -> None:
    """Test that join_room() validates player name."""
    # Create a room
    room = room_manager.create_room("Alice")
    
    # Try to join with empty name
    with pytest.raises(ValueError, match="Player name is required"):
        room_manager.join_room(room.room_code, "")
    
    # Try to join with name too long
    with pytest.raises(ValueError, match="Player name must be 20 characters or less"):
        room_manager.join_room(room.room_code, "a" * 21)
