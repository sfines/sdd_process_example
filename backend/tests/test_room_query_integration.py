"""Integration tests for room query methods in RoomManager.

These tests require a running Redis instance and are marked with
@pytest.mark.integration. They test the actual Redis interactions
rather than mocking them.

To run these tests:
    uv run nox -s integration

Note: These tests are not run in CI/CD pipelines.
"""

import pytest

from sdd_process_example.services.room_manager import RoomManager


@pytest.mark.integration
def test_get_room_returns_existing_room_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test that get_room() returns room state for existing room with real Redis."""
    # Create a room
    room = integration_room_manager.create_room("Alice")

    # Query the room
    retrieved_room = integration_room_manager.get_room(room.room_code)

    # Verify room was retrieved
    assert retrieved_room is not None
    assert retrieved_room.room_code == room.room_code
    assert retrieved_room.creator_player_id == room.creator_player_id
    assert len(retrieved_room.players) == 1
    assert retrieved_room.players[0].name == "Alice"


@pytest.mark.integration
def test_get_room_returns_none_for_nonexistent_room_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test that get_room() returns None for non-existent room with real Redis."""
    # Query non-existent room
    retrieved_room = integration_room_manager.get_room("NONEXISTENT-9999")

    # Verify None returned
    assert retrieved_room is None


@pytest.mark.integration
def test_room_exists_returns_true_for_existing_room_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test that room_exists() returns True for existing room with real Redis."""
    # Create a room
    room = integration_room_manager.create_room("Bob")

    # Check if room exists
    exists = integration_room_manager.room_exists(room.room_code)

    # Verify room exists
    assert exists is True


@pytest.mark.integration
def test_room_exists_returns_false_for_nonexistent_room_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test that room_exists() returns False for non-existent room with real Redis."""
    # Check if non-existent room exists
    exists = integration_room_manager.room_exists("NONEXISTENT-8888")

    # Verify room does not exist
    assert exists is False


@pytest.mark.integration
def test_get_room_capacity_returns_current_and_max_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test get_room_capacity() returns player count and max capacity.

    Tests with real Redis.
    """
    # Create a room
    room = integration_room_manager.create_room("Charlie")

    # Get capacity
    current, max_capacity = integration_room_manager.get_room_capacity(room.room_code)

    # Verify capacity
    assert current == 1  # One player (creator)
    assert max_capacity == 8  # Max capacity from spec


@pytest.mark.integration
def test_get_room_capacity_for_nonexistent_room_raises_error_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test get_room_capacity() raises error for non-existent room.

    Tests with real Redis.
    """
    # Try to get capacity for non-existent room
    with pytest.raises(ValueError, match="Room .* not found"):
        integration_room_manager.get_room_capacity("NONEXISTENT-7777")
