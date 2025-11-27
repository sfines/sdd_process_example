# Story 2.1: Create a New Room

Status: complete
Completed: 2025-11-23

---

## Story

As a **User**,
I want to **create a new, empty game room**,
so that **I can invite others to join and play**.

---

## Acceptance Criteria

1. ✅ Home Screen displays "Your Name" input field (max 20 chars) and "Create Room" button
2. ✅ Clicking "Create Room" creates a room with unique WORD-#### code (e.g., "ALPHA-1234")
3. ✅ User is automatically joined to the room they create
4. ✅ Room View displays room code prominently in header with "Copy" button
5. ✅ Room created in "Open" mode by default
6. ✅ Initial room state stored in Redis with TTL 18000 seconds (5 hours)
7. ✅ Success toast notification appears: "Room created! Share code ALPHA-1234"
8. ✅ Collision detection prevents duplicate room codes
9. ✅ Player name sanitized (html.escape) to prevent XSS
10. ✅ "Create Room" button is visually distinct and easily tappable (44px+ tap target)

---

## Tasks / Subtasks

### Task 1: Backend Room Management Service

- [ ] Create `backend/app/services/room_manager.py`
  - [ ] Implement `RoomManager` class with methods: `create_room()`, `join_room()`, `get_room()`
  - [ ] Method: `create_room(player_name: str) -> RoomState`
    - [ ] Validate player name (1-20 chars, sanitize with html.escape)
    - [ ] Generate unique room code (WORD-####)
    - [ ] Handle collision detection (retry logic if code exists)
    - [ ] Create Redis hash with initial state: mode, created_at, creator_player_id, players, roll_history
    - [ ] Set Redis TTL to 18000 seconds (5 hours)
    - [ ] Return RoomState object
  - [ ] Log: `[ROOM_CREATE] Room {room_code} created by {player_name}`
  - [ ] Test: Direct calls to create_room return valid RoomState
  - [ ] Commit: "feat(backend): Add RoomManager.create_room() with collision detection"

### Task 2: Room Code Generation Utility

- [ ] Create `backend/app/utils/room_code_generator.py`
  - [ ] Implement `generate_room_code() -> str`
    - [ ] Load word list (e.g., 100 common words: ALPHA, BRAVO, CHARLIE, etc.)
    - [ ] Generate 4-digit random number (0000-9999)
    - [ ] Format: `{WORD}-{number:04d}` (e.g., ALPHA-1234)
    - [ ] Return formatted code
  - [ ] Implement `is_code_available(room_code: str, redis_client) -> bool`
    - [ ] Check if room_code exists in Redis as a key
    - [ ] Return True if available, False if taken
  - [ ] Unit test: Generate codes are unique format
  - [ ] Unit test: Collision detection works
  - [ ] Commit: "feat(backend): Add room code generation with collision detection"

### Task 3: Backend Socket.io Event Handler

- [ ] Add `create_room` event handler to `backend/app/event_handlers.py` (or create if new)
  - [ ] Handler signature: `@sio.event` for event `create_room`
  - [ ] Handler receives: `{ "player_name": string }`
  - [ ] Validate player name (1-20 chars, non-empty)
  - [ ] Call `RoomManager.create_room(player_name)`
  - [ ] On success: emit `room_created` event to client with RoomState
  - [ ] On error: emit `error` event with message
  - [ ] Log: All attempts (success and failures)
  - [ ] Test: Mock Socket.io, verify room_created event emitted
  - [ ] Commit: "feat(backend): Add Socket.io create_room event handler"

### Task 4: Backend Input Validation & Sanitization

- [ ] Create `backend/app/utils/validation.py`
  - [ ] Function: `sanitize_player_name(name: str) -> str`
    - [ ] Strip whitespace
    - [ ] Use `html.escape()` to prevent XSS
    - [ ] Enforce max 20 characters
    - [ ] Return sanitized name
  - [ ] Function: `validate_player_name(name: str) -> tuple[bool, str]`
    - [ ] Check length (1-20 chars)
    - [ ] Check not empty
    - [ ] Return (is_valid: bool, error_message: str)
  - [ ] Unit test: XSS payload sanitized
  - [ ] Unit test: 21-char name rejected
  - [ ] Unit test: Empty name rejected
  - [ ] Commit: "feat(backend): Add player name validation and sanitization"

### Task 5: Frontend Home Screen Component

- [ ] Create `frontend/src/pages/Home.tsx`
  - [ ] Render two sections: Create Room and Join Room
  - [ ] **Create Room Section:**
    - [ ] "Your Name" text input (max 20 chars, placeholder: "Enter your name")
    - [ ] "Create Room" button (44px height, distinct styling via Tailwind)
    - [ ] Input state: `playerName` (string)
    - [ ] Button click handler: validate name → emit `create_room` event
    - [ ] Styling: Tailwind classes for spacing, color (primary button)
  - [ ] **Join Room Section (deferred to Story 2.2):**
    - [ ] Placeholder or "Coming soon" for now
  - [ ] Test: Component renders without errors
  - [ ] Commit: "feat(frontend): Add Home page with Create Room form"

### Task 6: Frontend Socket.io Create Room Handler

- [ ] Update `frontend/src/hooks/useSocket.ts` (or create new hook)
  - [ ] Add `create_room()` function
    - [ ] Emit `create_room` event with player name
    - [ ] Listen for `room_created` event
    - [ ] On success: store room code in Zustand store, navigate to Room View
    - [ ] On error: display error toast with message
  - [ ] Update Zustand store with room state fields:
    - [ ] `roomCode: string | null`
    - [ ] `roomMode: "open" | "dm-led"`
    - [ ] `creatorPlayerId: string`
    - [ ] `players: Player[]`
    - [ ] `rollHistory: RollResult[]`
  - [ ] Test: Mock Socket.io, verify store updated on room_created
  - [ ] Commit: "feat(frontend): Add create_room Socket.io handler and store"

### Task 7: Frontend Navigation & Room View Placeholder

- [ ] Set up client-side routing (React Router or similar)
  - [ ] Route: `/` → Home page
  - [ ] Route: `/room/:roomCode` → Room View (create if not exists)
  - [ ] On `room_created` → navigate to `/room/{roomCode}`
- [ ] Create `frontend/src/pages/RoomView.tsx` placeholder
  - [ ] Render: Room code in header with Copy button (Tasks 8-9)
  - [ ] Render: Player list placeholder (deferred to Story 2.6)
  - [ ] Render: Roll history placeholder (deferred to Story 2.3)
  - [ ] Test: Page loads without errors
  - [ ] Commit: "feat(frontend): Add Room View page with header"

### Task 8: Frontend Room Code Display & Copy Button

- [ ] Create `frontend/src/components/RoomCodeDisplay.tsx`
  - [ ] Props: `roomCode: string`
  - [ ] Display: Room code prominently (large font, monospace)
  - [ ] Button: "Copy" button next to code
  - [ ] On click: Copy code to clipboard using `navigator.clipboard.writeText()`
  - [ ] Visual feedback: Change button text to "Copied!" for 2 seconds
  - [ ] Styling: Tailwind, button 44px+ tap target
  - [ ] Test: Component renders code and Copy button
  - [ ] Commit: "feat(frontend): Add RoomCodeDisplay component with copy functionality"

### Task 9: Frontend Toast Notification

- [ ] Implement toast notification system (use library or simple context)
  - [ ] Create `frontend/src/components/Toast.tsx` or use `react-hot-toast` library
  - [ ] Show success toast on room creation: "Room created! Share code {roomCode}"
  - [ ] Show error toast on room creation failure
  - [ ] Toast auto-dismisses after 3-5 seconds
  - [ ] Styling: Tailwind, green for success, red for errors
  - [ ] Test: Toast displays and dismisses
  - [ ] Commit: "feat(frontend): Add toast notification system"

### Task 10: End-to-End Test (Playwright)

- [ ] Create `frontend/e2e/create-room.spec.ts`
  - [ ] Test flow:
    1. Open app at `/`
    2. Enter player name in Home Screen
    3. Click "Create Room" button
    4. Wait for room creation (Socket.io event)
    5. Verify navigate to `/room/{roomCode}`
    6. Verify room code displayed in header
    7. Verify success toast appears
    8. Verify Copy button works (check clipboard)
  - [ ] Command: `npx playwright test create-room.spec.ts`
  - [ ] Test passes: Full create room flow working
  - [ ] Commit: "test(e2e): Add Playwright test for create room flow"

### Task 11: Integration Test (Backend + Redis)

- [ ] Create `backend/tests/test_room_creation.py`
  - [ ] Test: `test_create_room_generates_unique_code()`
    - [ ] Create 100 rooms
    - [ ] Verify all codes unique
  - [ ] Test: `test_create_room_sets_redis_ttl()`
    - [ ] Create room
    - [ ] Check Redis TTL is 18000 seconds
  - [ ] Test: `test_create_room_stores_initial_state()`
    - [ ] Create room
    - [ ] Verify Redis hash contains all expected fields
    - [ ] Verify `mode == "open"`, `creator_player_id` set, `players` contains creator
  - [ ] Test: `test_create_room_sanitizes_player_name()`
    - [ ] Create room with XSS payload
    - [ ] Verify name sanitized in Redis
  - [ ] Run with: `pytest backend/tests/test_room_creation.py`
  - [ ] All tests pass
  - [ ] Commit: "test(backend): Add integration tests for room creation"

### Task 12: Manual Testing & Documentation

- [ ] Manual test procedure:
  - [ ] Run `docker-compose up`
  - [ ] Open browser at `http://localhost`
  - [ ] Home Screen loads with Create Room form
  - [ ] Enter name "Steve" → Click Create Room
  - [ ] Room created, navigate to Room View
  - [ ] Room code displayed in header (e.g., "ALPHA-1234")
  - [ ] Copy button works (verify in clipboard)
  - [ ] Toast notification displays: "Room created! Share code ALPHA-1234"
  - [ ] Check backend logs: `[ROOM_CREATE]` entry logged
  - [ ] Wait 5 hours (or check Redis directly) → Verify TTL set
- [ ] Update README.md
  - [ ] Add section: "Room Creation Flow"
  - [ ] Explain home page, room code format, Toast notifications
- [ ] Commit: "docs: Add room creation flow documentation"

---

## Dev Notes

### Architecture Context

This story establishes the **room lifecycle foundation** for all multiplayer features. Key architectural alignments:

- **ADR-002 (Socket.io):** Implements room concept; all future stories build on this
- **ADR-003 (Redis State):** Room state persisted as Redis hash with TTL (ephemeral, no database needed)
- **ADR-006 (Zustand):** Room state synchronized to frontend store on creation
- **ADR-007 (Tailwind):** Home page and Room View fully styled with responsive layout

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Detailed-Design]

