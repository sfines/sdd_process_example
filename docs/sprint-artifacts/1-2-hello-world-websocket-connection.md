# Story 1.2: "Hello World" WebSocket Connection

Status: ready-for-dev

---

## Story

As a **User**,
I want the **frontend to establish a WebSocket connection with the backend**,
so that **real-time communication is proven to work end-to-end**.

---

## Acceptance Criteria

1. ✅ Application runs locally via `docker-compose up` without errors
2. ✅ Frontend loads successfully at `http://localhost` in browser
3. ✅ Frontend WebSocket successfully connects to backend via Socket.io within 500ms
4. ✅ Frontend emits `connect` event upon successful connection
5. ✅ Backend receives `connect` event and logs it with structlog in JSON format
6. ✅ Frontend sends `hello_message` event with payload `{"message": "Hello from client!"}`
7. ✅ Backend receives `hello_message`, processes it, and emits `world_message` with payload `{"message": "World from server!"}` back to client
8. ✅ Frontend receives `world_message` event and displays message: **"Connection established: World from server!"**
9. ✅ All connection, message, and disconnect events logged on both backend and frontend
10. ✅ E2E test (Playwright) validates complete hello → world flow

---

## Tasks / Subtasks

### Task 1: Backend Socket.io Setup

- [ ] Install dependencies
  - [ ] `pip install python-socketio[asyncio_client] aiofiles`
  - [ ] Update `backend/pyproject.toml` with new dependencies
  - [ ] Verify imports work: `from socketio import AsyncServer`
- [ ] Create Socket.io server instance in FastAPI
  - [ ] Create `backend/app/socket_manager.py` with `AsyncServer` instance
  - [ ] Configure CORS for local dev (allow `http://localhost:3000`)
  - [ ] Integrate Socket.io with FastAPI app via ASGI middleware
  - [ ] Test: Server starts without errors
  - [ ] Commit: "feat(backend): Initialize Socket.io server with FastAPI"

### Task 2: Backend Event Handlers

- [ ] Implement `connect` event handler
  - [ ] Handler logs: `[CONNECT] Client {session_id} connected`
  - [ ] Use structlog for JSON structured logging
  - [ ] Store connection metadata (timestamp, client info) if available
  - [ ] Test: Connection logs appear in backend stdout
- [ ] Implement `disconnect` event handler
  - [ ] Handler logs: `[DISCONNECT] Client {session_id} disconnected`
  - [ ] Clean up session state (deferred details to Epic 2)
- [ ] Implement `hello_message` event handler
  - [ ] Handler validates payload (Pydantic model: `HelloMessage`)
  - [ ] Handler logs: `[MESSAGE] Received hello_message from {session_id}`
  - [ ] Handler emits `world_message` back: `{"message": "World from server!"}`
  - [ ] Test: Sending hello → receives world response
- [ ] Commit: "feat(backend): Add Socket.io event handlers for connect/disconnect/hello_message"

### Task 3: Backend Structlog Setup

- [ ] Install structlog
  - [ ] `pip install structlog`
  - [ ] Update `backend/pyproject.toml`
- [ ] Configure structlog in FastAPI startup
  - [ ] Create `backend/app/logging.py` with structlog config
  - [ ] Set output format: JSON (for production), key-value (for dev)
  - [ ] Configure processors: `add_log_level`, `timestamp`, `json_renderer`
  - [ ] Test: Logs output in structured JSON format
- [ ] Update Socket.io handlers to use structlog
  - [ ] Replace print statements with `structlog.get_logger().info(...)`
  - [ ] Include fields: `event`, `session_id`, `timestamp`, `message`
- [ ] Commit: "feat(backend): Add structlog JSON logging configuration"

### Task 4: Frontend Socket.io Client Setup

- [ ] Install socket.io-client
  - [ ] `npm install socket.io-client`
  - [ ] Update `frontend/package.json`
  - [ ] Verify import: `import io from 'socket.io-client'`
- [ ] Create Socket.io client utility
  - [ ] Create `frontend/src/services/socket.ts`
  - [ ] Initialize Socket.io client: `io('http://localhost:8000', { path: '/socket.io' })`
  - [ ] Configure for local dev (autoConnect: true, reconnection: true)
  - [ ] Export socket instance for use in components
  - [ ] Test: No errors on import
- [ ] Commit: "feat(frontend): Initialize Socket.io client"

### Task 5: Frontend Zustand Store

- [ ] Create Zustand store for WebSocket state
  - [ ] Create `frontend/src/store/socketStore.ts`
  - [ ] Store properties:
    - `isConnected: boolean` (default: false)
    - `connectionMessage: string | null` (displays received message)
    - `connectionError: string | null` (error if connection fails)
  - [ ] Store actions:
    - `setConnected(connected: boolean)`
    - `setConnectionMessage(message: string)`
    - `setConnectionError(error: string)`
  - [ ] Test: Store initializes and actions work
