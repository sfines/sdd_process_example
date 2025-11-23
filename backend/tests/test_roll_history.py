"""Tests for roll history persistence in RoomManager - TDD approach."""

import json
from datetime import UTC, datetime
from unittest.mock import MagicMock

import pytest

from sdd_process_example.models import DiceResult
from sdd_process_example.services.room_manager import RoomManager


@pytest.fixture
def mock_redis() -> MagicMock:
    """Create a mock Redis client."""
    return MagicMock()


@pytest.fixture
def room_manager(mock_redis: MagicMock) -> RoomManager:
    """Create RoomManager with mock Redis."""
    return RoomManager(mock_redis)


def test_add_roll_to_history_method_exists(room_manager: RoomManager) -> None:
    """Test that add_roll_to_history method exists on RoomManager."""
    assert hasattr(room_manager, "add_roll_to_history")
    assert callable(room_manager.add_roll_to_history)


def test_add_roll_to_history_appends_roll_to_redis(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that add_roll_to_history appends roll to Redis room hash."""
    # Setup: Mock existing room with empty roll history
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "mode": "Open",
        "created_at": "2025-11-22T10:00:00Z",
        "creator_player_id": "player1",
        "players": "[]",
        "roll_history": "[]",
    }

    # Create a DiceResult
    roll = DiceResult(
        roll_id="roll123",
        player_id="player1",
        player_name="Alice",
        formula="1d20+5",
        individual_results=[15],
        modifier=5,
        total=20,
        timestamp=datetime.now(UTC),
    )

    # Call add_roll_to_history
    room_manager.add_roll_to_history("TEST-1234", roll)

    # Verify Redis was updated with roll appended
    mock_redis.hset.assert_called_once()
    call_args = mock_redis.hset.call_args
    assert call_args[0][0] == "room:TEST-1234"
    assert call_args[0][1] == "roll_history"

    # Verify roll_history field was updated with serialized roll
    roll_history_json = call_args[0][2]
    roll_history = json.loads(roll_history_json)
    assert len(roll_history) == 1
    assert roll_history[0]["roll_id"] == "roll123"
    assert roll_history[0]["player_name"] == "Alice"
    assert roll_history[0]["total"] == 20


def test_add_roll_to_history_preserves_existing_rolls(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that add_roll_to_history preserves existing rolls."""
    # Setup: Mock room with existing roll
    existing_roll = {
        "roll_id": "old_roll",
        "player_id": "player2",
        "player_name": "Bob",
        "formula": "1d20",
        "individual_results": [12],
        "modifier": 0,
        "total": 12,
        "timestamp": "2025-11-22T09:00:00Z",
    }
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "mode": "Open",
        "created_at": "2025-11-22T10:00:00Z",
        "creator_player_id": "player1",
        "players": "[]",
        "roll_history": json.dumps([existing_roll]),
    }

    # Create new roll
    new_roll = DiceResult(
        roll_id="new_roll",
        player_id="player1",
        player_name="Alice",
        formula="1d20+3",
        individual_results=[18],
        modifier=3,
        total=21,
        timestamp=datetime.now(UTC),
    )

    # Add new roll
    room_manager.add_roll_to_history("TEST-1234", new_roll)

    # Verify both rolls are in history
    call_args = mock_redis.hset.call_args
    roll_history_json = call_args[0][2]
    roll_history = json.loads(roll_history_json)
    assert len(roll_history) == 2
    assert roll_history[0]["roll_id"] == "old_roll"
    assert roll_history[1]["roll_id"] == "new_roll"


def test_add_roll_to_history_refreshes_ttl(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that add_roll_to_history refreshes room TTL."""
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "mode": "Open",
        "created_at": "2025-11-22T10:00:00Z",
        "creator_player_id": "player1",
        "players": "[]",
        "roll_history": "[]",
    }

    roll = DiceResult(
        roll_id="roll123",
        player_id="player1",
        player_name="Alice",
        formula="1d20",
        individual_results=[10],
        modifier=0,
        total=10,
        timestamp=datetime.now(UTC),
    )

    room_manager.add_roll_to_history("TEST-1234", roll)

    # Verify TTL was refreshed (18000 seconds = 5 hours)
    mock_redis.expire.assert_called_once_with("room:TEST-1234", 18000)


def test_get_roll_history_method_exists(room_manager: RoomManager) -> None:
    """Test that get_roll_history method exists on RoomManager."""
    assert hasattr(room_manager, "get_roll_history")
    assert callable(room_manager.get_roll_history)


def test_get_roll_history_returns_all_rolls(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that get_roll_history returns all rolls from Redis."""
    # Setup: Mock room with 3 rolls
    rolls_data = [
        {
            "roll_id": "roll1",
            "player_id": "p1",
            "player_name": "Alice",
            "formula": "1d20",
            "individual_results": [15],
            "modifier": 0,
            "total": 15,
            "timestamp": "2025-11-22T10:00:00Z",
        },
        {
            "roll_id": "roll2",
            "player_id": "p2",
            "player_name": "Bob",
            "formula": "1d20+5",
            "individual_results": [12],
            "modifier": 5,
            "total": 17,
            "timestamp": "2025-11-22T10:01:00Z",
        },
        {
            "roll_id": "roll3",
            "player_id": "p1",
            "player_name": "Alice",
            "formula": "1d20-2",
            "individual_results": [8],
            "modifier": -2,
            "total": 6,
            "timestamp": "2025-11-22T10:02:00Z",
        },
    ]
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "roll_history": json.dumps(rolls_data),
    }

    # Get roll history
    history = room_manager.get_roll_history("TEST-1234")

    # Verify all rolls returned as DiceResult objects
    assert len(history) == 3
    assert all(isinstance(roll, DiceResult) for roll in history)
    assert history[0].roll_id == "roll1"
    assert history[1].roll_id == "roll2"
    assert history[2].roll_id == "roll3"


def test_get_roll_history_with_pagination(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that get_roll_history supports offset and limit."""
    # Setup: Mock room with 10 rolls
    rolls_data = [
        {
            "roll_id": f"roll{i}",
            "player_id": "p1",
            "player_name": "Player",
            "formula": "1d20",
            "individual_results": [10],
            "modifier": 0,
            "total": 10,
            "timestamp": f"2025-11-22T10:0{i}:00Z",
        }
        for i in range(10)
    ]
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "roll_history": json.dumps(rolls_data),
    }

    # Get rolls with offset=3, limit=5
    history = room_manager.get_roll_history("TEST-1234", offset=3, limit=5)

    # Verify correct slice returned
    assert len(history) == 5
    assert history[0].roll_id == "roll3"
    assert history[4].roll_id == "roll7"


def test_get_roll_history_returns_empty_for_nonexistent_room(
    room_manager: RoomManager, mock_redis: MagicMock
) -> None:
    """Test that get_roll_history returns empty list for nonexistent room."""
    mock_redis.hgetall.return_value = {}

    history = room_manager.get_roll_history("NONEXISTENT")

    assert history == []
