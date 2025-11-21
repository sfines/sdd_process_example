"""Pydantic models for WebSocket events."""

from pydantic import BaseModel


class HelloMessage(BaseModel):
    """Message from client on hello_message event."""

    message: str


class WorldMessage(BaseModel):
    """Message to client on world_message event."""

    message: str
