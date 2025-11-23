"""Shared pytest fixtures for backend tests."""

from typing import Any
from unittest.mock import MagicMock

import pytest
from redis import Redis

from sdd_process_example.services.room_manager import RoomManager


@pytest.fixture
def mock_redis() -> MagicMock:
    """Create a mock Redis client for unit tests.
    
    This fixture provides a mocked Redis client that can be used
    in unit tests without requiring an actual Redis connection.
    
    Returns:
        MagicMock: A mock Redis client
    """
    return MagicMock()


@pytest.fixture
def room_manager(mock_redis: MagicMock) -> RoomManager:
    """Create a RoomManager instance with mocked Redis.
    
    Args:
        mock_redis: Mock Redis client fixture
        
    Returns:
        RoomManager: Instance configured with mock Redis
    """
    return RoomManager(mock_redis)


# Integration test fixtures (only used when running integration tests)
@pytest.fixture
def redis_client() -> Redis:  # type: ignore[type-arg]
    """Create a real Redis client for integration tests.
    
    This fixture is only used by integration tests and requires
    a running Redis instance on localhost:6379.
    
    Yields:
        Redis: Real Redis client instance
    """
    client = Redis(host="localhost", port=6379, db=0, decode_responses=True)
    # Clean up test keys before each test
    for key in client.scan_iter("room:TEST-*"):
        client.delete(key)
    yield client
    # Clean up after test
    for key in client.scan_iter("room:TEST-*"):
        client.delete(key)


@pytest.fixture
def integration_room_manager(redis_client: Redis) -> RoomManager:  # type: ignore[type-arg]
    """Create a RoomManager instance with real Redis for integration tests.
    
    Args:
        redis_client: Real Redis client fixture
        
    Returns:
        RoomManager: Instance configured with real Redis
    """
    return RoomManager(redis_client)
