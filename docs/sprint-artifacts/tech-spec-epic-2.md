# Epic Technical Specification: Core Dice Rolling & Room Experience

Date: 2025-11-17
Author: Steve
Epic ID: 2
Status: Draft

---

## Overview

Epic 2 delivers the **primary user value proposition**: the ability for players to create and join ephemeral game rooms and share dice rolls in real-time. This epic implements the complete basic user journey from room creation through roll history viewing, establishing the core multiplayer functionality that makes the D&D Dice Roller unique.

Unlike Epic 1 (infrastructure foundation), Epic 2 is user-facing and feature-rich. It encompasses room lifecycle management, player management, dice rolling engine, roll history tracking, and a responsive UI that works across devices. By the end of this epic, the application transitions from "Hello World" proof-of-concept to a functional multiplayer dice roller for D&D game sessions.

## Objectives and Scope

### In-Scope

- **Room Management:** Create rooms with unique WORD-#### codes, join existing rooms, auto-expiration with TTL, admin privileges for creator
- **Multiplayer Support:** Join/leave events, player list display, connection status tracking, 8-player capacity limit
- **Dice Rolling Engine:** All standard D&D dice (d4-d100), multiple dice (3d6, 8d10), modifiers (+/-), advantage/disadvantage (2d20)
- **Roll History:** Immutable audit trail, virtual scrolling for 500+ rolls, auto-scroll on new roll, timestamp and player tracking
- **Room Modes:** Open (default, all players equal) and DM-led (DM features deferred to Epic 3)
- **User Interface:** Shared roll history feed, simplified input (1d20 + modifier default), "Advanced" toggle for full controls, mobile-responsive layout
- **Performance:** < 500ms roll broadcast latency, < 2s page load on 3G

### Out-of-Scope (Deferred to Later Epics)

- DM Features (hidden rolls, DC checks) → Epic 3
- Roll Permalinks → Epic 4
- Roll Presets → Epic 5
- Advanced features (room password, voice chat, spectator mode) → Post-MVP
- Analytics and statistics → Post-MVP

## System Architecture Alignment

This epic expands on Epic 1's foundation and directly implements core ADRs:

- **ADR-002 (WebSocket Architecture):** Extends Socket.io with room management, multiplayer events, roll broadcasting
- **ADR-003 (State Storage):** Implements Redis room state pattern with hash structure per room, TTL management
- **ADR-006 (Frontend State):** Extends Zustand with room state, player list, roll history
- **ADR-007 (Styling):** Fully implements Tailwind CSS with responsive breakpoints (640px, 1024px)
- **ADR-010 (Testing):** Establishes E2E test patterns for multiplayer flows (2+ concurrent users)

This epic is the **minimum viable product (MVP)** that enables Steve's D&D group to run a real 3-hour game session.

---

## Detailed Design

### Services and Modules

| Module                    | Responsibility                                                  | Inputs                                | Outputs                                | Owner    |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------- | -------------------------------------- | -------- |
| **RoomManager**           | Create/join/leave rooms, TTL management, player tracking        | Room code, player name, action        | Room state, events                     | Backend  |
| **DiceEngine**            | Generate rolls with cryptographic randomness, validate formulas | Dice formula (1d20+5), advantage flag | Roll result with individual die values | Backend  |
| **RollHistory**           | Store and retrieve rolls per room, implement virtual pagination | Roll data, room_id, offset            | Paginated rolls, metadata              | Backend  |
| **PlayerSessionTracker**  | Track connected/disconnected players, manage session state      | Connection events, player_id          | Session metadata, connection status    | Backend  |
| **RoomUI Component**      | Render room view with roll history, player list, input controls | Room state, rolls, players            | DOM updates                            | Frontend |
| **RollInput Component**   | Simple and advanced dice input modes, form validation           | User input, mode (simple/advanced)    | Validated formula + modifier           | Frontend |
| **RollHistory Component** | Virtual scrolling, auto-scroll, item rendering                  | Rolls array, scroll position          | Rendered history list                  | Frontend |
| **PlayerList Component**  | Display connected players, connection status badges             | Players array                         | Rendered list with status icons        | Frontend |

### Data Models and Contracts

#### Backend Redis Room Hash

```
ROOM:{room_code} = {
  "mode": "open" | "dm-led",
  "created_at": ISO8601 timestamp,
  "last_activity": ISO8601 timestamp,
  "creator_player_id": UUID,
  "players": JSON array [{ id, name, connected, joined_at }, ...],
  "roll_history": JSON array [{ id, player_id, formula, results, total, timestamp }, ...],
  "settings": JSON { dc: null | integer, ... }
}

TTL: 18000 seconds (5 hours for Open, 1800 seconds for DM-led)
```

