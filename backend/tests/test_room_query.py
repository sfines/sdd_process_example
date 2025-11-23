"""Tests for room query methods in RoomManager."""

import json
from unittest.mock import MagicMock

import pytest

from sdd_process_example.services.room_manager import RoomManager


def test_get_room_returns_existing_room(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that get_room() returns room state for existing room."""
    # Mock room exists
    mock_redis.exists.return_value = True
    
    # Mock hgetall to return room data
    room_data = {
        "room_code": "ALPHA-1234",
        "mode": "Open",
        "created_at": "2024-01-01T00:00:00Z",
        "creator_player_id": "player-1",
        "players": json.dumps([
            {"player_id": "player-1", "name": "Alice", "connected": True}
        ]),
        "roll_history": json.dumps([]),
    }
    mock_redis.hgetall.return_value = room_data

    # Query the room
    retrieved_room = room_manager.get_room("ALPHA-1234")

    # Verify room was retrieved
    assert retrieved_room is not None
    assert retrieved_room.room_code == "ALPHA-1234"
    assert retrieved_room.creator_player_id == "player-1"
    assert len(retrieved_room.players) == 1
    assert retrieved_room.players[0].name == "Alice"


def test_get_room_returns_none_for_nonexistent_room(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that get_room() returns None for non-existent room."""
    # Mock room doesn't exist
    mock_redis.exists.return_value = False
    
    # Query non-existent room
    retrieved_room = room_manager.get_room("NONEXISTENT-9999")

    # Verify None returned
    assert retrieved_room is None


def test_room_exists_returns_true_for_existing_room(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that room_exists() returns True for existing room."""
    # Mock room exists
    mock_redis.exists.return_value = True

    # Check if room exists
    exists = room_manager.room_exists("BRAVO-5678")

    # Verify room exists
    assert exists is True
    mock_redis.exists.assert_called_once_with("room:BRAVO-5678")


def test_room_exists_returns_false_for_nonexistent_room(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that room_exists() returns False for non-existent room."""
    # Mock room doesn't exist
    mock_redis.exists.return_value = False
    
    # Check if non-existent room exists
    exists = room_manager.room_exists("NONEXISTENT-8888")

    # Verify room does not exist
    assert exists is False


def test_get_room_capacity_returns_current_and_max(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that get_room_capacity() returns current player count and max capacity."""
    # Mock room exists
    mock_redis.exists.return_value = True
    
    room_data = {
        "room_code": "CHARLIE-1111",
        "mode": "Open",
        "created_at": "2024-01-01T00:00:00Z",
        "creator_player_id": "player-1",
        "players": json.dumps([
            {"player_id": "player-1", "name": "Charlie", "connected": True}
        ]),
        "roll_history": json.dumps([]),
    }
    mock_redis.hgetall.return_value = room_data

    # Get capacity
    current, max_capacity = room_manager.get_room_capacity("CHARLIE-1111")

    # Verify capacity
    assert current == 1  # One player (creator)
    assert max_capacity == 8  # Max capacity from spec


def test_get_room_capacity_for_nonexistent_room_raises_error(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that get_room_capacity() raises error for non-existent room."""
    # Mock room doesn't exist
    mock_redis.exists.return_value = False
    
    # Try to get capacity for non-existent room
    with pytest.raises(ValueError, match="Room .* not found"):
        room_manager.get_room_capacity("NONEXISTENT-7777")

