"""Pydantic models for WebSocket events."""

from pydantic import BaseModel, Field


class HelloMessage(BaseModel):
    """Message from client on hello_message event."""

    message: str


class WorldMessage(BaseModel):
    """Message to client on world_message event."""

    message: str


class Player(BaseModel):
    """Represents a player in a room."""

    player_id: str
    name: str
    connected: bool = True


class RoomState(BaseModel):
    """Represents the complete state of a game room."""

    room_code: str
    mode: str = "Open"
    created_at: str
    creator_player_id: str
    players: list[Player] = Field(default_factory=list)
    roll_history: list[dict] = Field(default_factory=list)  # type: ignore[type-arg]
