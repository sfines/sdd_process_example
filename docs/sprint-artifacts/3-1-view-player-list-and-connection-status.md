# Story 3.1: View Player List and Connection Status

Status: ready-for-dev

---

## Story

As a **User**,
I want to **see a list of all players currently in the room and their connection status**,
so that **I know who is present and active**.

---

## Acceptance Criteria

1. ✅ Player list visible in Room View showing all players with names
2. ✅ Each player has connection status badge (🟢 connected, 🔴 disconnected)
3. ✅ Current user highlighted in player list (e.g., "You" label)
4. ✅ When player disconnects from WebSocket, status changes to "disconnected" within 2 seconds
5. ✅ When disconnected player reconnects, status changes back to "connected" within 2 seconds
6. ✅ Player leaves room → removed from list (player_left event)
7. ✅ New player joins room → added to list with "connected" status
8. ✅ Player list updates in real-time for all room members
9. ✅ Ping/pong heartbeat detects disconnections faster than default (every 30 seconds)
10. ✅ E2E test validates connection status changes with 2 concurrent browsers

---

## Tasks / Subtasks

### Task 1: Backend Player Connection Tracking

- [ ] Update `backend/app/services/room_manager.py` (from Story 2.2)
  - [ ] Update `Player` model fields:
    - [ ] `connected: bool` (default True on join)
    - [ ] `connected_at: datetime`
    - [ ] `last_activity: datetime` (timestamp of last action)
  - [ ] Method: `update_player_status(room_code: str, player_id: str, connected: bool) -> None`
    - [ ] Query room hash from Redis
    - [ ] Find player in players array
    - [ ] Update connected field
    - [ ] Update last_activity timestamp
    - [ ] Serialize and save to Redis
    - [ ] Refresh TTL
  - [ ] Method: `get_disconnected_players(room_code: str) -> List[Player]`
    - [ ] Return all players with connected=False
  - [ ] Commit: "feat(backend): Add connection status tracking to Player model"

### Task 2: Backend Heartbeat/Ping-Pong Mechanism

- [ ] Update `backend/app/event_handlers.py` (from Story 2.3)
  - [ ] Add `@sio.event` handler for `ping` event
    - [ ] Receive: ping from client (with optional player_id)
    - [ ] Update player's last_activity timestamp
    - [ ] Emit `pong` event back to client
  - [ ] Add background task (async) to detect stale connections
    - [ ] Every 30 seconds: check all rooms
    - [ ] For each player: if last_activity > 90 seconds ago, mark as disconnected
    - [ ] Broadcast `player_disconnected` event to room
  - [ ] On `disconnect` event (WebSocket disconnect):
    - [ ] Immediately mark player as disconnected
    - [ ] Broadcast `player_disconnected` event
    - [ ] Do NOT remove player from room (allow reconnection)
  - [ ] On reconnect (same player_id joins again):
    - [ ] Mark player as connected
    - [ ] Broadcast `player_reconnected` event
  - [ ] Commit: "feat(backend): Add ping/pong heartbeat for connection detection"

### Task 3: Frontend Ping Client

- [ ] Create `frontend/src/hooks/usePing.ts` (or add to useSocket.ts)
  - [ ] Function: `startPinging(interval: number = 30000)`
    - [ ] Set up interval (default 30 seconds)
    - [ ] Every interval: emit `ping` event via Socket.io
  - [ ] Listen for `pong` event response
    - [ ] Log successful pong (debug)
  - [ ] On disconnect: clear interval
  - [ ] On reconnect: restart interval
  - [ ] Test: Mock Socket.io, verify ping emitted regularly
  - [ ] Commit: "feat(frontend): Add ping heartbeat client"

### Task 4: Frontend Player List Component Enhancement

- [ ] Update `frontend/src/components/PlayerList.tsx` (from Story 2.2)
  - [ ] Props: `players: Player[]`, `currentPlayerId: string`
  - [ ] For each player, display:
    - [ ] Connection status badge:
      - [ ] 🟢 (green) if connected=true
      - [ ] 🔴 (red) if connected=false
    - [ ] Player name
    - [ ] "You" label if current player
    - [ ] Join timestamp (relative, e.g., "5m ago")
  - [ ] Styling:
    - [ ] Current player highlighted (bold or background color)
    - [ ] Disconnected players grayed out
    - [ ] Status badge prominent and clear
  - [ ] Update on events:
    - [ ] `player_joined` → add to list
    - [ ] `player_left` → remove from list
    - [ ] `player_disconnected` → update status to disconnected
    - [ ] `player_reconnected` → update status to connected
  - [ ] Test: Component renders with correct statuses
  - [ ] Commit: "feat(frontend): Enhance PlayerList with connection status badges"

