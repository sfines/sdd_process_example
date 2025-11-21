"""Tests for Socket.IO join_room event handler."""

import pytest
from unittest.mock import AsyncMock, patch
from redis import Redis

from sdd_process_example.services.room_manager import RoomManager


@pytest.fixture
def redis_client() -> Redis:  # type: ignore
    """Create Redis client for testing."""
    client = Redis(host="localhost", port=6379, db=0, decode_responses=True)
    # Clean up test keys
    for key in client.scan_iter("room:TEST-*"):
        client.delete(key)
    yield client
    # Clean up after test
    for key in client.scan_iter("room:TEST-*"):
        client.delete(key)


@pytest.fixture
def room_manager(redis_client: Redis) -> RoomManager:  # type: ignore
    """Create RoomManager instance for testing."""
    return RoomManager(redis_client)


@pytest.mark.asyncio
async def test_join_room_event_success(room_manager: RoomManager) -> None:
    """Test successful join_room event handling."""
    # Import the socket manager
    from sdd_process_example import socket_manager
    
    # Create a room first
    room = room_manager.create_room("Alice")
    
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
    assert "player" in call_args[0][1]
    
    # Verify socket entered room
    mock_enter_room.assert_called_once()


@pytest.mark.asyncio
async def test_join_room_event_room_not_found() -> None:
    """Test join_room event with non-existent room."""
    from sdd_process_example import socket_manager
    
    mock_sid = "test-session-id"
    mock_emit = AsyncMock()
    
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
async def test_join_room_event_room_full(room_manager: RoomManager) -> None:
    """Test join_room event when room is at capacity."""
    from sdd_process_example import socket_manager
    
    # Create room and fill to capacity (8 players)
    room = room_manager.create_room("Player1")
    for i in range(2, 9):
        room_manager.join_room(room.room_code, f"Player{i}")
    
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
