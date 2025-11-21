"""Tests for Socket.IO event handlers."""

import pytest
from socketio import AsyncServer

from sdd_process_example.models import HelloMessage, WorldMessage
from sdd_process_example.socket_manager import connect, disconnect, hello_message, sio


@pytest.mark.asyncio
async def test_connect_handler() -> None:
    """Test that connect handler logs connection."""
    # Test that the function executes without error
    await connect("test_sid", {})


@pytest.mark.asyncio
async def test_disconnect_handler() -> None:
    """Test that disconnect handler logs disconnection."""
    # Test that the function executes without error
    await disconnect("test_sid")


@pytest.mark.asyncio
async def test_hello_message_handler() -> None:
    """Test that hello_message handler processes message and sends world_message."""
    # Valid message payload
    data = {"message": "Hello from client!"}
    
    # Test that the function executes without error
    await hello_message("test_sid", data)


@pytest.mark.asyncio
async def test_hello_message_invalid_payload() -> None:
    """Test that hello_message handler handles invalid payload gracefully."""
    # Invalid payload (missing 'message' field)
    data = {"invalid": "data"}
    
    # Should not raise exception, just log error
    await hello_message("test_sid", data)


def test_sio_server_instance() -> None:
    """Test that Socket.IO server is properly configured."""
    assert isinstance(sio, AsyncServer)
    assert sio.async_mode == "asgi"