### Task 5: Frontend Socket.io Handlers - Connection Events

- [ ] Update `frontend/src/hooks/useSocket.ts` (from Story 2.5)
  - [ ] Listen for `player_disconnected` event
    - [ ] Receive: `{ player_id, player_name }`
    - [ ] Update Zustand store: set player.connected = false
    - [ ] Trigger re-render of PlayerList
  - [ ] Listen for `player_reconnected` event
    - [ ] Receive: `{ player_id, player_name }`
    - [ ] Update Zustand store: set player.connected = true
    - [ ] Trigger re-render of PlayerList
  - [ ] Listen for `player_left` event (from Story 2.2, may need update)
    - [ ] Receive: `{ player_id, player_name }`
    - [ ] Remove player from Zustand store players array
  - [ ] Test: Mock Socket.io events, verify store updates
  - [ ] Commit: "feat(frontend): Add connection event handlers"

### Task 6: Frontend Store Enhancement

- [ ] Update `frontend/src/store/socketStore.ts` (from Story 2.5)
  - [ ] Ensure Player model includes:
    - [ ] `connected: boolean`
    - [ ] `connectedAt: datetime` (ISO string)
  - [ ] Add actions:
    - [ ] `updatePlayerStatus(playerId: string, connected: boolean)`
    - [ ] `removePlayer(playerId: string)`
  - [ ] Commit: "feat(frontend): Add player status actions to store"

### Task 7: Frontend Room View Integration

- [ ] Update `frontend/src/pages/RoomView.tsx` (from Story 2.5)
  - [ ] Pass `currentPlayerId` to PlayerList:
    - [ ] Get from Zustand store (set on room join in Story 2.2)
  - [ ] Start pinging on mount:
    - [ ] Call `usePing().startPinging()`
  - [ ] Stop pinging on unmount:
    - [ ] Clear interval
  - [ ] Test: Integration works
  - [ ] Commit: "feat(frontend): Integrate ping and PlayerList in Room View"

### Task 8: Backend Pydantic Models - Connection Status

- [ ] Update `backend/app/models.py` (from Story 2.5)
  - [ ] Update `Player` model:
    ```python
    class Player(BaseModel):
        player_id: str  # UUID
        name: str
        joined_at: datetime
        connected: bool = True
        last_activity: datetime
    ```
  - [ ] Add event models:

    ```python
    class PlayerDisconnectedEvent(BaseModel):
        player_id: str
        player_name: str
        timestamp: datetime

    class PlayerReconnectedEvent(BaseModel):
        player_id: str
        player_name: str
        timestamp: datetime

    class PlayerLeftEvent(BaseModel):
        player_id: str
        player_name: str
        timestamp: datetime
    ```

  - [ ] Commit: "feat(backend): Add connection event models"

### Task 9: Integration Test - Connection Detection

- [ ] Create `backend/tests/test_connection_tracking.py`
  - [ ] Test: `test_player_marked_disconnected_on_websocket_disconnect()`
    - [ ] Player joins room, then WebSocket disconnects
    - [ ] Query room from Redis
    - [ ] Verify player.connected = False
  - [ ] Test: `test_player_marked_connected_on_reconnect()`
    - [ ] Player disconnects, then reconnects with same player_id
    - [ ] Query room from Redis
    - [ ] Verify player.connected = True
  - [ ] Test: `test_stale_connection_detected_by_heartbeat()`
    - [ ] Player joins, updates last_activity to 100 seconds ago
    - [ ] Run heartbeat check (simulated)
    - [ ] Verify player marked as disconnected
  - [ ] Test: `test_player_removed_on_player_left_event()`
    - [ ] Player joins, then explicitly leaves room
    - [ ] Query room from Redis
    - [ ] Verify player removed from players array (not just disconnected)
  - [ ] Run: `pytest backend/tests/test_connection_tracking.py`
  - [ ] All tests pass
  - [ ] Commit: "test(backend): Add connection tracking integration tests"

### Task 10: Integration Test - Broadcasting

- [ ] Add to `backend/tests/test_roll_mechanics.py`
  - [ ] Test: `test_player_disconnected_event_broadcast()`
    - [ ] Mock 2 players in a room
    - [ ] Simulate disconnect for player 1
    - [ ] Verify `player_disconnected` event sent to player 2
    - [ ] Verify event includes player_id and name
  - [ ] Test: `test_player_reconnected_event_broadcast()`
    - [ ] Player 1 disconnects, then reconnects
    - [ ] Verify `player_reconnected` event sent to all
  - [ ] Commit: "test(backend): Add connection event broadcast tests"

