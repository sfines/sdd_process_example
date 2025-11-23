"""Tests for join_room functionality in RoomManager."""

import json
from unittest.mock import MagicMock, patch

import pytest

from sdd_process_example.models import Player, RoomState
from sdd_process_example.services.room_manager import (
    RoomCapacityExceededError,
    RoomManager,
    RoomNotFoundError,
)


def test_join_room_adds_player_to_existing_room(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that join_room() adds player to existing room."""
    # Mock room exists check and get_room
    mock_redis.exists.return_value = True
    
    # Create existing room data
    existing_room = RoomState(
        room_code="ALPHA-1234",
        mode="Open",
        created_at="2024-01-01T00:00:00Z",
        creator_player_id="player-1",
        players=[
            Player(player_id="player-1", name="Alice", connected=True)
        ],
        roll_history=[],
    )
    
    # Mock hgetall to return room data
    room_data = existing_room.model_dump()
    mock_redis.hgetall.return_value = {
        "room_code": room_data["room_code"],
        "mode": room_data["mode"],
        "created_at": room_data["created_at"],
        "creator_player_id": room_data["creator_player_id"],
        "players": json.dumps(room_data["players"]),
        "roll_history": json.dumps(room_data["roll_history"]),
    }

    # Join the room
    updated_room = room_manager.join_room("ALPHA-1234", "Bob")

    # Verify Bob was added
    assert len(updated_room.players) == 2
    assert updated_room.players[0].name == "Alice"
    assert updated_room.players[1].name == "Bob"
    assert updated_room.players[1].connected is True
    
    # Verify Redis hset was called to update the room
    mock_redis.hset.assert_called_once()


def test_join_room_raises_error_for_nonexistent_room(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that join_room() raises RoomNotFoundError for non-existent room."""
    # Mock room doesn't exist
    mock_redis.exists.return_value = False
    
    # Try to join non-existent room
    with pytest.raises(RoomNotFoundError, match="Room .* not found"):
        room_manager.join_room("NONEXISTENT-9999", "Charlie")


def test_join_room_raises_error_when_room_at_capacity(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that join_room() raises RoomCapacityExceededError when room full."""
    # Mock room exists
    mock_redis.exists.return_value = True
    
    # Create room with 8 players (at capacity)
    full_room = RoomState(
        room_code="FULL-1234",
        mode="Open",
        created_at="2024-01-01T00:00:00Z",
        creator_player_id="player-1",
        players=[
            Player(player_id=f"player-{i}", name=f"Player{i}", connected=True)
            for i in range(1, 9)
        ],
        roll_history=[],
    )
    
    room_data = full_room.model_dump()
    mock_redis.hgetall.return_value = {
        "room_code": room_data["room_code"],
        "mode": room_data["mode"],
        "created_at": room_data["created_at"],
        "creator_player_id": room_data["creator_player_id"],
        "players": json.dumps(room_data["players"]),
        "roll_history": json.dumps(room_data["roll_history"]),
    }

    # Try to add 9th player
    with pytest.raises(RoomCapacityExceededError, match="Room .* is at full capacity"):
        room_manager.join_room("FULL-1234", "Player9")


def test_join_room_sanitizes_player_name(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that join_room() sanitizes player names to prevent XSS."""
    # Mock room exists
    mock_redis.exists.return_value = True
    
    existing_room = RoomState(
        room_code="XSS-1234",
        mode="Open",
        created_at="2024-01-01T00:00:00Z",
        creator_player_id="player-1",
        players=[
            Player(player_id="player-1", name="Alice", connected=True)
        ],
        roll_history=[],
    )
    
    room_data = existing_room.model_dump()
    mock_redis.hgetall.return_value = {
        "room_code": room_data["room_code"],
        "mode": room_data["mode"],
        "created_at": room_data["created_at"],
        "creator_player_id": room_data["creator_player_id"],
        "players": json.dumps(room_data["players"]),
        "roll_history": json.dumps(room_data["roll_history"]),
    }

    # Join with XSS payload
    xss_name = "<script>x</script>"
    updated_room = room_manager.join_room("XSS-1234", xss_name)

    # Verify name was sanitized
    assert "&lt;" in updated_room.players[1].name
    assert "&gt;" in updated_room.players[1].name
    assert "<" not in updated_room.players[1].name
    assert ">" not in updated_room.players[1].name


def test_join_room_generates_unique_player_id(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that join_room() generates unique player_id for each player."""
    # Mock room exists
    mock_redis.exists.return_value = True
    
    existing_room = RoomState(
        room_code="ID-1234",
        mode="Open",
        created_at="2024-01-01T00:00:00Z",
        creator_player_id="player-1",
        players=[
            Player(player_id="player-1", name="Player1", connected=True)
        ],
        roll_history=[],
    )
    
    room_data = existing_room.model_dump()
    mock_redis.hgetall.return_value = {
        "room_code": room_data["room_code"],
        "mode": room_data["mode"],
        "created_at": room_data["created_at"],
        "creator_player_id": room_data["creator_player_id"],
        "players": json.dumps(room_data["players"]),
        "roll_history": json.dumps(room_data["roll_history"]),
    }

    # Join the room
    updated_room = room_manager.join_room("ID-1234", "Player2")

    # Verify player IDs are unique
    player_ids = [player.player_id for player in updated_room.players]
    assert len(player_ids) == len(set(player_ids))
    assert len(player_ids) == 2


def test_join_room_validates_player_name(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that join_room() validates player name."""
    # Try to join with empty name
    with pytest.raises(ValueError, match="Player name is required"):
        room_manager.join_room("ALPHA-1234", "")

    # Try to join with name too long
    with pytest.raises(ValueError, match="Player name must be 20 characters or less"):
        room_manager.join_room("ALPHA-1234", "a" * 21)