#### Roll Result Data Model (Pydantic)

```python
class RollResult(BaseModel):
    roll_id: str  # UUID
    player_id: str
    player_name: str
    formula: str  # "1d20+5"
    individual_results: List[int]  # [18] for 1d20, [4, 5, 6] for 3d6
    total: int
    timestamp: datetime
    dc_pass: Optional[bool]  # True if roll >= DC, null if no DC set
```

#### Room State (Pydantic)

```python
class RoomState(BaseModel):
    room_code: str
    mode: Literal["open", "dm-led"]
    created_at: datetime
    creator_player_id: str
    players: List[Player]
    roll_history: List[RollResult]
    settings: RoomSettings
```

### APIs and Interfaces

#### WebSocket Events (Socket.io - Epic 2 additions)

| Event           | Payload                                                                              | Direction        | Purpose                      |
| --------------- | ------------------------------------------------------------------------------------ | ---------------- | ---------------------------- |
| `create_room`   | `{ mode: "open"\|"dm-led", player_name: string }`                                    | C→S              | Create room and auto-join    |
| `room_created`  | `{ room_code: string, room_state: RoomState }`                                       | S→C              | Confirm creation             |
| `join_room`     | `{ room_code: string, player_name: string }`                                         | C→S              | Request to join              |
| `room_joined`   | `{ player_id: string, room_state: RoomState }`                                       | S→C              | Confirm join                 |
| `player_joined` | `{ player: Player }`                                                                 | S→Broadcast      | Notify room of new player    |
| `player_left`   | `{ player_id: string }`                                                              | S→Broadcast      | Notify room of departure     |
| `roll_dice`     | `{ formula: string, modifier: int, advantage: "none"\|"advantage"\|"disadvantage" }` | C→S              | Request roll                 |
| `roll_result`   | `{ roll: RollResult }`                                                               | S→Broadcast      | Broadcast result to all      |
| `room_expiring` | `{ seconds_remaining: number }`                                                      | S→Broadcast      | Warning at 180s and 30s      |
| `room_closed`   | `{ reason: string }`                                                                 | S→Broadcast      | Room expired or force-closed |
| `kick_player`   | `{ player_id: string }`                                                              | C→S (admin only) | Admin kicks player           |
| `player_kicked` | `{ player_id: string, kicker_id: string }`                                           | S→Broadcast      | Notify of kick               |

#### REST API Endpoints

| Method | Path                                                | Purpose                            | Response                                   |
| ------ | --------------------------------------------------- | ---------------------------------- | ------------------------------------------ |
| GET    | `/api/rooms/{room_code}`                            | Verify room exists (pre-join)      | `{ exists: bool, mode: string }`           |
| GET    | `/api/rooms/{room_code}/history?offset=0&limit=100` | Fetch roll history with pagination | `{ rolls: [], total: int, hasMore: bool }` |

### Workflows and Sequencing

#### Room Creation Flow

```
1. User opens app → sees Home Screen (player name input + Create Room button)
2. User enters name → clicks Create Room
3. Frontend validates name (1-20 chars) → emits create_room event
4. Backend generates unique room code (retry logic for collisions)
5. Backend creates Redis hash with initial state
6. Backend emits room_created → sets room TTL to 18000s
7. Frontend receives room_created → transitions to Room View
8. Frontend renders room code in header with Copy button
9. Toast notification: "Room created! Share code ALPHA-1234"
10. Backend broadcasts empty player_list to creator (just them)
```

#### Room Join Flow

```
1. User opens app → sees Home Screen with Join inputs (room code + name)
2. User enters code and name → clicks Join
3. Frontend validates inputs → emits join_room event
4. Backend validates room exists AND has < 8 players
5. Backend adds player to Redis room.players array
6. Backend refreshes TTL on room
7. Backend emits room_joined to joining player → sends full RoomState
8. Backend broadcasts player_joined event to other players
9. Frontend receives room_joined → transitions to Room View
10. Frontend renders updated player list and roll history
11. Other players see new player in list with "connected" status
```

#### Dice Roll Flow

```
1. User in Room View fills roll input (simplified: 1d20 + modifier)
2. User clicks "Roll" button
3. Frontend validates formula (regex: ^\d+d\d+([+-]\d+)?$)
4. Frontend emits roll_dice event with formula + modifier
5. Backend parses formula (e.g., "1d20+5" → 1d, 1×d20, +5 modifier)
6. Backend generates cryptographic random rolls (secrets.SystemRandom())
7. Backend calculates total: sum(individual_results) + modifier
8. Backend creates RollResult object with timestamp
9. Backend appends to room.roll_history in Redis
10. Backend emits roll_result → broadcasts to all room players (< 500ms)
11. Frontend receives roll_result → appends to local roll history
12. Frontend auto-scrolls to newest roll
13. All players see: "Steve rolled 1d20+5 = 18 + 5 = 23"
14. Roll animation/flash highlights the roll for 1 second
```