### Task 11: E2E Test - Connection Status Changes

- [ ] Create `frontend/e2e/player-list-connection.spec.ts`
  - [ ] Test setup: 2 browsers (A and B) in same room
  - [ ] Test: `test_initial_player_list_shows_all_connected()`
    1. Browser A: Create room
    2. Browser B: Join room
    3. Browser A: Verify PlayerList shows Browser B with 🟢 connected
    4. Browser B: Verify PlayerList shows Browser A with 🟢 connected
    5. Both see themselves marked "You"
  - [ ] Test: `test_disconnected_player_status_changes()`
    1. Both browsers connected to room
    2. Browser A: Simulates disconnect (close Socket connection or DevTools)
    3. Browser B: Within 2 seconds, verify Browser A's status changed to 🔴 disconnected
    4. Verify name is grayed out
  - [ ] Test: `test_reconnected_player_status_changes()`
    1. Browser A: Was disconnected
    2. Browser A: Reconnects with same player_id
    3. Browser B: Within 2 seconds, verify Browser A's status back to 🟢 connected
    4. Verify name is back to normal color
  - [ ] Test: `test_player_left_removed_from_list()`
    1. Both browsers in room
    2. Browser A: Closes room / leaves room explicitly
    3. Browser B: Player A removed from list (not just disconnected)
  - [ ] Command: `npx playwright test player-list-connection.spec.ts`
  - [ ] All tests pass
  - [ ] Commit: "test(e2e): Add Playwright test for player list and connection status"

### Task 12: Manual Testing & Documentation

- [ ] Manual test procedure:
  - [ ] Run `docker-compose up`
  - [ ] Browser A: Create room
  - [ ] Browser B: Join room
  - [ ] Browser A & B: Verify both in PlayerList with 🟢 status
  - [ ] Browser A: Verify Browser B shown (not "You")
  - [ ] Browser B: Verify Browser A shown (not "You")
  - [ ] Browser A: Unplug network / kill WebSocket connection
    - [ ] Wait 2-3 seconds
    - [ ] Browser B: Verify Browser A's status changed to 🔴 disconnected
    - [ ] Browser B: Verify Browser A's name grayed out
  - [ ] Browser A: Restore network / reconnect
    - [ ] Wait 2-3 seconds
    - [ ] Browser B: Verify Browser A's status back to 🟢 connected
    - [ ] Browser B: Verify Browser A's name back to normal
  - [ ] Browser A: Explicitly leave room (button or close browser tab)
    - [ ] Browser B: Verify Browser A removed from list
  - [ ] Check backend logs: `[HEARTBEAT]` entries showing ping/pong
  - [ ] Check Socket.io events: player_disconnected, player_reconnected
- [ ] Update README.md
  - [ ] Add section: "Player List and Connection Status"
  - [ ] Explain status badges: 🟢 connected, 🔴 disconnected
  - [ ] Explain "You" label for current player
  - [ ] Mention heartbeat mechanism (30-second pings)
  - [ ] Note: Disconnected players can reconnect; room isn't closed
- [ ] Commit: "docs: Add player list and connection status documentation"

---

## Dev Notes

### Architecture Context

This story adds **real-time connection monitoring** without changing core architecture.

- **ADR-002 (Socket.io):** Extends with ping/pong and new broadcast events
- **ADR-003 (Redis):** Player model extended with connection fields
- **ADR-006 (Zustand):** Store extended with connection status actions
- **ADR-007 (Tailwind):** PlayerList component styling (badges, colors)

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Detailed-Design]

### Learnings from Story 2.2

**From Story 2.2 (Status: ready-for-dev)**

- **Player Model:** Already has player_id and name; extend with connected status
- **PlayerList Component:** Already created in 2.2; enhance with status badges
- **Socket.io Events:** player_joined/player_left established; add connection events
- **Zustand Store:** Players array working; add status update actions

**Key Reuse Points:**

- Extend Player model (add connected, last_activity fields)
- Enhance PlayerList component (add badges, highlighting)
- Add connection event listeners to useSocket hook
- Extend room_manager with status update methods
- Add heartbeat mechanism (ping/pong)

