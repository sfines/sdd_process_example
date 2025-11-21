"""Tests for room manager service."""

from unittest.mock import MagicMock, patch

import pytest

from sdd_process_example.models import RoomState
from sdd_process_example.services.room_manager import RoomManager


@pytest.fixture
def mock_redis() -> MagicMock:
    """Create a mock Redis client."""
    return MagicMock()


@pytest.fixture
def room_manager(mock_redis: MagicMock) -> RoomManager:
    """Create a RoomManager instance with mocked Redis."""
    return RoomManager(mock_redis)


class TestRoomManagerCreateRoom:
    """Tests for RoomManager.create_room()."""

    @patch("sdd_process_example.services.room_manager.generate_room_code")
    @patch("sdd_process_example.services.room_manager.is_code_available")
    def test_creates_room_successfully(
        self,
        mock_is_available: MagicMock,
        mock_generate_code: MagicMock,
        room_manager: RoomManager,
        mock_redis: MagicMock,
    ) -> None:
        """Test successful room creation."""
        mock_generate_code.return_value = "ALPHA-1234"
        mock_is_available.return_value = True

        result = room_manager.create_room("Alice")

        assert isinstance(result, RoomState)
        assert result.room_code == "ALPHA-1234"
        assert result.mode == "Open"
        assert result.creator_player_id
        assert len(result.players) == 1
        assert result.players[0].name == "Alice"
        assert result.players[0].connected is True

    @patch("sdd_process_example.services.room_manager.generate_room_code")
    @patch("sdd_process_example.services.room_manager.is_code_available")
    def test_sanitizes_player_name(
        self,
        mock_is_available: MagicMock,
        mock_generate_code: MagicMock,
        room_manager: RoomManager,
    ) -> None:
        """Test that player name is sanitized before storing."""
        mock_generate_code.return_value = "BRAVO-5678"
        mock_is_available.return_value = True

        result = room_manager.create_room("<b>Alice</b>")

        # Name should be HTML-escaped
        assert "&lt;" in result.players[0].name
        assert "&gt;" in result.players[0].name
        assert "<b>" not in result.players[0].name

    @patch("sdd_process_example.services.room_manager.generate_room_code")
    @patch("sdd_process_example.services.room_manager.is_code_available")
    def test_handles_collision_and_retries(
        self,
        mock_is_available: MagicMock,
        mock_generate_code: MagicMock,
        room_manager: RoomManager,
    ) -> None:
        """Test collision detection and retry logic."""
        # First two codes taken, third is available
        mock_generate_code.side_effect = ["ALPHA-1234", "BRAVO-5678", "CHARLIE-9999"]
        mock_is_available.side_effect = [False, False, True]

        result = room_manager.create_room("Alice")

        assert result.room_code == "CHARLIE-9999"
        assert mock_generate_code.call_count == 3
        assert mock_is_available.call_count == 3

    @patch("sdd_process_example.services.room_manager.generate_room_code")
    @patch("sdd_process_example.services.room_manager.is_code_available")
    def test_raises_error_after_max_retries(
        self,
        mock_is_available: MagicMock,
        mock_generate_code: MagicMock,
        room_manager: RoomManager,
    ) -> None:
        """Test that error is raised after max collision retries."""
        mock_generate_code.return_value = "ALPHA-1234"
        mock_is_available.return_value = False  # Always taken

        with pytest.raises(RuntimeError, match="Could not generate unique room code"):
            room_manager.create_room("Alice")

    @patch("sdd_process_example.services.room_manager.generate_room_code")
    @patch("sdd_process_example.services.room_manager.is_code_available")
    def test_stores_room_in_redis(
        self,
        mock_is_available: MagicMock,
        mock_generate_code: MagicMock,
        room_manager: RoomManager,
        mock_redis: MagicMock,
    ) -> None:
        """Test that room is stored in Redis with correct format."""
        mock_generate_code.return_value = "DELTA-0000"
        mock_is_available.return_value = True

        room_manager.create_room("Alice")

        # Verify Redis hset was called with correct key
        mock_redis.hset.assert_called_once()
        call_args = mock_redis.hset.call_args
        assert call_args[0][0] == "room:DELTA-0000"

        # Verify data structure
        room_data = call_args[1]["mapping"]
        assert "room_code" in room_data
        assert "mode" in room_data
        assert "players" in room_data

    @patch("sdd_process_example.services.room_manager.generate_room_code")
    @patch("sdd_process_example.services.room_manager.is_code_available")
    def test_sets_redis_ttl(
        self,
        mock_is_available: MagicMock,
        mock_generate_code: MagicMock,
        room_manager: RoomManager,
        mock_redis: MagicMock,
    ) -> None:
        """Test that Redis TTL is set to 18000 seconds (5 hours)."""
        mock_generate_code.return_value = "ECHO-1111"
        mock_is_available.return_value = True

        room_manager.create_room("Alice")

        mock_redis.expire.assert_called_once_with("room:ECHO-1111", 18000)

    def test_validates_player_name(self, room_manager: RoomManager) -> None:
        """Test that invalid player names are rejected."""
        with pytest.raises(ValueError, match="required"):
            room_manager.create_room("")

        with pytest.raises(ValueError, match="20 characters"):
            room_manager.create_room("A" * 21)
