# Epic Technical Specification: Initial Product Skeleton

Date: 2025-11-16
Author: Steve
Epic ID: 1
Status: Draft

---

## Overview

Epic 1 establishes the foundational infrastructure for the D&D Dice Roller application. This epic creates a complete monorepo structure with CI/CD automation and validates end-to-end real-time communication through a WebSocket "Hello World" flow. While non-functional in terms of user-facing features, this epic is critical—it enables all subsequent development by proving the core technology stack is viable and providing developers with a robust, production-grade development environment.

The epic encompasses two stories: (1) Project scaffolding with linting, testing, and containerization, and (2) WebSocket connectivity proof via Socket.io with a basic message exchange between frontend and backend.

## Objectives and Scope

### In-Scope

- **Project structure:** Monorepo with `backend/` (Python + FastAPI) and `frontend/` (TypeScript + React) directories
- **CI/CD pipeline:** GitHub Actions workflows for linting (ruff, eslint), type-checking (mypy, tsc), testing (pytest, vitest), and Docker image builds/pushes to GHCR on merge to `main`
- **Containerization:** Multi-stage Dockerfiles for backend (Python 3.11-slim) and frontend (Node 20 + Nginx), plus docker-compose for local development with Redis service
- **WebSocket foundation:** python-socketio on backend, socket.io-client on frontend, basic connect/disconnect/message event handling
- **Development environment:** Docker Compose setup for `backend`, `frontend`, and `redis` services, ensuring consistency across team
- **Logging:** Structured logging infrastructure on both backend and frontend for observability

### Out-of-Scope

- Authentication/authorization (removed from template)
- Room management logic (covered in Epic 2)
- Dice rolling engine (covered in Epic 2)
- User-facing UI beyond "Hello World" status display (covered in Epic 2+)
- Permalink storage (covered in Epic 4)
- DM features (covered in Epic 3)

## System Architecture Alignment

This epic aligns with the **full-stack FastAPI template** (ADR-001) as the foundation. Key architectural decisions enabled:

- **Technology Stack (ADR-007, ADR-008):** Confirms Python 3.11 + FastAPI + Vite + React + Tailwind setup
- **WebSocket Architecture (ADR-002):** Establishes Socket.io server foundation (will expand room/event management in Epic 2)
- **State Storage (ADR-003):** Validates Valkey (Redis) connectivity; will store room state in Epic 2+
- **Deployment & CI/CD (ADR-008):** Implements GitHub Actions pipelines and GHCR push; VPS deployment deferred to Week 10
- **Observability (ADR-009):** Implements structured logging; Sentry integration deferred to Week 8
- **Testing Strategy (ADR-010):** Establishes TDD patterns and test infrastructure

This epic is the "walking skeleton"—a thin vertical slice through all layers proving the tech stack works end-to-end.

---

## Detailed Design

### Services and Modules

| Module                     | Responsibility                                                     | Inputs                    | Outputs                    | Owner    |
| -------------------------- | ------------------------------------------------------------------ | ------------------------- | -------------------------- | -------- |
| **FastAPI Backend**        | REST API, WebSocket server (Socket.io), request routing            | HTTP/WebSocket requests   | JSON responses, events     | Backend  |
| **React SPA Frontend**     | UI rendering, WebSocket client, user interactions                  | Browser, WebSocket events | DOM updates, WebSocket msg | Frontend |
| **Valkey (Redis)**         | In-memory state store for room data and sessions                   | Commands from backend     | Persisted state            | Infra    |
| **GitHub Actions**         | Linting, testing, Docker build, image push to GHCR                 | Code commits              | Test reports, Docker image | Infra    |
| **Nginx (docker-compose)** | Reverse proxy for frontend, SSL termination (dev uses self-signed) | HTTP/WebSocket requests   | Proxied requests           | Infra    |

### Data Models and Contracts

#### Backend Socket.io Models

**ConnectData** (emitted by client on connect)

```python
class ConnectData(BaseModel):
    pass  # Socket.io auto-handles connection
```

**HelloMessage** (client → server)

```python
class HelloMessage(BaseModel):
    message: str = "Hello from client!"
```