- [ ] Integrate store with Socket.io client
  - [ ] Create `frontend/src/hooks/useSocket.ts` custom hook
  - [ ] Hook initializes Socket.io in useEffect
  - [ ] Hook sets up event listeners: `connect`, `disconnect`, `world_message`
  - [ ] Hook updates Zustand store on each event
- [ ] Commit: "feat(frontend): Add Zustand store and useSocket hook for WebSocket state"

### Task 6: Frontend Connect Handler

- [ ] Implement Socket.io connect event listener
  - [ ] On `connect` event: call `store.setConnected(true)`
  - [ ] Log to console: `console.log('WebSocket connected')`
  - [ ] Test: Connection status shows as connected in browser console
- [ ] Implement Socket.io disconnect event listener
  - [ ] On `disconnect` event: call `store.setConnected(false)`
  - [ ] Log to console: `console.log('WebSocket disconnected')`
- [ ] Commit: "feat(frontend): Handle WebSocket connect/disconnect events"

### Task 7: Frontend Message Send & Receive

- [ ] Implement send `hello_message` on connect
  - [ ] Create function: `sendHelloMessage()` in useSocket hook
  - [ ] On successful connect, emit: `socket.emit('hello_message', { message: 'Hello from client!' })`
  - [ ] Log to console: `console.log('Sent hello_message')`
- [ ] Implement receive `world_message` handler
  - [ ] Listen for `world_message` event
  - [ ] Extract payload and call `store.setConnectionMessage(payload.message)`
  - [ ] Log to console: `console.log('Received world_message', message)`
  - [ ] Test: Message appears in browser console
- [ ] Commit: "feat(frontend): Send hello_message and receive world_message"

### Task 8: Frontend Display Success Message

- [ ] Update App component to display connection status
  - [ ] Create `frontend/src/components/ConnectionStatus.tsx`
  - [ ] Component reads from Zustand store: `useSocketStore()`
  - [ ] Display:
    - If `isConnected`: Show "🟢 Connected"
    - If `connectionMessage`: Show `"Connection established: {connectionMessage}"`
    - If `connectionError`: Show `"❌ Error: {connectionError}"` in red
  - [ ] Styling: Use Tailwind CSS (green for success, red for error)
  - [ ] Test: Success message displays when `world_message` received
- [ ] Import and render `ConnectionStatus` in App.tsx
- [ ] Commit: "feat(frontend): Add ConnectionStatus component displaying real-time connection state"

### Task 9: E2E Test (Playwright)

- [ ] Create `frontend/e2e/hello-world.spec.ts`
  - [ ] Test setup: Start docker-compose environment
  - [ ] Test flow:
    1. Open `http://localhost`
    2. Wait for connection status to show "Connected"
    3. Wait for message "Connection established: World from server!"
    4. Assert message is visible
    5. Check browser console for WebSocket events
  - [ ] Test cleanup: Stop docker-compose
  - [ ] Command: `npx playwright test hello-world.spec.ts`
  - [ ] Test passes: Full hello → world flow validated
- [ ] Add to CI/CD (update `.github/workflows/test.yml`)
  - [ ] Run Playwright E2E tests on develop branch push
  - [ ] Use `docker-compose` service or test locally
- [ ] Commit: "test(e2e): Add Playwright test for WebSocket hello-world flow"

### Task 10: Manual Testing & Validation

- [ ] Local manual test:
  - [ ] Run `docker-compose up`
  - [ ] Open `http://localhost` in browser
  - [ ] Open browser DevTools → Console
  - [ ] Wait for messages:
    - Backend logs: `[CONNECT] Client {id} connected`
    - Frontend logs: `WebSocket connected`, `Sent hello_message`
    - Backend logs: `[MESSAGE] Received hello_message from {id}`
    - Frontend logs: `Received world_message`
  - [ ] Verify page displays: **"Connection established: World from server!"**
  - [ ] Close browser tab → backend logs: `[DISCONNECT] Client {id} disconnected`
  - [ ] Confirm: No errors in browser console or backend logs
- [ ] Network debugging (optional):
  - [ ] Open DevTools → Network tab
  - [ ] Look for WebSocket connection (green status 101 Switching Protocols)
  - [ ] Inspect WebSocket frames showing message exchange
- [ ] Cross-browser test (optional):
  - [ ] Test in Chrome, Firefox, Safari
  - [ ] Verify connection works consistently
- [ ] Commit: "test(manual): Validate WebSocket connection manually across browsers"

### Task 11: Documentation & Logging Verification