[Source: docs/sprint-artifacts/2-2-join-an-existing-room.md#Dev-Notes]

### Project Structure

Expected file additions/modifications:

```
backend/
├── app/
│   ├── services/
│   │   └── room_manager.py (updated: add status tracking methods)
│   ├── event_handlers.py (updated: add ping/pong, disconnected/reconnected handlers)
│   ├── models.py (updated: enhance Player model, add event models)
│   ├── tasks.py or similar (NEW: background heartbeat task)
│   └── ...
├── tests/
│   ├── test_connection_tracking.py (NEW)
│   ├── test_roll_mechanics.py (updated: add broadcast tests)
│   └── ...
└── ...

frontend/
├── src/
│   ├── components/
│   │   └── PlayerList.tsx (updated: add status badges, remove on left)
│   ├── pages/
│   │   └── RoomView.tsx (updated: start pinging on mount)
│   ├── hooks/
│   │   ├── useSocket.ts (updated: add connection event handlers)
│   │   └── usePing.ts (NEW: ping interval management)
│   ├── store/
│   │   └── socketStore.ts (updated: add status update actions)
│   └── ...
├── e2e/
│   ├── player-list-connection.spec.ts (NEW)
│   └── ...
└── ...
```

### Testing Strategy

**Unit Tests:**

- Backend: Player status update methods work correctly
- Frontend: PlayerList renders status badges
- Frontend: Ping hook starts/stops interval correctly

**Integration Tests:**

- Backend + Redis: Status persists across updates
- Backend + Socket.io: Connection events broadcast correctly
- Heartbeat detection: Stale connections flagged

**E2E Tests (Playwright):**

- Initial player list shows all connected
- Disconnect: Status changes within 2 seconds
- Reconnect: Status changes back within 2 seconds
- Leave room: Player removed from list

**Manual Testing:**

- Simulate network disconnect/reconnect
- Verify status badges update
- Verify player removed on explicit leave

### Key Dependencies

| Package          | Version | Purpose                   |
| ---------------- | ------- | ------------------------- |
| asyncio          | builtin | Background heartbeat task |
| Socket.io events | 4.6+    | ping/pong mechanism       |

### Constraints & Patterns

- **Heartbeat interval:** 30 seconds (configurable)
- **Stale timeout:** 90 seconds (player marked disconnected if no pong)
- **Detection delay:** Within 2 seconds for status changes
- **Disconnected state:** Player remains in room (allows reconnection)
- **Explicit leave:** Player removed from room immediately

---

## References

- **Tech Spec:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- **Story 2.2:** [Source: docs/sprint-artifacts/2-2-join-an-existing-room.md]
- **Architecture:** [Source: docs/architecture.md]

---

## Dev Agent Record

### Context Reference

- [Story Context XML](./3-1-view-player-list-and-connection-status.context.xml) - Generated 2025-11-27

### Agent Model Used

Claude 3 (Latest)

### Completion Notes List

_To be filled by dev agent upon completion_

- Heartbeat mechanism proven reliable for connection detection
- Status badges clear and non-intrusive in UI
- E2E tests validate disconnect/reconnect scenarios
- Integration with existing PlayerList smooth

### Debug Log References

_To be filled by dev agent if issues encountered_

### File List

**NEW FILES (created)**

- `backend/tests/test_connection_tracking.py`
- `frontend/src/hooks/usePing.ts`
- `frontend/e2e/player-list-connection.spec.ts`
- (optional) `backend/app/tasks.py` for background heartbeat

**MODIFIED FILES**

- `backend/app/services/room_manager.py` (add status tracking)
- `backend/app/event_handlers.py` (add ping/pong, connection handlers)
- `backend/app/models.py` (enhance Player, add event models)
- `frontend/src/components/PlayerList.tsx` (add badges, remove on leave)
- `frontend/src/pages/RoomView.tsx` (start ping, stop on unmount)
- `frontend/src/hooks/useSocket.ts` (add connection handlers)
- `frontend/src/store/socketStore.ts` (add status actions)
- `backend/tests/test_roll_mechanics.py` (add broadcast tests)
- `README.md` (add documentation)

**DELETED FILES**

- None

---

## Senior Developer Review (AI)

_This section will be populated after code review_

### Review Outcome

- [ ] Approve
- [ ] Changes Requested
- [ ] Blocked

### Unresolved Action Items

_To be filled by reviewer_

### Key Findings

_To be filled by reviewer_

---

## Changelog

**Version 1.0 - 2025-11-17**

- Initial story creation from Epic 2 tech spec
- 12 tasks defined for connection status tracking
- 10 acceptance criteria for player list and connection monitoring
- Learnings from Story 2.2 incorporated
- Heartbeat mechanism (ping/pong) for reliable detection
- Full E2E test coverage for disconnect/reconnect scenarios
