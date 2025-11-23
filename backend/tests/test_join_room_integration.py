"""Integration tests for join_room functionality in RoomManager.

These tests require a running Redis instance and are marked with @pytest.mark.integration.
They test the actual Redis interactions rather than mocking them.

To run these tests:
    uv run nox -s integration

Note: These tests are not run in CI/CD pipelines.
"""

import pytest

from sdd_process_example.services.room_manager import (
    RoomCapacityExceededError,
    RoomManager,
    RoomNotFoundError,
)


@pytest.mark.integration
def test_join_room_adds_player_to_existing_room_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test that join_room() adds player to existing room with real Redis."""
    # Create a room
    room = integration_room_manager.create_room("Alice")

    # Join the room
    updated_room = integration_room_manager.join_room(room.room_code, "Bob")

    # Verify Bob was added
    assert len(updated_room.players) == 2
    assert updated_room.players[0].name == "Alice"
    assert updated_room.players[1].name == "Bob"
    assert updated_room.players[1].connected is True


@pytest.mark.integration
def test_join_room_raises_error_for_nonexistent_room_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test that join_room() raises RoomNotFoundError for non-existent room with real Redis."""
    # Try to join non-existent room
    with pytest.raises(RoomNotFoundError, match="Room .* not found"):
        integration_room_manager.join_room("NONEXISTENT-9999", "Charlie")


@pytest.mark.integration
def test_join_room_raises_error_when_room_at_capacity_integration(
    integration_room_manager: RoomManager,
) -> None:
    """Test that join_room() raises RoomCapacityExceededError when room full with real Redis."""
    # Create a room
    room = integration_room_manager.create_room("Player1")

    # Add 7 more players (total 8 - at capacity)
    for i in range(2, 9):
        room = integration_room_manager.join_room(room.room_code, f"Player{i}")

    # Verify we have 8 players
    assert len(room.players) == 8

    # Try to add 9th player
    with pytest.raises(
        RoomCapacityExceededError, match="Room .* is at full capacity"
    ):
        integration_room_manager.join_room(room.room_code, "Player9")


@pytest.mark.integration
def test_join_room_refreshes_ttl_integration(
    integration_room_manager: RoomManager, redis_client: "Redis"  # type: ignore[type-arg, name-defined]
) -> None:
    """Test that join_room() refreshes room TTL with real Redis."""
    # Create a room
    room = integration_room_manager.create_room("Alice")
    redis_key = f"room:{room.room_code}"

    # Get initial TTL
    initial_ttl = int(redis_client.ttl(redis_key))  # type: ignore[arg-type]

    # Join room
    integration_room_manager.join_room(room.room_code, "Bob")

    # Get TTL after join
    ttl_after_join = int(redis_client.ttl(redis_key))  # type: ignore[arg-type]

    # Verify TTL was refreshed (should be close to 18000)
    assert ttl_after_join >= initial_ttl
    assert ttl_after_join >= 17900  # Allow small time difference
