"""Integration tests for roll_dice Socket.io event handler - TDD approach."""

import pytest

from sdd_process_example.socket_manager import sio


@pytest.mark.asyncio
async def test_roll_dice_event_handler_registered() -> None:
    """Test that roll_dice event handler is registered with Socket.io."""
    # This will fail until we add the @sio.event decorator to roll_dice handler
    assert "roll_dice" in sio.handlers["/"]
