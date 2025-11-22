"""Integration tests for roll_dice Socket.io event handler - TDD approach."""

from unittest.mock import AsyncMock

import pytest
from redis import Redis

from sdd_process_example.services.room_manager import RoomManager
from sdd_process_example.socket_manager import roll_dice, sio


@pytest.fixture
def mock_redis() -> Redis:  # type: ignore[type-arg]
    """Provide a mock Redis client for testing."""
    from fakeredis import FakeStrictRedis

    return FakeStrictRedis(decode_responses=True)  # type: ignore[return-value]


@pytest.fixture
def room_manager(mock_redis: Redis) -> RoomManager:  # type: ignore[type-arg]
    """Provide a RoomManager with fake Redis."""
    return RoomManager(mock_redis)  # type: ignore[arg-type]


@pytest.mark.asyncio
async def test_roll_dice_event_handler_registered() -> None:
    """Test that roll_dice event handler is registered with Socket.io."""
    assert "roll_dice" in sio.handlers["/"]


@pytest.mark.asyncio
async def test_roll_dice_emits_error_when_formula_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Test that roll_dice emits error when formula is missing."""
    # Mock sio.emit to capture calls
    emit_mock = AsyncMock()
    monkeypatch.setattr(sio, "emit", emit_mock)

    # Call handler with missing formula
    await roll_dice("test_sid", {})

    # Verify error was emitted
    emit_mock.assert_called_once()
    call_args = emit_mock.call_args
    assert call_args[0][0] == "error"
    assert "formula is required" in call_args[0][1]["message"]


@pytest.mark.asyncio
async def test_roll_dice_emits_error_when_player_name_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Test that roll_dice emits error when player_name is missing."""
    emit_mock = AsyncMock()
    monkeypatch.setattr(sio, "emit", emit_mock)

    # Call handler with formula but no player_name
    await roll_dice("test_sid", {"formula": "1d20"})

    # Verify error was emitted
    emit_mock.assert_called_once()
    call_args = emit_mock.call_args
    assert call_args[0][0] == "error"
    assert "player_name is required" in call_args[0][1]["message"]


@pytest.mark.asyncio
async def test_roll_dice_emits_error_when_room_code_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Test that roll_dice emits error when room_code is missing."""
    emit_mock = AsyncMock()
    monkeypatch.setattr(sio, "emit", emit_mock)

    # Call handler with formula and player_name but no room_code
    await roll_dice("test_sid", {"formula": "1d20", "player_name": "TestPlayer"})

    # Verify error was emitted
    emit_mock.assert_called_once()
    call_args = emit_mock.call_args
    assert call_args[0][0] == "error"
    assert "room_code is required" in call_args[0][1]["message"]


@pytest.mark.asyncio
async def test_roll_dice_generates_result_and_broadcasts(
    monkeypatch: pytest.MonkeyPatch,
    mock_redis: Redis,  # type: ignore[type-arg]
    room_manager: RoomManager,
) -> None:
    """Test that roll_dice generates result and broadcasts to room."""
    # Setup: Create a room with a player
    room = room_manager.create_room("TestPlayer")
    room_code = room.room_code

    # Mock get_redis_client to return our fake Redis
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
            "player_name": "TestPlayer",
            "room_code": room_code,
        },
    )

    # Verify roll_result was broadcast
    emit_mock.assert_called_once()
    call_args = emit_mock.call_args
    assert call_args[0][0] == "roll_result"

    # Verify roll data structure
    roll_data = call_args[0][1]
    assert "roll_id" in roll_data
    assert roll_data["player_name"] == "TestPlayer"
    assert roll_data["formula"] == "1d20+5"
    assert "individual_results" in roll_data
    assert len(roll_data["individual_results"]) == 1
    assert 1 <= roll_data["individual_results"][0] <= 20
    assert roll_data["modifier"] == 5
    assert "total" in roll_data
    assert "timestamp" in roll_data

    # Verify broadcast to room
    assert call_args[1]["room"] == room_code
