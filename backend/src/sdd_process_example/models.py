"""Pydantic models for WebSocket events."""

from datetime import datetime
from typing import Literal

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


class DiceResult(BaseModel):
    """Represents a single dice roll result."""

    roll_id: str
    player_id: str
    player_name: str
    formula: str
    individual_results: list[int]
    modifier: int
    total: int
    timestamp: datetime
    dc_pass: bool | None = None


class RollRequest(BaseModel):
    """Request to roll dice."""

    formula: str
    advantage: Literal["none", "advantage", "disadvantage"] = "none"


class RollResponse(BaseModel):
    """Response containing roll result."""

    roll: DiceResult
