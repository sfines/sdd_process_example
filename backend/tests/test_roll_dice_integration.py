"""Backend integration tests for full dice roll flow - TDD approach.

Tests the complete flow: roll_dice event → DiceEngine → RoomManager
persistence → broadcast.
"""

import json
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from sdd_process_example.socket_manager import roll_dice, sio


@pytest.mark.asyncio
async def test_full_roll_flow_from_event_to_broadcast(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Test complete flow: receive roll_dice → generate → persist → broadcast."""
    # Mock Redis client
    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "mode": "Open",
        "created_at": "2025-11-22T10:00:00Z",
        "creator_player_id": "player1",
        "players": json.dumps(
            [
                {"player_id": "player1", "name": "Alice", "connected": True},
                {"player_id": "player2", "name": "Bob", "connected": True},
            ]
        ),
        "roll_history": "[]",
    }
    mock_redis.hset.return_value = True
    mock_redis.expire.return_value = True

    monkeypatch.setattr(
        "sdd_process_example.socket_manager.get_redis_client",
        lambda: mock_redis,
    )

    # Mock sio.emit to capture broadcasts
    emit_mock = AsyncMock()
    monkeypatch.setattr(sio, "emit", emit_mock)

    # Call roll_dice handler
    await roll_dice(
        "test_sid",
        {
            "formula": "1d20+5",
            "player_name": "Alice",
            "room_code": "TEST-1234",
        },
    )

    # Verify roll was broadcast
    assert emit_mock.call_count == 1
    call_args = emit_mock.call_args
    assert call_args[0][0] == "roll_result"

    roll_data = call_args[0][1]
    assert roll_data["player_name"] == "Alice"
    assert roll_data["formula"] == "1d20+5"
    assert roll_data["modifier"] == 5
    assert 6 <= roll_data["total"] <= 25  # 1d20+5 range

    # Verify roll was persisted to Redis
    mock_redis.hset.assert_called_once()
    hset_call = mock_redis.hset.call_args
    assert hset_call[0][0] == "room:TEST-1234"
    assert hset_call[0][1] == "roll_history"

    # Verify roll history contains the roll
    roll_history_json = hset_call[0][2]
    roll_history = json.loads(roll_history_json)
    assert len(roll_history) == 1
    assert roll_history[0]["player_name"] == "Alice"
    assert roll_history[0]["formula"] == "1d20+5"

    # Verify TTL was refreshed
    mock_redis.expire.assert_called_once_with("room:TEST-1234", 18000)

    # Verify broadcast to correct room
    assert call_args[1]["room"] == "TEST-1234"


@pytest.mark.asyncio
async def test_roll_persists_with_existing_history(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Test that new rolls are appended to existing roll history."""
    # Mock Redis with existing roll
    existing_roll = {
        "roll_id": "old_roll",
        "player_id": "player2",
        "player_name": "Bob",
        "formula": "1d20",
        "individual_results": [10],
        "modifier": 0,
        "total": 10,
        "timestamp": "2025-11-22T09:00:00Z",
    }

    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "mode": "Open",
        "created_at": "2025-11-22T10:00:00Z",
        "creator_player_id": "player1",
        "players": json.dumps(
            [{"player_id": "player1", "name": "Alice", "connected": True}]
        ),
        "roll_history": json.dumps([existing_roll]),
    }
    mock_redis.hset.return_value = True
    mock_redis.expire.return_value = True

    monkeypatch.setattr(
        "sdd_process_example.socket_manager.get_redis_client",
        lambda: mock_redis,
    )

    emit_mock = AsyncMock()
    monkeypatch.setattr(sio, "emit", emit_mock)

    # Roll dice
    await roll_dice(
        "test_sid",
        {
            "formula": "1d20+3",
            "player_name": "Alice",
            "room_code": "TEST-1234",
        },
    )

    # Verify both rolls in history
    hset_call = mock_redis.hset.call_args
    roll_history_json = hset_call[0][2]
    roll_history = json.loads(roll_history_json)

    assert len(roll_history) == 2
    # Old roll preserved
    assert roll_history[0]["roll_id"] == "old_roll"
    assert roll_history[0]["player_name"] == "Bob"
    # New roll appended
    assert roll_history[1]["player_name"] == "Alice"
    assert roll_history[1]["formula"] == "1d20+3"