**WorldMessage** (server → client)

```python
class WorldMessage(BaseModel):
    message: str = "World from server!"
```

#### Session/Connection Context

No persistent database models in this epic. Session state is ephemeral; disconnection cleans up automatically.

### APIs and Interfaces

#### WebSocket Events (Socket.io)

**Client → Server**

| Event           | Payload                             | Handler       | Response             |
| --------------- | ----------------------------------- | ------------- | -------------------- |
| `connect`       | (automatic)                         | On connect    | Log connection       |
| `disconnect`    | (automatic)                         | On disconnect | Log disconnect       |
| `hello_message` | `{"message": "Hello from client!"}` | hello_handler | Emit `world_message` |

**Server → Client**

| Event           | Payload                             | Broadcast | Receiver       |
| --------------- | ----------------------------------- | --------- | -------------- |
| `world_message` | `{"message": "World from server!"}` | Unicast   | Sending client |

#### REST API Endpoints

| Method | Path          | Purpose              | Response             |
| ------ | ------------- | -------------------- | -------------------- |
| GET    | `/`           | Serve frontend (SPA) | HTML + JS/CSS bundle |
| GET    | `/api/health` | Health check         | `{"status": "ok"}`   |

### Workflows and Sequencing

**Happy Path: WebSocket Connection & Message Exchange**

```
1. User opens web app in browser
   → Browser loads React SPA from Nginx
   → Vite dev server or bundled assets served

2. React app initializes
   → Zustand store created
   → Socket.io client instantiated, configured for backend URL

3. Client connects to WebSocket
   → socket.io-client sends connect frame
   → Backend Socket.io handler receives connect event
   → Backend logs: "[CONNECT] Client {session_id} connected"
   → Frontend logs: "WebSocket connected"

4. Client sends hello_message
   → Frontend emits event: socket.emit("hello_message", {message: "Hello from client!"})
   → Backend receives hello_message event
   → Backend logs: "[MESSAGE] Received hello_message from {session_id}"

5. Backend sends world_message
   → Backend emits to client: socket.emit("world_message", {message: "World from server!"})
   → Frontend receives world_message event
   → Frontend logs message and updates DOM to display: "Connection established: World from server!"

6. User sees success state
   → Page displays: ✅ "Connection established: World from server!"
```

**Disconnection**

```
1. User closes browser tab OR network drops
   → Socket.io client detects disconnect
   → Backend receives disconnect event
   → Backend logs: "[DISCONNECT] Client {session_id} disconnected"
   → Session cleaned up (no persistent state yet)
```

---

## Non-Functional Requirements

### Performance

- **WebSocket connection time:** < 500ms from page load to first `connect` event
- **Message latency:** < 100ms round-trip (hello → world)
- **Frontend load time:** < 2s on 3G connection (Lighthouse target)
- **Bundle size:** < 500KB gzipped (React + Socket.io + Zustand + Tailwind + app code combined)

### Security

- **HTTPS enforcement:** Nginx enforces HTTPS in production (self-signed cert for dev)
- **WSS (Secure WebSocket):** All WebSocket traffic over WSS in production
- **Input validation:** Backend validates all incoming Socket.io payloads via Pydantic models
- **No auth in Epic 1:** Authentication deferred; unauthenticated WebSocket is sufficient for proof-of-concept
- **CORS:** Configured for local dev (backend/frontend on different ports); Nginx proxy handles in production

### Reliability/Availability