#### Room Expiration Flow

```
1. Room created with TTL 18000s (5 hours for Open mode)
2. Every action (join, roll, etc.) refreshes the TTL
3. After 14400s (4 hours) of inactivity → Backend emits room_expiring (180s remaining)
4. After 17970s (4h 59m 30s) → Backend emits room_expiring (30s remaining)
5. After 18000s → Redis key expires, backend cleanup job removes room
6. Frontend receives room_closed → displays "Room expired" modal
7. Users returned to Home Screen
```

---

## Non-Functional Requirements

### Performance

- **Roll Broadcast Latency:** < 500ms from client emit to all players receiving result (p95)
- **Page Load:** < 2s on 3G connection (measured with Lighthouse)
- **Room List Render:** 500+ rolls with virtual scrolling, smooth 60 FPS scrolling
- **API Response:** Room join/create < 200ms (p95)
- **WebSocket Connection:** Established within 500ms (from Epic 1)

### Scalability

- **Concurrent Rooms:** Support 50+ concurrent rooms (50 × 8 players = 400 CCU minimum)
- **Rolls per Room:** Virtual scrolling supports 500+ rolls in memory; paginate for larger
- **Storage:** Redis ephemeral (no persistence required for MVP); room expires after 5 hours

### Reliability

- **Room State Consistency:** No race conditions on roll insertion (use server-side timestamp + sequence number)
- **Player Disconnect Handling:** Graceful degradation; reconnect preserves player ID and room state
- **Roll History Immutability:** Cannot delete or edit rolls; audit trail is permanent for room lifetime
- **TTL Management:** Redis TTL is single source of truth; no manual cleanup needed

### Security

- **Input Validation:** Sanitize player names (html.escape), validate dice formulas (regex)
- **Capacity Limits:** Enforce 8-player max per room, max 20-char names
- **Roll Fairness:** Server-side generation only; no client-side rolls accepted
- **Room Code Entropy:** WORD-#### format ensures ~100K possible codes; acceptable collision risk

### Observability

- **Structured Logging:** All room events logged with room_id, player_id, timestamp
- **Metrics:** Track room creation rate, average players per room, roll latency
- **Errors:** Backend exceptions include room_code context; logged with structlog

---

## Dependencies and Integrations

### Backend New Dependencies

| Package        | Version | Purpose                                      |
| -------------- | ------- | -------------------------------------------- |
| redis          | 5.0+    | Redis Python client (room state storage)     |
| python-slugify | 8.0+    | Generate WORD part of room code              |
| secrets        | builtin | Cryptographic randomness for roll generation |

### Frontend New Dependencies

| Package                 | Version | Purpose                                                     |
| ----------------------- | ------- | ----------------------------------------------------------- |
| zustand                 | 4.4+    | Extend store for room state (already installed)             |
| tailwindcss             | 3.4+    | Already installed, now fully utilized for responsive layout |
| @tanstack/react-virtual | 3.0+    | Virtual scrolling for roll history                          |

### No External Service Dependencies (MVP)

- Roll Permalinks (Epic 4) deferred
- No third-party roll APIs or game data services
- Self-contained multiplayer implementation

---

## Acceptance Criteria (Authoritative - from Epics)

### Story 2.1: Create a New Room

1. ✅ Room created with unique WORD-#### code
2. ✅ User auto-joined to room
3. ✅ Room code displayed in header with Copy button
4. ✅ Room created in Open mode by default
5. ✅ Initial state stored in Redis with TTL
6. ✅ Success toast notification appears

### Story 2.2: Join an Existing Room

1. ✅ User added to existing room
2. ✅ Player list visible showing all players
3. ✅ player_joined event broadcasts to room
4. ✅ Roll history loaded and displayed

### Story 2.3: Basic Dice Roll (1d20)

1. ✅ Roll generated server-side
2. ✅ Result broadcast in < 500ms
3. ✅ Roll appears in history with name, formula, total, timestamp
4. ✅ History auto-scrolls to new roll
5. ✅ Animation highlights roll for 1 second

### Story 2.4: Roll All Standard Dice Types

1. ✅ Advanced toggle reveals dice selection UI
2. ✅ All dice types work: d4, d6, d8, d10, d12, d20, d100
3. ✅ Rolls verified for correctness