- [ ] Update backend README
  - [ ] Add section: "WebSocket Events"
  - [ ] Document `hello_message` and `world_message` event signatures
  - [ ] Show example structlog JSON output
- [ ] Update frontend README
  - [ ] Add section: "Socket.io Integration"
  - [ ] Explain Zustand store structure
  - [ ] Show how to add new Socket.io events
- [ ] Verify logging works end-to-end
  - [ ] Run `docker-compose up` with log level set to INFO/DEBUG
  - [ ] Pipe backend logs to file: Check for all `[CONNECT]`, `[MESSAGE]`, `[DISCONNECT]` entries
  - [ ] Check frontend browser console for all WebSocket events
- [ ] Commit: "docs: Add WebSocket documentation and logging examples"

---

## Dev Notes

### Architecture Context

This story validates the **WebSocket foundation** established in Story 1.1, proving end-to-end real-time communication works. Key architectural alignments:

- **WebSocket Architecture (ADR-002):** Implements Socket.io server and client; validates all room management concepts will work in Epic 2
- **Frontend State Management (ADR-006):** Zustand store pattern established here; will be extended with room state in Epic 2
- **Observability (ADR-009):** Structured logging with structlog proves production-grade logging framework works
- **Testing (ADR-010):** E2E test pattern with Playwright validates walking skeleton; will scale to more complex flows in later stories

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Detailed-Design]

### Learnings from Previous Story (1.1)

**From Story 1.1 (Status: drafted)**

- **New Services Created:** Docker Compose environment with backend/frontend/redis services—use this environment to run all development and testing
- **Project Structure:** Monorepo established with `backend/` and `frontend/` directories; maintain this separation throughout
- **CI/CD Foundation:** GitHub Actions workflows created for linting, testing, build—leverage existing workflows in this story
- **Dockerfile Standards:** Multi-stage builds established for both backend and frontend; follow same patterns if adding new services
- **Testing Setup:** pytest and vitest infrastructure ready; write unit tests following patterns from Story 1.1

**Key Reuse Points:**

- Use existing `docker-compose.yml` from Story 1.1 (no modifications needed)
- Leverage existing linting/type-check/test workflows (Story 1.1 already set them up)
- Follow Dockerfile best practices established in Story 1.1

[Source: docs/sprint-artifacts/1-1-project-scaffolding-and-ci-cd-setup.md#Dev-Agent-Record]

### Project Structure

Expected file additions/modifications after this story:

```
backend/
├── app/
│   ├── main.py (updated: add Socket.io integration)
│   ├── socket_manager.py (NEW: Socket.io server instance)
│   ├── event_handlers.py (NEW: connect/disconnect/hello_message handlers)
│   ├── logging.py (NEW: structlog configuration)
│   └── models.py (updated: add HelloMessage, WorldMessage Pydantic models)
├── tests/
│   ├── test_socket.py (NEW: test Socket.io event handlers)
│   ├── test_logging.py (NEW: test structlog setup)
│   └── ...
├── pyproject.toml (updated: +python-socketio, +structlog)
├── Dockerfile (no changes)
└── ...

frontend/
├── src/
│   ├── components/
│   │   ├── ConnectionStatus.tsx (NEW: displays connection state)
│   │   └── ...
│   ├── services/
│   │   ├── socket.ts (NEW: Socket.io client setup)
│   │   └── ...
│   ├── store/
│   │   ├── socketStore.ts (NEW: Zustand store for WebSocket state)
│   │   └── ...
│   ├── hooks/
│   │   ├── useSocket.ts (NEW: custom hook for Socket.io integration)
│   │   └── ...
│   ├── App.tsx (updated: render ConnectionStatus, use useSocket)
│   └── ...
├── e2e/
│   ├── hello-world.spec.ts (NEW: Playwright E2E test)
│   └── ...
├── package.json (updated: +socket.io-client)
├── Dockerfile (no changes)
└── ...

docker-compose.yml (no changes from Story 1.1)
.github/workflows/test.yml (updated: add Playwright E2E tests)
```

**Citation:** [Source: docs/architecture.md#System-Architecture]

### Testing Strategy

**Unit Tests (Backend):**

- Test `HelloMessage` Pydantic model validation
- Test Socket.io event handlers in isolation (mock Socket.io server)
- Test structlog logging configuration
- Target: 80% coverage

**Unit Tests (Frontend):**

- Test `ConnectionStatus` component renders correctly
- Test Zustand store initialization and actions
- Test `useSocket` hook behavior (with mocked Socket.io)
- Target: 60% coverage

**Integration Tests:**

- Deferred; E2E test covers integration scope

**E2E Tests (Playwright):**

- Critical path: Open app → connect → send hello → receive world → display message
- Run against live docker-compose environment
- Must pass before story is considered done

**Manual Testing:**

- Developer runs `docker-compose up` and validates visually
- Inspects browser console and backend logs for expected events
- Tests on multiple browsers (Chrome, Firefox, Safari) if feasible

**CI/CD Tests:**

- Unit tests (pytest + vitest) must pass on develop branch
- E2E tests added to test workflow and must pass
- Linting/type-checking still enforced (from Story 1.1)

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Test-Strategy-Summary]

### Key Dependencies Added

| Package          | Version | Purpose                          | Why                            |
| ---------------- | ------- | -------------------------------- | ------------------------------ |
| python-socketio  | 5.10+   | Backend WebSocket server         | Core to story ACs              |
| aiofiles         | 23.2+   | Async file operations (optional) | Future use for file serving    |
| structlog        | 23.2+   | Structured JSON logging          | Production-grade observability |
| socket.io-client | 4.6+    | Frontend WebSocket client        | Core to story ACs              |

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Dependencies-and-Integrations]

