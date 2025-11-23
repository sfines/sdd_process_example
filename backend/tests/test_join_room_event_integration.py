"""Integration tests for Socket.IO join_room event handler.

These tests require a running Redis instance and are marked with @pytest.mark.integration.
They test the actual Redis interactions rather than mocking them.

To run these tests:
    uv run nox -s integration

Note: These tests are not run in CI/CD pipelines.
"""

from unittest.mock import AsyncMock, patch

import pytest

from sdd_process_example.services.room_manager import RoomManager


@pytest.mark.integration
@pytest.mark.asyncio
async def test_join_room_event_success_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test successful join_room event handling with real Redis."""
    # Import the socket manager
    from sdd_process_example import socket_manager

    # Create a room first
    room = integration_room_manager.create_room("Alice")

    # Mock socket and emit
    mock_sid = "test-session-id"
    mock_emit = AsyncMock()
    mock_enter_room = AsyncMock()

    with patch.object(socket_manager, "sio") as mock_sio:
        mock_sio.emit = mock_emit
        mock_sio.enter_room = mock_enter_room

        # Call join_room event handler
        await socket_manager.join_room(
            mock_sid,
            {"room_code": room.room_code, "player_name": "Bob"},
        )

    # Verify room_joined emitted to joining player
    assert mock_emit.call_count == 2  # room_joined + player_joined broadcast

    # First call: room_joined to joining player
    call_args = mock_emit.call_args_list[0]
    assert call_args[0][0] == "room_joined"
    room_state = call_args[0][1]
    assert room_state["room_code"] == room.room_code
    assert len(room_state["players"]) == 2

    # Second call: player_joined broadcast
    call_args = mock_emit.call_args_list[1]
    assert call_args[0][0] == "player_joined"
    assert "player_id" in call_args[0][1]
    assert "name" in call_args[0][1]
    assert call_args[0][1]["name"] == "Bob"

    # Verify socket entered room
    mock_enter_room.assert_called_once()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_join_room_event_room_full_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test join_room event when room is at capacity with real Redis."""
    from sdd_process_example import socket_manager

    # Create room and fill to capacity (8 players)
    room = integration_room_manager.create_room("Player1")
    for i in range(2, 9):
        integration_room_manager.join_room(room.room_code, f"Player{i}")

    mock_sid = "test-session-id"
    mock_emit = AsyncMock()

    with patch.object(socket_manager, "sio") as mock_sio:
        mock_sio.emit = mock_emit

        # Try to join full room
        await socket_manager.join_room(
            mock_sid,
            {"room_code": room.room_code, "player_name": "Player9"},
        )

    # Verify error emitted
    mock_emit.assert_called_once()
    call_args = mock_emit.call_args[0]
    assert call_args[0] == "error"
    error_msg = call_args[1]["message"].lower()
    assert "full" in error_msg or "capacity" in error_msg