@pytest.mark.asyncio
async def test_roll_generates_unique_ids(monkeypatch: pytest.MonkeyPatch) -> None:
    """Test that multiple rolls generate unique roll IDs."""
    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "mode": "Open",
        "created_at": "2025-11-22T10:00:00Z",
        "creator_player_id": "player1",
        "players": json.dumps(
            [{"player_id": "player1", "name": "Alice", "connected": True}]
        ),
        "roll_history": "[]",
    }
    mock_redis.hset.return_value = True
    mock_redis.expire.return_value = True

    monkeypatch.setattr(
        "sdd_process_example.socket_manager.get_redis_client",
        lambda: mock_redis,
    )

    emit_mock = AsyncMock()
    monkeypatch.setattr(sio, "emit", emit_mock)

    # Roll twice
    await roll_dice(
        "test_sid",
        {"formula": "1d20", "player_name": "Alice", "room_code": "TEST-1234"},
    )
    await roll_dice(
        "test_sid",
        {"formula": "1d20", "player_name": "Alice", "room_code": "TEST-1234"},
    )

    # Get roll IDs from broadcasts
    first_roll_id = emit_mock.call_args_list[0][0][1]["roll_id"]
    second_roll_id = emit_mock.call_args_list[1][0][1]["roll_id"]

    assert first_roll_id != second_roll_id


@pytest.mark.asyncio
async def test_roll_includes_timestamp(monkeypatch: pytest.MonkeyPatch) -> None:
    """Test that rolls include ISO 8601 timestamps."""
    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "mode": "Open",
        "created_at": "2025-11-22T10:00:00Z",
        "creator_player_id": "player1",
        "players": json.dumps(
            [{"player_id": "player1", "name": "Alice", "connected": True}]
        ),
        "roll_history": "[]",
    }
    mock_redis.hset.return_value = True
    mock_redis.expire.return_value = True

    monkeypatch.setattr(
        "sdd_process_example.socket_manager.get_redis_client",
        lambda: mock_redis,
    )

    emit_mock = AsyncMock()
    monkeypatch.setattr(sio, "emit", emit_mock)

    # Roll dice
    await roll_dice(
        "test_sid",
        {"formula": "1d20", "player_name": "Alice", "room_code": "TEST-1234"},
    )

    # Check timestamp format
    roll_data = emit_mock.call_args[0][1]
    timestamp = roll_data["timestamp"]

    # Should be valid ISO 8601 format
    parsed_time = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    assert parsed_time.tzinfo is not None


@pytest.mark.asyncio
async def test_negative_modifier_rolls(monkeypatch: pytest.MonkeyPatch) -> None:
    """Test rolls with negative modifiers work correctly."""
    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "mode": "Open",
        "created_at": "2025-11-22T10:00:00Z",
        "creator_player_id": "player1",
        "players": json.dumps(
            [{"player_id": "player1", "name": "Alice", "connected": True}]
        ),
        "roll_history": "[]",
    }
    mock_redis.hset.return_value = True
    mock_redis.expire.return_value = True

    monkeypatch.setattr(
        "sdd_process_example.socket_manager.get_redis_client",
        lambda: mock_redis,
    )

    emit_mock = AsyncMock()
    monkeypatch.setattr(sio, "emit", emit_mock)

    # Roll with negative modifier
    await roll_dice(
        "test_sid",
        {"formula": "1d20-3", "player_name": "Alice", "room_code": "TEST-1234"},
    )

    roll_data = emit_mock.call_args[0][1]
    assert roll_data["modifier"] == -3
    assert roll_data["formula"] == "1d20-3"
    assert -2 <= roll_data["total"] <= 17  # 1d20-3 range (1-3 = -2, 20-3 = 17)


@pytest.mark.asyncio
async def test_roll_broadcasts_to_all_room_members(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Test that rolls are broadcast to the entire room, not just the roller."""
    mock_redis = MagicMock()
    mock_redis.hgetall.return_value = {
        "room_code": "TEST-1234",
        "mode": "Open",
        "created_at": "2025-11-22T10:00:00Z",
        "creator_player_id": "player1",
        "players": json.dumps(
            [
                {"player_id": "player1", "name": "Alice", "connected": True},
                {"player_id": "player2", "name": "Bob", "connected": True},
                {"player_id": "player3", "name": "Charlie", "connected": True},
            ]
        ),
        "roll_history": "[]",
    }
    mock_redis.hset.return_value = True
    mock_redis.expire.return_value = True

    monkeypatch.setattr(
        "sdd_process_example.socket_manager.get_redis_client",
        lambda: mock_redis,
    )

    emit_mock = AsyncMock()
    monkeypatch.setattr(sio, "emit", emit_mock)

    # Alice rolls
    await roll_dice(
        "alice_sid",
        {"formula": "1d20", "player_name": "Alice", "room_code": "TEST-1234"},
    )

    # Verify broadcast uses 'room' parameter (not 'to' for single client)
    call_kwargs = emit_mock.call_args[1]
    assert "room" in call_kwargs
    assert call_kwargs["room"] == "TEST-1234"
    assert "to" not in call_kwargs  # Should not be targeted to single client