### Story 2.5: Advantage/Disadvantage

1. ✅ Advantage option rolls 2d20, displays both, highlights higher
2. ✅ Disadvantage option rolls 2d20, displays both, highlights lower
3. ✅ Correct result used (higher for advantage, lower for disadvantage)

### Story 2.6: Player List & Connection Status

1. ✅ Player list shows all connected players with names
2. ✅ Connection status updates (connected/disconnected)
3. ✅ Join/leave events trigger list updates

### Story 2.7: Roll Multiple Dice

1. ✅ Advanced input accepts NdN format (3d6, 8d10, etc.)
2. ✅ Individual die results shown (e.g., [4, 2, 5])
3. ✅ Total sum calculated and displayed

### Story 2.8: Room Expiration & Warnings

1. ✅ Room auto-expires after 5 hours (Open mode)
2. ✅ Warning at 3 minutes remaining
3. ✅ Warning at 30 seconds remaining
4. ✅ Room closed and players notified on expiration

### Story 2.9: Kick a Player

1. ✅ Room creator (admin) can kick players
2. ✅ Kicked player receives notification
3. ✅ Kicked player list updated for all
4. ✅ Kicked session blocked from rejoin for session lifetime

### Story 2.10: Virtual Scrolling for Roll History

1. ✅ Smooth scrolling with 500+ rolls
2. ✅ Pagination after 100 visible rolls
3. ✅ Efficient memory usage (only visible items in DOM)

### Story 2.11: Mobile Responsive UI

1. ✅ Layout responsive at 640px (mobile), 1024px (tablet), 1280px+ (desktop)
2. ✅ Roll history drawer collapsible on mobile
3. ✅ Touch-friendly button sizes (44px+ tap targets)
4. ✅ Works on iOS Safari and Android Chrome

---

## Traceability Mapping

| Story                       | AC Count | Code Modules                               | Tests                                        | Dependencies            |
| --------------------------- | -------- | ------------------------------------------ | -------------------------------------------- | ----------------------- |
| 2.1: Create Room            | 6        | RoomManager, RoomUI                        | E2E: create room flow                        | redis, python-slugify   |
| 2.2: Join Room              | 4        | RoomManager, PlayerSessionTracker, RoomUI  | E2E: join room flow                          | redis                   |
| 2.3: Basic Roll             | 5        | DiceEngine, RollHistory, Socket.io         | Unit: roll generation; E2E: roll broadcast   | secrets                 |
| 2.4: All Dice               | 3        | DiceEngine                                 | Unit: dice parsing; Unit: result validation  | secrets                 |
| 2.5: Advantage/Disadvantage | 3        | DiceEngine                                 | Unit: 2d20 generation, highlight logic       | secrets                 |
| 2.6: Player List            | 3        | PlayerSessionTracker, PlayerList component | Unit: status updates; E2E: join/leave        | Zustand                 |
| 2.7: Multiple Dice          | 3        | DiceEngine                                 | Unit: NdN parser; Unit: sum calculation      | secrets                 |
| 2.8: Room Expiration        | 4        | RoomManager, TTL logic                     | Unit: TTL refresh; E2E: expiration warnings  | redis                   |
| 2.9: Kick Player            | 4        | RoomManager, Authorization                 | Unit: kick validation; E2E: kick flow        | redis                   |
| 2.10: Virtual Scrolling     | 3        | RollHistory component                      | Unit: virtualization logic; E2E: scroll perf | @tanstack/react-virtual |
| 2.11: Mobile Responsive     | 4        | All components (Tailwind breakpoints)      | E2E: mobile viewport tests                   | tailwindcss             |

---

## Risks, Assumptions, Open Questions

### Risks

1. **Race Condition on Roll Insertion:** Multiple players rolling simultaneously → Server timestamp + sequence number mitigates
2. **Redis Connection Drops:** Room state lost → Graceful degradation; players notified; room can be recreated
3. **Large Roll History Memory:** 500+ rolls in JavaScript array → Virtual scrolling and pagination handle
4. **Mobile Network Latency:** 500ms broadcast target may not be met on 4G → Graceful degradation; fallback to long-polling if needed (Epic 1)
5. **Dice Formula Edge Cases:** User inputs "0d20" or "99d99" → Strict validation regex and limits

### Assumptions

1. **Redis Available:** Redis is running (docker-compose manages it)
2. **Cryptographic Randomness Available:** Python secrets module available (standard library)
3. **Players Stay in Room:** We don't handle "idling" players; inactivity just refreshes TTL
4. **Player Names Unique (not enforced):** Two players can have the same name; identified by UUID internally
5. **No Room Password:** All rooms are public join (password feature in post-MVP)

