"""Tests for connection tracking functionality - Story 3.1."""

from datetime import UTC, datetime, timedelta

import pytest
from redis import Redis

from sdd_process_example.models import Player
from sdd_process_example.services.room_manager import RoomManager


class TestPlayerConnectionFields:
    """Test Player model connection tracking fields."""

    def test_player_has_connected_at_field(self) -> None:
        """Player model should have connected_at datetime field."""
        now = datetime.now(UTC)
        player = Player(
            player_id="test-123",
            name="Alice",
            connected=True,
            connected_at=now,
        )
        assert player.connected_at == now

    def test_player_has_last_activity_field(self) -> None:
        """Player model should have last_activity datetime field."""
        now = datetime.now(UTC)
        player = Player(
            player_id="test-123",
            name="Bob",
            connected=True,
            last_activity=now,
        )
        assert player.last_activity == now

    def test_player_connection_fields_optional(self) -> None:
        """Connection tracking fields should be optional with None default."""
        player = Player(
            player_id="test-123",
            name="Charlie",
            connected=True,
        )
        assert player.connected_at is None
        assert player.last_activity is None


class TestUpdatePlayerStatus:
    """Test RoomManager.update_player_status method."""

    @pytest.fixture
    def room_with_player(
        self, integration_room_manager: RoomManager
    ) -> tuple[str, str, RoomManager]:
        """Create a room with one player, return (room_code, player_id, manager)."""
        room = integration_room_manager.create_room("TestPlayer", player_id="player-123")
        return room.room_code, "player-123", integration_room_manager

    @pytest.mark.integration
    def test_update_player_status_to_disconnected(
        self, room_with_player: tuple[str, str, RoomManager]
    ) -> None:
        """update_player_status should mark player as disconnected."""
        room_code, player_id, room_manager = room_with_player

        # Update status to disconnected
        room_manager.update_player_status(room_code, player_id, connected=False)

        # Verify
        room = room_manager.get_room(room_code)
        assert room is not None
        player = next(p for p in room.players if p.player_id == player_id)
        assert player.connected is False

    @pytest.mark.integration
    def test_update_player_status_to_connected(
        self, room_with_player: tuple[str, str, RoomManager]
    ) -> None:
        """update_player_status should mark player as connected."""
        room_code, player_id, room_manager = room_with_player

        # First disconnect
        room_manager.update_player_status(room_code, player_id, connected=False)
        # Then reconnect
        room_manager.update_player_status(room_code, player_id, connected=True)

        # Verify
        room = room_manager.get_room(room_code)
        assert room is not None
        player = next(p for p in room.players if p.player_id == player_id)
        assert player.connected is True

    @pytest.mark.integration
    def test_update_player_status_updates_last_activity(
        self, room_with_player: tuple[str, str, RoomManager]
    ) -> None:
        """update_player_status should update last_activity timestamp."""
        room_code, player_id, room_manager = room_with_player
        before = datetime.now(UTC)

        room_manager.update_player_status(room_code, player_id, connected=False)

        room = room_manager.get_room(room_code)
        assert room is not None
        player = next(p for p in room.players if p.player_id == player_id)
        assert player.last_activity is not None
        assert player.last_activity >= before

    @pytest.mark.integration
    def test_update_player_status_nonexistent_room(
        self, integration_room_manager: RoomManager
    ) -> None:
        """update_player_status should handle nonexistent room gracefully."""
        # Should not raise, just log warning
        integration_room_manager.update_player_status(
            "FAKE-CODE", "player-123", connected=False
        )

    @pytest.mark.integration
    def test_update_player_status_nonexistent_player(
        self, room_with_player: tuple[str, str, RoomManager]
    ) -> None:
        """update_player_status should handle nonexistent player gracefully."""
        room_code, _, room_manager = room_with_player
        # Should not raise, just log warning
        room_manager.update_player_status(room_code, "fake-player", connected=False)


class TestGetDisconnectedPlayers:
    """Test RoomManager.get_disconnected_players method."""

    @pytest.mark.integration
    def test_get_disconnected_players_returns_empty_when_all_connected(
        self, integration_room_manager: RoomManager
    ) -> None:
        """get_disconnected_players returns empty list when all players connected."""
        room = integration_room_manager.create_room("Player1", player_id="p1")
        integration_room_manager.join_room(room.room_code, "Player2", player_id="p2")

        disconnected = integration_room_manager.get_disconnected_players(room.room_code)
        assert disconnected == []

    @pytest.mark.integration
    def test_get_disconnected_players_returns_disconnected(
        self, integration_room_manager: RoomManager
    ) -> None:
        """get_disconnected_players returns list of disconnected players."""
        room = integration_room_manager.create_room("Player1", player_id="p1")
        integration_room_manager.join_room(room.room_code, "Player2", player_id="p2")

        # Disconnect player 2
        integration_room_manager.update_player_status(
            room.room_code, "p2", connected=False
        )

        disconnected = integration_room_manager.get_disconnected_players(room.room_code)
        assert len(disconnected) == 1
        assert disconnected[0].player_id == "p2"
        assert disconnected[0].name == "Player2"

    @pytest.mark.integration
    def test_get_disconnected_players_nonexistent_room(
        self, integration_room_manager: RoomManager
    ) -> None:
        """get_disconnected_players returns empty list for nonexistent room."""
        disconnected = integration_room_manager.get_disconnected_players("FAKE-CODE")
        assert disconnected == []