### Risks & Mitigations

| Risk                                           | Mitigation                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| CORS issues blocking WebSocket                 | Configure Socket.io CORS explicitly for `http://localhost:3000`; document in README |
| Socket.io version mismatch (client/server)     | Pin both to same major version in dependencies; test compatibility before merging   |
| Structlog config conflicts                     | Create isolated logging config file; avoid global state                             |
| Browser WebSocket not supported (old browsers) | E2E tests validate modern browsers; add fallback warning if needed in Epic 2        |
| Port 8000 already in use                       | Provide `.env` template for custom port; document in CONTRIBUTING.md                |

### Architectural Decisions

This story follows **ADR-002 (WebSocket Architecture Pattern)** and **ADR-006 (Frontend State Management)**:

- **ADR-002:** Use Socket.io with native room concept ✅ (implemented here; will scale in Epic 2)
- **ADR-006:** Zustand for global state management ✅ (implemented here; proven pattern)

---

## References

- **Epic Tech Spec:** [Source: docs/sprint-artifacts/tech-spec-epic-1.md]
- **PRD - Architecture Pattern:** [Source: docs/PRD.md#Architecture-Pattern]
- **PRD - API Specification:** [Source: docs/PRD.md#API-Specification]
- **Architecture - WebSocket Architecture:** [Source: docs/architecture.md#System-Architecture]
- **Architecture - Frontend Stack:** [Source: docs/architecture.md#Technology-Stack]
- **ADR-002 (WebSocket):** [Source: docs/architecture.md#Architectural-Decisions]
- **ADR-006 (Frontend State):** [Source: docs/architecture.md#Architectural-Decisions]
- **ADR-009 (Observability):** [Source: docs/architecture.md#Architectural-Decisions]

---

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/1-2-hello-world-websocket-connection.context.xml

### Agent Model Used

Claude 3 (Latest)

### Completion Notes List

_To be filled by dev agent upon completion_

- Socket.io integration patterns established for reuse in room management (Epic 2)
- Zustand store architecture proven; ready for extension to room state
- Structlog logging enables visibility into all future WebSocket events
- E2E test pattern (Playwright + docker-compose) can scale to complex flows

### Debug Log References

_To be filled by dev agent if issues encountered_

### File List

**NEW FILES (created)**

- `backend/app/socket_manager.py` (Socket.io server instance)
- `backend/app/event_handlers.py` (connect/disconnect/hello_message handlers)
- `backend/app/logging.py` (structlog configuration)
- `backend/app/models.py` (Pydantic models: HelloMessage, WorldMessage)
- `backend/tests/test_socket.py` (Socket.io event handler tests)
- `backend/tests/test_logging.py` (structlog config tests)
- `frontend/src/services/socket.ts` (Socket.io client utility)
- `frontend/src/store/socketStore.ts` (Zustand store for WebSocket state)
- `frontend/src/hooks/useSocket.ts` (custom hook for Socket.io)
- `frontend/src/components/ConnectionStatus.tsx` (connection state display)
- `frontend/e2e/hello-world.spec.ts` (Playwright E2E test)

**MODIFIED FILES**

- `backend/main.py` (add Socket.io integration)
- `backend/pyproject.toml` (add python-socketio, structlog dependencies)
- `frontend/src/App.tsx` (render ConnectionStatus, use useSocket)
- `frontend/package.json` (add socket.io-client dependency)
- `.github/workflows/test.yml` (add Playwright E2E test execution)

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

**Version 1.0 - 2025-11-16**

- Initial story creation from Epic 1 tech spec
- 11 tasks defined covering Socket.io setup, event handlers, frontend integration, E2E testing
- 10 acceptance criteria mapped to tech spec
- Learnings from Story 1.1 incorporated
- Risk mitigations and architectural alignment documented
