"""Tests for room-related models."""

import pytest
from pydantic import ValidationError

from sdd_process_example.models import Player, RoomState


class TestPlayer:
    """Tests for Player model."""

    def test_creates_player_with_required_fields(self) -> None:
        """Test creating a player with all required fields."""
        player = Player(
            player_id="abc123",
            name="Alice",
            connected=True,
        )

        assert player.player_id == "abc123"
        assert player.name == "Alice"
        assert player.connected is True

    def test_player_id_is_required(self) -> None:
        """Test that player_id is required."""
        with pytest.raises(ValidationError):
            Player(name="Alice", connected=True)  # type: ignore

    def test_name_is_required(self) -> None:
        """Test that name is required."""
        with pytest.raises(ValidationError):
            Player(player_id="abc123", connected=True)  # type: ignore

    def test_connected_defaults_to_true(self) -> None:
        """Test that connected defaults to True if not provided."""
        player = Player(player_id="abc123", name="Alice")
        assert player.connected is True


class TestRoomState:
    """Tests for RoomState model."""

    def test_creates_room_with_required_fields(self) -> None:
        """Test creating a room with all required fields."""
        room = RoomState(
            room_code="ALPHA-1234",
            mode="Open",
            created_at="2024-01-15T10:30:00Z",
            creator_player_id="abc123",
            players=[],
            roll_history=[],
        )

        assert room.room_code == "ALPHA-1234"
        assert room.mode == "Open"
        assert room.created_at == "2024-01-15T10:30:00Z"
        assert room.creator_player_id == "abc123"
        assert room.players == []
        assert room.roll_history == []

    def test_room_code_is_required(self) -> None:
        """Test that room_code is required."""
        with pytest.raises(ValidationError):
            RoomState(  # type: ignore
                mode="Open",
                created_at="2024-01-15T10:30:00Z",
                creator_player_id="abc123",
                players=[],
                roll_history=[],
            )

    def test_creates_room_with_players(self) -> None:
        """Test creating a room with player list."""
        players = [
            Player(player_id="abc123", name="Alice", connected=True),
            Player(player_id="def456", name="Bob", connected=False),
        ]

        room = RoomState(
            room_code="BRAVO-5678",
            mode="Open",
            created_at="2024-01-15T10:30:00Z",
            creator_player_id="abc123",
            players=players,
            roll_history=[],
        )

        assert len(room.players) == 2
        assert room.players[0].name == "Alice"
        assert room.players[1].name == "Bob"

    def test_mode_defaults_to_open(self) -> None:
        """Test that mode defaults to 'Open' if not provided."""
        room = RoomState(
            room_code="CHARLIE-9999",
            created_at="2024-01-15T10:30:00Z",
            creator_player_id="abc123",
            players=[],
            roll_history=[],
        )

        assert room.mode == "Open"

    def test_players_defaults_to_empty_list(self) -> None:
        """Test that players defaults to empty list if not provided."""
        room = RoomState(
            room_code="DELTA-0000",
            mode="Open",
            created_at="2024-01-15T10:30:00Z",
            creator_player_id="abc123",
            roll_history=[],
        )

        assert room.players == []

    def test_roll_history_defaults_to_empty_list(self) -> None:
        """Test that roll_history defaults to empty list if not provided."""
        room = RoomState(
            room_code="ECHO-1111",
            mode="Open",
            created_at="2024-01-15T10:30:00Z",
            creator_player_id="abc123",
            players=[],
        )

        assert room.roll_history == []
