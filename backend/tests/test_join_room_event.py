"""Tests for Socket.IO join_room event handler."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from sdd_process_example.models import Player, RoomState
from sdd_process_example.services.room_manager import RoomManager


@pytest.mark.asyncio
async def test_join_room_event_success(mock_redis: MagicMock) -> None:
    """Test successful join_room event handling."""
    # Import the socket manager
    from sdd_process_example import socket_manager

    # Mock room exists
    mock_redis.exists.return_value = True
    
    # Mock existing room data
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

    # Mock socket and emit
    mock_sid = "test-session-id"
    mock_emit = AsyncMock()
    mock_enter_room = AsyncMock()

    with patch("sdd_process_example.socket_manager.get_redis_client") as mock_get_redis:
        mock_get_redis.return_value = mock_redis
        with patch.object(socket_manager, "sio") as mock_sio:
            mock_sio.emit = mock_emit
            mock_sio.enter_room = mock_enter_room

            # Call join_room event handler
            await socket_manager.join_room(
                mock_sid,
                {"room_code": "ALPHA-1234", "player_name": "Bob"},
            )

    # Verify room_joined emitted to joining player
    assert mock_emit.call_count == 2  # room_joined + player_joined broadcast

    # First call: room_joined to joining player
    call_args = mock_emit.call_args_list[0]
    assert call_args[0][0] == "room_joined"
    room_state = call_args[0][1]
    assert room_state["room_code"] == "ALPHA-1234"
    assert len(room_state["players"]) == 2

    # Second call: player_joined broadcast
    call_args = mock_emit.call_args_list[1]
    assert call_args[0][0] == "player_joined"
    assert "player_id" in call_args[0][1]
    assert "name" in call_args[0][1]
    assert call_args[0][1]["name"] == "Bob"

    # Verify socket entered room
    mock_enter_room.assert_called_once()


@pytest.mark.asyncio
async def test_join_room_event_room_not_found(mock_redis: MagicMock) -> None:
    """Test join_room event with non-existent room."""
    from sdd_process_example import socket_manager

    # Mock room doesn't exist
    mock_redis.exists.return_value = False

    mock_sid = "test-session-id"
    mock_emit = AsyncMock()

    with patch("sdd_process_example.socket_manager.get_redis_client") as mock_get_redis:
        mock_get_redis.return_value = mock_redis
        with patch.object(socket_manager, "sio") as mock_sio:
            mock_sio.emit = mock_emit

            # Try to join non-existent room
            await socket_manager.join_room(
                mock_sid,
                {"room_code": "NONEXISTENT-9999", "player_name": "Charlie"},
            )

    # Verify error emitted
    mock_emit.assert_called_once()
    call_args = mock_emit.call_args[0]
    assert call_args[0] == "error"
    assert "not found" in call_args[1]["message"].lower()


@pytest.mark.asyncio
async def test_join_room_event_room_full(mock_redis: MagicMock) -> None:
    """Test join_room event when room is at capacity."""
    from sdd_process_example import socket_manager

    # Mock room exists
    mock_redis.exists.return_value = True
    
    # Create room with 8 players (at capacity)
    players = [
        {"player_id": f"player-{i}", "name": f"Player{i}", "connected": True}
        for i in range(1, 9)
    ]
    room_data = {
        "room_code": "FULL-1234",
        "mode": "Open",
        "created_at": "2024-01-01T00:00:00Z",
        "creator_player_id": "player-1",
        "players": json.dumps(players),
        "roll_history": json.dumps([]),
    }
    mock_redis.hgetall.return_value = room_data

    mock_sid = "test-session-id"
    mock_emit = AsyncMock()

    with patch("sdd_process_example.socket_manager.get_redis_client") as mock_get_redis:
        mock_get_redis.return_value = mock_redis
        with patch.object(socket_manager, "sio") as mock_sio:
            mock_sio.emit = mock_emit

            # Try to join full room
            await socket_manager.join_room(
                mock_sid,
                {"room_code": "FULL-1234", "player_name": "Player9"},
            )

    # Verify error emitted
    mock_emit.assert_called_once()
    call_args = mock_emit.call_args[0]
    assert call_args[0] == "error"
    error_msg = call_args[1]["message"].lower()
    assert "full" in error_msg or "capacity" in error_msg


@pytest.mark.asyncio
async def test_join_room_event_invalid_player_name() -> None:
    """Test join_room event with invalid player name."""
    from sdd_process_example import socket_manager

    mock_sid = "test-session-id"
    mock_emit = AsyncMock()

    with patch.object(socket_manager, "sio") as mock_sio:
        mock_sio.emit = mock_emit

        # Try to join with empty name
        await socket_manager.join_room(
            mock_sid,
            {"room_code": "ALPHA-1234", "player_name": ""},
        )

    # Verify error emitted
    mock_emit.assert_called_once()
    call_args = mock_emit.call_args[0]
    assert call_args[0] == "error"
    assert "name" in call_args[1]["message"].lower()