### Learnings from Previous Stories (1.1, 1.2)

**From Story 1.2 (Status: ready-for-dev)**

- **Socket.io Infrastructure:** Event handlers established; follow same pattern for `create_room` handler
- **Zustand Store Patterns:** Store created for WebSocket state; extend with room-specific fields (roomCode, players, rollHistory)
- **Structlog Logging:** All events logged in JSON format; include room_code and player_id in logs
- **Docker Environment:** Use existing docker-compose; Redis already running, ready for room state storage

**Key Reuse Points:**

- Use existing Socket.io server and event handler infrastructure from Story 1.2
- Extend existing Zustand store (don't recreate)
- Follow structlog logging patterns established in Story 1.2
- Reuse existing validation utilities (html.escape from Python stdlib)

[Source: docs/sprint-artifacts/tech-spec-epic-2.md#Architecture-Alignment]

### Project Structure

Expected file additions/modifications:

```
backend/
├── app/
│   ├── services/
│   │   ├── room_manager.py (NEW)
│   │   └── ...
│   ├── utils/
│   │   ├── room_code_generator.py (NEW)
│   │   ├── validation.py (NEW)
│   │   └── ...
│   ├── event_handlers.py (updated: add create_room handler)
│   ├── models.py (updated: add RoomState, Player Pydantic models)
│   └── ...
├── tests/
│   ├── test_room_creation.py (NEW)
│   └── ...
└── ...

frontend/
├── src/
│   ├── pages/
│   │   ├── Home.tsx (NEW)
│   │   ├── RoomView.tsx (NEW: placeholder)
│   │   └── ...
│   ├── components/
│   │   ├── RoomCodeDisplay.tsx (NEW)
│   │   ├── Toast.tsx (NEW)
│   │   └── ...
│   ├── hooks/
│   │   └── useSocket.ts (updated: add create_room handler)
│   ├── store/
│   │   └── socketStore.ts (updated: add room state fields)
│   └── ...
├── e2e/
│   ├── create-room.spec.ts (NEW)
│   └── ...
└── ...
```

### Testing Strategy

**Unit Tests:**

- Backend: `test_room_code_generator.py` (uniqueness, format)
- Backend: `test_validation.py` (sanitization, XSS prevention)
- Frontend: `Home.test.tsx` (component render, form submission)
- Frontend: `RoomCodeDisplay.test.tsx` (copy button, clipboard)

**Integration Tests:**

- `test_room_creation.py`: Room creation with Redis, TTL verification, state persistence

**E2E Tests:**

- `create-room.spec.ts`: Full user journey from Home → Room View

**Manual Testing:**

- Run docker-compose, create room, verify Redis state, check logs

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Test-Strategy-Summary]

### Key Dependencies

| Package             | Version | Purpose                        | Ecosystem |
| ------------------- | ------- | ------------------------------ | --------- |
| redis               | 5.0+    | Room state storage             | Python    |
| python-slugify      | 8.0+    | Room code generation           | Python    |
| pydantic            | 2.5+    | RoomState validation           | Python    |
| socket.io (backend) | 5.10+   | WebSocket (already in 1.2)     | Python    |
| zustand             | 4.4+    | Frontend room state            | Node.js   |
| react-router        | 6.0+    | Client-side routing            | Node.js   |
| react-hot-toast     | 2.4+    | Toast notifications (optional) | Node.js   |

### Constraints & Patterns

- **Redis Pattern:** Single hash per room, keyed by room_code
- **Naming Convention:** Room code format WORD-#### (100 words × 10,000 numbers = 1M possibilities)
- **TTL Management:** Redis TTL is single source of truth; no manual cleanup needed
- **Input Validation:** Always sanitize player names on backend (never trust client)
- **Async Safety:** Redis operations are atomic (HSET, TTL set together)
- **Logging:** All room operations logged with room_code for traceability

---

## References

- **Epic Tech Spec:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- **Tech Spec - Room Creation Flow:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Workflows-and-Sequencing]
- **Story 1.2 Context:** [Source: docs/sprint-artifacts/1-2-hello-world-websocket-connection.md]
- **Architecture - ADR-002 (Socket.io):** [Source: docs/architecture.md#Architectural-Decisions]
- **Architecture - ADR-003 (Redis):** [Source: docs/architecture.md#Architectural-Decisions]

---

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/2-1-create-a-new-room.context.xml

### Agent Model Used

Claude 3 (Latest)

### Completion Notes List

_To be filled by dev agent upon completion_

- Room code generation with collision detection proven robust
- Redis hash pattern for room state established as foundation for all future stories
- Socket.io room events infrastructure extended from WebSocket foundation

### Debug Log References

_To be filled by dev agent if issues encountered_

### File List

**NEW FILES (created)**

- `backend/app/services/room_manager.py`
- `backend/app/utils/room_code_generator.py`
- `backend/app/utils/validation.py`
- `backend/tests/test_room_creation.py`
- `frontend/src/pages/Home.tsx`
- `frontend/src/pages/RoomView.tsx`
- `frontend/src/components/RoomCodeDisplay.tsx`
- `frontend/src/components/Toast.tsx`
- `frontend/e2e/create-room.spec.ts`

**MODIFIED FILES**

- `backend/app/event_handlers.py` (add create_room handler)
- `backend/app/models.py` (add RoomState, Player Pydantic models)
- `frontend/src/hooks/useSocket.ts` (add create_room handler)
- `frontend/src/store/socketStore.ts` (extend with room fields)
- `frontend/src/App.tsx` (add routing setup)
- `README.md` (add room creation documentation)

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
- 12 tasks defined covering backend services, frontend UI, testing
- 10 acceptance criteria mapped to tech spec
- Learnings from Epic 1 incorporated
- Risk mitigations and architectural alignment documented