- **Graceful shutdown:** Backend stops accepting new connections, existing connections drain within 30s
- **Container restart policy:** `restart: unless-stopped` in docker-compose
- **Error handling:** Backend catches exceptions in event handlers, logs, and notifies client via error event
- **Fallback:** If WebSocket fails (browser doesn't support, network blocks), frontend should display clear error message (not yet built, Epic 2)

### Observability

- **Backend logging:** Structured JSON logs using `structlog` for all connection events, message events, errors
- **Frontend logging:** Console logs for development; Sentry integration deferred to Week 8
- **Required signals:**
  - Backend: `[CONNECT]`, `[DISCONNECT]`, `[MESSAGE]`, `[ERROR]` with timestamps and session IDs
  - Frontend: WebSocket state (connected/disconnected), message sent/received counts

---

## Dependencies and Integrations

### Backend Dependencies

| Package         | Version | Purpose                              |
| --------------- | ------- | ------------------------------------ |
| fastapi         | 0.104+  | REST framework + WebSocket           |
| python-socketio | 5.10+   | Socket.io server                     |
| uvicorn         | 0.24+   | ASGI server                          |
| pydantic        | 2.5+    | Data validation                      |
| structlog       | 23.2+   | Structured logging                   |
| pytest          | 7.4+    | Testing framework                    |
| redis           | 5.0+    | Redis Python client (optional in E1) |

### Frontend Dependencies

| Package           | Version | Purpose             |
| ----------------- | ------- | ------------------- |
| react             | 18.2+   | UI framework        |
| typescript        | 5.3+    | Type safety         |
| vite              | 5.0+    | Build tool          |
| zustand           | 4.4+    | State management    |
| socket.io-client  | 4.6+    | WebSocket client    |
| tailwind          | 3.4+    | Styling             |
| @headlessui/react | 1.7+    | Unstyled components |
| vitest            | 1.0+    | Unit testing        |
| playwright        | 1.40+   | E2E testing         |

### Infrastructure Dependencies

| Component | Technology     | Version | Purpose                       |
| --------- | -------------- | ------- | ----------------------------- |
| Docker    | Docker Engine  | 24+     | Containerization              |
| Docker    | Docker Compose | 2.23+   | Multi-container orchestration |
| Nginx     | nginx          | 1.25+   | Reverse proxy                 |
| Valkey    | Valkey         | 8.0+    | In-memory data store          |

### External Services (None in Epic 1)

---

## Acceptance Criteria (Authoritative)

**Story 1.1: Project Scaffolding and CI/CD Setup**

1. ✅ Monorepo structure exists with `backend/` and `frontend/` directories
2. ✅ Backend Dockerfile is multi-stage, uses `python:3.11-slim`, runs FastAPI
3. ✅ Frontend Dockerfile is multi-stage, uses `node:20-alpine` for build, `nginx:alpine` for serving
4. ✅ `docker-compose.yml` defines `backend`, `frontend`, and `redis` services
5. ✅ `docker-compose up` starts all services and app is accessible at `http://localhost`
6. ✅ GitHub Actions workflow runs on `develop` branch: `ruff check` (0 errors) + `mypy` (0 errors)
7. ✅ GitHub Actions workflow runs on `develop` branch: `eslint` (0 errors) + `tsc` (0 errors)
8. ✅ GitHub Actions workflow runs on `develop` branch: `pytest` (all pass) + `vitest` (all pass)
9. ✅ Merge to `main` triggers Docker build and push to GHCR for both `backend` and `frontend` images
10. ✅ Linting and type-checking are strict (no warnings allowed)

**Story 1.2: "Hello World" WebSocket Connection**

1. ✅ Application runs via `docker-compose up`
2. ✅ Frontend loads at `http://localhost` and displays a status area
3. ✅ Frontend WebSocket connects to backend via Socket.io; connection successful within 500ms
4. ✅ Frontend sends `hello_message` event with payload `{"message": "Hello from client!"}`
5. ✅ Backend receives `hello_message` event and logs it
6. ✅ Backend emits `world_message` event with payload `{"message": "World from server!"}` to the client
7. ✅ Frontend receives `world_message` event and displays message: "Connection established: World from server!"
8. ✅ Both backend and frontend log connection, disconnect, and message events using structured logging
9. ✅ Graceful disconnect: if user closes browser, backend cleans up session without errors
10. ✅ All Acceptance Criteria from Story 1.1 still pass

---

## Traceability Mapping

| AC ID | Story | Spec Section(s)                    | Component(s)                 | Test Idea                                             |
| ----- | ----- | ---------------------------------- | ---------------------------- | ----------------------------------------------------- |
| 1     | 1.1   | Detailed Design → Services/Modules | Monorepo structure           | File tree inspection                                  |
| 2     | 1.1   | Detailed Design → Services/Modules | Backend Dockerfile           | Docker build test                                     |
| 3     | 1.1   | Detailed Design → Services/Modules | Frontend Dockerfile          | Docker build test                                     |
| 4     | 1.1   | Detailed Design → Services/Modules | docker-compose.yml           | `docker-compose up` test                              |
| 5     | 1.1   | Detailed Design → Services/Modules | docker-compose.yml           | `curl http://localhost` test                          |
| 6     | 1.1   | CI/CD automation (GitHub Actions)  | ruff, mypy workflows         | CI run on develop branch                              |
| 7     | 1.1   | CI/CD automation (GitHub Actions)  | eslint, tsc workflows        | CI run on develop branch                              |
| 8     | 1.1   | CI/CD automation (GitHub Actions)  | pytest, vitest workflows     | CI run on develop branch                              |
| 9     | 1.1   | CI/CD automation (GitHub Actions)  | Docker build + GHCR push     | CI run on main merge                                  |
| 10    | 1.1   | CI/CD automation (GitHub Actions)  | Strict linting/type-checking | CI failure on warnings                                |
| 11    | 1.2   | APIs/Interfaces → WebSocket Events | Socket.io connect event      | Connect within 500ms, logs recorded                   |
| 12    | 1.2   | APIs/Interfaces → WebSocket Events | hello_message event          | Client sends, backend receives and logs               |
| 13    | 1.2   | APIs/Interfaces → WebSocket Events | world_message event          | Backend sends, client receives and displays           |
| 14    | 1.2   | Workflows/Sequencing → Happy Path  | Frontend display             | Status message matches "Connection established..."    |
| 15    | 1.2   | Observability → Logging            | Structured logging (JSON)    | Logs contain `[CONNECT]`, `[MESSAGE]`, `[DISCONNECT]` |
| 16    | 1.2   | Reliability → Graceful disconnect  | Disconnect handling          | No errors on client disconnect, session cleaned up    |

---

## Risks, Assumptions, Open Questions

### Risks

1. **Docker Compose networking:** Windows Docker Desktop may have DNS/networking quirks; mitigate with explicit hostname mapping (`backend` service resolvable as `backend:8000` from frontend)
2. **CI/CD complexity:** GitHub Actions secrets and GHCR auth setup; mitigate with clear setup docs in README
3. **Port conflicts:** Developers may have existing services on 3000 (frontend), 8000 (backend), 6379 (Redis); mitigate with docker-compose override file option
4. **Socket.io client/server version mismatch:** Ensure client and server use compatible Socket.io versions; test with exact versions pinned

### Assumptions

1. **Developers have Docker & Docker Compose installed** and working
2. **GitHub repository is public or has CI/CD enabled** (assume yes)
3. **Python 3.11+ and Node.js 20+ available in CI/CD runners** (GitHub-hosted runners include both)
4. **WebSocket not blocked by firewall** (typical for localhost dev, test in CI)

### Open Questions

1. **Valkey version:** Should we pin to latest (8.0+) or use Redis 7.x for broader compatibility? → Recommend Valkey 8.0+
2. **Frontend state management scope:** Zustand will be initialized; what's the minimal state tree? → Just WebSocket connection state in E1; expand in E2
3. **Error event handling:** How should frontend handle Socket.io errors? → Log to console and display error banner (implement in E2 if needed)
4. **Test coverage target for E1:** Should we aim for 80% now or ramp up in E2? → Aim for 80% on backend (critical paths), 60% on frontend (lower priority in E1)

---

## Test Strategy Summary

### Unit Tests (Backend)

- **Scope:** FastAPI route handlers, WebSocket event handlers, data models
- **Framework:** pytest
- **Coverage target:** 80%
- **Key tests:**
  - Test that `/` route returns HTML (or 200 OK)
  - Test that `/api/health` returns `{"status": "ok"}`
  - Test Socket.io `hello_message` handler receives and responds correctly
  - Test Pydantic models validate input correctly

### Unit Tests (Frontend)

- **Scope:** React components, Zustand store, Socket.io client initialization
- **Framework:** Vitest + React Testing Library
- **Coverage target:** 60%
- **Key tests:**
  - App component renders without errors
  - Zustand store initializes with correct initial state
  - Socket.io client emits events without errors
  - Message received updates DOM correctly

### Integration Tests

- **Scope:** Backend + Socket.io + Frontend (via Playwright)
- **Framework:** Playwright (E2E)
- **Test:**
  1. Start docker-compose environment
  2. Open frontend at `http://localhost`
  3. Wait for WebSocket connect
  4. Send hello_message
  5. Assert world_message received
  6. Assert DOM displays success message

### CI/CD Tests

- **Linting:** ruff (backend) + eslint (frontend) must pass with 0 errors
- **Type-checking:** mypy (backend) + tsc (frontend) must pass with 0 errors
- **Unit tests:** pytest (backend) + vitest (frontend) must pass
- **Docker build:** Both images build successfully
- **Image push:** GHCR push succeeds (on main merge only)

### Manual Testing Checklist

- [ ] `docker-compose up` starts without errors
- [ ] Frontend loads at `http://localhost`
- [ ] Browser console shows no errors
- [ ] Backend logs connection events
- [ ] WebSocket connects within 500ms
- [ ] Hello/World message exchange works
- [ ] Disconnect/reconnect works smoothly
- [ ] Page is responsive on mobile (320px+)

---

## Implementation Notes for Developers

### Story 1.1 Checklist

- [ ] Initialize project from `fastapi/full-stack-fastapi-template` (pinned version in ADR-001)
- [ ] Remove authentication system (user, OAuth, registration routes)
- [ ] Create monorepo structure: `backend/` and `frontend/` if not already present
- [ ] Backend Dockerfile: multi-stage, Python 3.11-slim, pip install + uvicorn
- [ ] Frontend Dockerfile: multi-stage, Node 20-alpine build, nginx:alpine serve
- [ ] docker-compose.yml: backend, frontend, redis services with proper networking
- [ ] GitHub Actions workflows in `.github/workflows/`:
  - `lint.yml`: ruff + eslint on every push to `develop`
  - `type-check.yml`: mypy + tsc on every push to `develop`
  - `test.yml`: pytest + vitest on every push to `develop`
  - `build.yml`: Docker build + GHCR push on merge to `main`
- [ ] README with setup instructions: how to `docker-compose up`
- [ ] Commit message: "feat(epic1): Project scaffolding and CI/CD pipeline"

### Story 1.2 Checklist

- [ ] Backend: Install python-socketio + aiofiles
- [ ] Backend: Create Socket.io server instance in FastAPI app
- [ ] Backend: Add event handlers for `connect`, `disconnect`, `hello_message`
- [ ] Backend: Log all events with structlog in JSON format
- [ ] Frontend: Install socket.io-client
- [ ] Frontend: Zustand store for WebSocket connection state
- [ ] Frontend: Socket.io client initialization in useEffect
- [ ] Frontend: Display "Connection established: World from server!" on success
- [ ] Frontend: Log WebSocket events to console
- [ ] E2E test (Playwright): Full hello → world flow
- [ ] Manual test: Verify via browser dev tools
- [ ] Commit message: "feat(epic1): WebSocket Hello World connection"

---

## Success Criteria for Epic 1

✅ **Epic 1 is complete when:**

1. All 10 ACs from Story 1.1 pass (project structure, Docker, CI/CD)
2. All 10 ACs from Story 1.2 pass (WebSocket connection)
3. All GitHub Actions workflows pass on `develop` and `main`
4. `docker-compose up` brings up a fully functional environment
5. E2E test confirms WebSocket message flow works
6. Code coverage >= 80% for backend, >= 60% for frontend
7. No warnings from linters or type-checkers
8. Team confirms development environment is smooth (fast iteration loop)

---

## Appendix: Architecture Decision References

- **ADR-001:** Full-stack FastAPI template as foundation
- **ADR-002:** Socket.io for WebSocket communication
- **ADR-003:** Valkey (Redis) for ephemeral state (validated in E1, used in E2+)
- **ADR-008:** GitHub Actions + GHCR for CI/CD
- **ADR-009:** Structured JSON logging for observability
- **ADR-010:** TDD approach with 80%+ backend coverage