### Open Questions

1. **Concurrent Roll Handling:** If 2 players roll simultaneously, what's the guaranteed order in history? → Server timestamp (milliseconds) + sequence number
2. **Room Code Collision Probability:** ~100K codes, how many concurrent rooms acceptable? → Target 50-100 concurrent rooms; collision unlikely but retry logic handles
3. **Advanced Dice Notation Support:** Should we support "2d6+1d8+3" (mixed dice)? → Not in MVP; Story 2.3 supports single dice type only
4. **Spectator Mode:** Can players watch without rolling? → Out-of-scope for MVP; could add in post-MVP
5. **Roll Undo/Retract:** Can players take back a roll? → No; immutable audit trail is a feature

---

## Test Strategy Summary

### Unit Tests (Backend)

- **DiceEngine:** Test all dice types, modifiers, advantage/disadvantage, edge cases
- **RoomManager:** Test room creation, joining, player limits, TTL refresh
- **RollHistory:** Test insertion, retrieval, pagination, order preservation
- **Input Validation:** Test name sanitization, formula validation, capacity checks

### Unit Tests (Frontend)

- **RoomUI Components:** Test render with various room states
- **DiceInput:** Test simple/advanced modes, formula validation
- **RollHistory:** Test virtual scrolling, auto-scroll, empty state
- **PlayerList:** Test status updates, disconnection badges

### Integration Tests

- **Backend + Redis:** Test room lifecycle (create → join → roll → expire)
- **Backend + Socket.io:** Test event broadcasting to multiple clients
- **Frontend + Socket.io:** Test state updates from events

### E2E Tests (Playwright)

- **Walking Skeleton (Week 2):** 2 users, create room → join room → roll dice → see result
- **Multiplayer Flow (Week 3):** 4 concurrent users, verify all see rolls in real-time
- **Room Expiration (Week 4):** Create room → wait for warnings → verify auto-close
- **Mobile Responsive (Week 4):** Test 640px viewport, touch interactions

### Load Testing

- **Target:** 50 concurrent rooms (400 CCU)
- **Tool:** Locust (Python-based)
- **Metrics:** Latency p95, throughput, error rate

---

## Implementation Roadmap (Phased within Epic 2)

### Week 2: Core Room & Roll (Stories 2.1-2.3)

- Backend: RoomManager, basic DiceEngine, Socket.io room events
- Frontend: Room creation/join UI, basic roll input, roll history display
- E2E test: Walking skeleton (create → join → roll)

### Week 3: All Dice & Multiplayer (Stories 2.4-2.7)

- Backend: Advanced DiceEngine (all dice, modifiers, advantage/disadvantage)
- Frontend: Advanced roll input UI, player list, connection status
- E2E test: 4-player concurrent rolls

### Week 4: Polish & Edge Cases (Stories 2.8-2.11)

- Backend: TTL warnings, kick logic, room expiration
- Frontend: Mobile responsive layout, virtual scrolling, visual polish
- E2E test: Room expiration, mobile viewport, virtual scrolling performance

### Week 5: Testing & Integration (All Stories)

- Unit test coverage: 80% backend, 60% frontend
- Integration test coverage: Critical paths
- Load test: 50 concurrent rooms
- Code review and refinement

---

## Success Criteria for Epic 2

✅ **Epic 2 is complete when:**

1. All 11 stories' acceptance criteria pass
2. All stories have passing E2E tests
3. Unit test coverage ≥ 80% backend, ≥ 60% frontend
4. Code review approved (no blocking issues)
5. Load test passes (50 concurrent rooms, p95 latency < 1s)
6. Mobile responsive verified on iOS Safari and Android Chrome
7. Zero data loss on room expiration (players notified)
8. Multiplayer E2E test passes (4+ concurrent users)
9. Team can run full 3-hour D&D game session without critical issues

---

## Appendix: Architecture Decision References

- **ADR-002:** Socket.io for WebSocket communication with room concept
- **ADR-003:** Valkey (Redis) for ephemeral room state with TTL
- **ADR-006:** Zustand for frontend state management
- **ADR-007:** Tailwind CSS for responsive styling
- **ADR-010:** TDD with 80% backend coverage

---

## Appendix: Related Epics

- **Epic 1 (Prerequisite):** Project scaffolding, Docker, CI/CD, WebSocket foundation
- **Epic 3 (Builds on 2):** DM features (hidden rolls, DC checks)
- **Epic 4 (Builds on 2):** Roll permalinks (share rolls after session)
- **Epic 5 (Builds on 2):** Roll presets (save frequently-used rolls)
