# ADR-002: WebSocket Architecture Pattern

**Status:** Approved
**Date:** 2025-11-15
**Decision Maker:** Steve

## Context

Real-time multiplayer requires bidirectional communication. Need to choose between Socket.io (higher-level), raw WebSockets (lower-level), or HTTP long-polling (fallback).

## Decision

Use Socket.io with native room concept for all real-time features.

## Implementation

- **Backend:** `python-socketio` with FastAPI integration
- **Frontend:** `socket.io-client` with automatic reconnection
- **Pattern:** Socket.io Rooms for natural room-based broadcasting

## Why Socket.io Over Raw WebSockets

1. Built-in room/namespace concept (perfect for game rooms)
2. Automatic reconnection with exponential backoff
3. Fallback to long-polling if WebSocket fails
4. Binary data support (not needed now, but future-proof)
5. Broad browser compatibility (iOS Safari tested)

## Event Architecture

```typescript
// Client → Server Events
create_room,
  join_room,
  roll_dice,
  reveal_roll,
  set_dc,
  promote_to_dm,
  kick_player,
  disconnect;

// Server → Client Events
room_created,
  player_joined,
  player_left,
  roll_result,
  roll_revealed,
  dc_updated,
  room_mode_changed,
  room_expiring,
  room_closed,
  player_kicked,
  error;
```

## Consequences

- **Positive:** Proven pattern, handles edge cases (reconnection, fallback)
- **Negative:** Adds dependency (python-socketio + socket.io-client)
- **Positive:** Reduces custom code for connection management
- **Positive:** Native room concept simplifies multiplayer logic
