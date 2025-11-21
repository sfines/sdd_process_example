"""Tests for Pydantic models."""

import pytest
from pydantic import ValidationError

from sdd_process_example.models import HelloMessage, WorldMessage


def test_hello_message_valid() -> None:
    """Test HelloMessage with valid data."""
    msg = HelloMessage(message="Hello from client!")
    assert msg.message == "Hello from client!"


def test_hello_message_invalid() -> None:
    """Test HelloMessage with invalid data."""
    with pytest.raises(ValidationError):
        HelloMessage()  # type: ignore[call-arg]


def test_world_message_valid() -> None:
    """Test WorldMessage with valid data."""
    msg = WorldMessage(message="World from server!")
    assert msg.message == "World from server!"


def test_world_message_invalid() -> None:
    """Test WorldMessage with invalid data."""
    with pytest.raises(ValidationError):
        WorldMessage()  # type: ignore[call-arg]
