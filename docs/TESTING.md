# Testing Strategy: Unit Tests vs Integration Tests

## Overview

The backend tests have been organized into two categories:
- **Unit Tests**: Use mocked Redis connections, run in CI/CD
- **Integration Tests**: Use real Redis connections, run manually

## Running Tests

### Unit Tests (Default)
Unit tests run without requiring external services:

```bash
# Using nox (recommended)
uv run nox -s test

# Or directly with pytest
uv run pytest backend/tests/ -v -m "not integration"
```

### Integration Tests
Integration tests require Redis to be running on `localhost:6379`:

```bash
# Start Redis (using Docker)
docker run -d -p 6379:6379 redis:latest

# Run integration tests
uv run nox -s integration

# Or directly with pytest
uv run pytest backend/tests/ -v -m "integration"
```

## Test Organization

### Shared Fixtures (`backend/tests/conftest.py`)

The conftest.py file provides shared fixtures for all tests:

- **`mock_redis`**: Mocked Redis client for unit tests
- **`room_manager`**: RoomManager instance with mocked Redis
- **`redis_client`**: Real Redis client for integration tests only
- **`integration_room_manager`**: RoomManager with real Redis

### Unit Test Files

These files use mocked Redis and test business logic in isolation:

- `test_room_manager.py` - RoomManager service tests
- `test_join_room.py` - Join room functionality tests
- `test_join_room_event.py` - Socket.IO join_room event tests
- `test_room_query.py` - Room query methods tests
- `test_create_room_event.py` - Socket.IO create_room event tests
- `test_room_code_generator.py` - Room code generation tests

### Integration Test Files

These files test actual Redis interactions and are marked with `@pytest.mark.integration`:

- `test_join_room_integration.py` - Join room with real Redis
- `test_join_room_event_integration.py` - Socket.IO events with real Redis
- `test_room_query_integration.py` - Room queries with real Redis

## CI/CD Configuration

The GitHub Actions workflow runs only unit tests (excluding integration tests) to avoid requiring external services:

```yaml
# In .github/workflows/test.yml
- name: Run unit tests
  run: uv run nox -s test
```

## Pytest Markers

Integration tests are marked using pytest markers defined in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
markers = [
    "integration: marks tests as integration tests (requires external services like Redis)",
]
```

## Benefits of This Approach

1. **Fast CI/CD**: Unit tests run quickly without external dependencies
2. **Reliable**: Mocked tests are deterministic and don't fail due to network issues
3. **Comprehensive**: Integration tests verify actual Redis behavior when needed
4. **Developer-Friendly**: Developers can run unit tests without setting up Redis
5. **Flexible**: Integration tests can be run on-demand to verify Redis interactions

## Writing New Tests

### For Unit Tests
```python
def test_my_feature(room_manager: RoomManager, mock_redis: MagicMock) -> None:
    """Test feature with mocked Redis."""
    # Setup mock behavior
    mock_redis.exists.return_value = True
    
    # Test your feature
    result = room_manager.some_method()
    
    # Assert expectations
    assert result is not None
    mock_redis.hset.assert_called_once()
```

### For Integration Tests
```python
@pytest.mark.integration
def test_my_feature_integration(integration_room_manager: RoomManager) -> None:
    """Test feature with real Redis."""
    # Create test data
    room = integration_room_manager.create_room("TestUser")
    
    # Test your feature
    result = integration_room_manager.some_method(room.room_code)
    
    # Assert expectations
    assert result is not None
```

## Migration Notes

Previously, some tests used real Redis connections unconditionally:
- `test_join_room.py`
- `test_join_room_event.py`
- `test_room_query.py`

These have been converted to use mocked Redis for unit testing, with parallel integration test files created to preserve the original Redis interaction tests.
