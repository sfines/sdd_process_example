"""Tests for Socket.IO create_room event handler."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from sdd_process_example.socket_manager import sio


@pytest.mark.asyncio
class TestCreateRoomEvent:
    """Tests for create_room Socket.IO event handler."""

    @patch("sdd_process_example.socket_manager.get_redis_client")
    async def test_successful_room_creation(
        self,
        mock_get_redis: MagicMock,
    ) -> None:
        """Test successful room creation via Socket.IO."""
        mock_redis = MagicMock()
        mock_redis.exists.return_value = False
        mock_get_redis.return_value = mock_redis

        # Mock the emit and enter_room methods
        sio.emit = AsyncMock()
        sio.enter_room = AsyncMock()

        # Simulate client sending create_room event
        sid = "test_session_123"
        data = {"player_name": "Alice"}

        # Import the handler to trigger it
        from sdd_process_example import socket_manager

        await socket_manager.create_room(sid, data)

        # Verify room_created event was emitted
        sio.emit.assert_called_once()
        call_args = sio.emit.call_args
        assert call_args[0][0] == "room_created"
        assert call_args[1]["to"] == sid

        # Verify room data structure
        room_data = call_args[0][1]
        assert "room_code" in room_data
        assert room_data["mode"] == "Open"
        assert len(room_data["players"]) == 1
        assert room_data["players"][0]["name"] == "Alice"

    @patch("sdd_process_example.socket_manager.get_redis_client")
    async def test_missing_player_name(
        self,
        mock_get_redis: MagicMock,
    ) -> None:
        """Test error when player_name is missing."""
        mock_redis = MagicMock()
        mock_get_redis.return_value = mock_redis

        sio.emit = AsyncMock()

        sid = "test_session_456"
        data: dict[str, str] = {}  # Missing player_name

        from sdd_process_example import socket_manager

        await socket_manager.create_room(sid, data)

        # Verify error event was emitted
        sio.emit.assert_called_once()
        call_args = sio.emit.call_args
        assert call_args[0][0] == "error"
        assert call_args[1]["to"] == sid
        assert "player_name" in call_args[0][1]["message"].lower()

    @patch("sdd_process_example.socket_manager.get_redis_client")
    async def test_invalid_player_name_too_long(
        self,
        mock_get_redis: MagicMock,
    ) -> None:
        """Test error when player_name is too long."""
        mock_redis = MagicMock()
        mock_get_redis.return_value = mock_redis

        sio.emit = AsyncMock()

        sid = "test_session_789"
        data = {"player_name": "A" * 21}  # Too long

        from sdd_process_example import socket_manager

        await socket_manager.create_room(sid, data)

        # Verify error event was emitted
        sio.emit.assert_called_once()
        call_args = sio.emit.call_args
        assert call_args[0][0] == "error"
        assert "20 characters" in call_args[0][1]["message"]

    @patch("sdd_process_example.socket_manager.get_redis_client")
    async def test_sanitizes_player_name(
        self,
        mock_get_redis: MagicMock,
    ) -> None:
        """Test that player name is sanitized in response."""
        mock_redis = MagicMock()
        mock_redis.exists.return_value = False
        mock_get_redis.return_value = mock_redis

        sio.emit = AsyncMock()
        sio.enter_room = AsyncMock()

        sid = "test_session_xss"
        data = {"player_name": "<b>Alice</b>"}

        from sdd_process_example import socket_manager

        await socket_manager.create_room(sid, data)

        # Verify room_created was emitted with sanitized name
        call_args = sio.emit.call_args
        room_data = call_args[0][1]
        player_name = room_data["players"][0]["name"]

        assert "&lt;" in player_name
        assert "&gt;" in player_name
        assert "<b>" not in player_name
