"""Tests for health endpoint."""

from fastapi.testclient import TestClient

from sdd_process_example.main import app

client = TestClient(app)


def test_health_endpoint() -> None:
    """Test that health endpoint returns 200."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_root_path() -> None:
    """Test that root path is accessible."""
    response = client.get("/")
    assert response.status_code == 404
