# Story 1.1: Project Scaffolding and CI/CD Setup

Status: ready-for-dev

---

## Story

As a **Developer**,
I want a **complete project structure with a basic CI/CD pipeline**,
so that **I can build, test, and deploy a "Hello World" version of the application**.

---

## Acceptance Criteria

1. ✅ Monorepo structure exists with `backend/` and `frontend/` directories
2. ✅ Backend Dockerfile is multi-stage, uses `python:3.11-slim`, runs FastAPI via Uvicorn
3. ✅ Frontend Dockerfile is multi-stage, uses `node:20-alpine` for build, `nginx:alpine` for serving
4. ✅ `docker-compose.yml` defines `backend`, `frontend`, and `redis` services with proper networking
5. ✅ `docker-compose up` starts all services without errors and app is accessible at `http://localhost`
6. ✅ GitHub Actions workflow runs on `develop` branch push: `ruff check` (0 errors) + `mypy` (0 errors) for Python
7. ✅ GitHub Actions workflow runs on `develop` branch push: `eslint` (0 errors) + `tsc` (0 errors) for TypeScript
8. ✅ GitHub Actions workflow runs on `develop` branch push: `pytest` (all pass) + `vitest` (all pass) for testing
9. ✅ Merge to `main` branch triggers Docker build and push to GHCR for both `backend` and `frontend` images
10. ✅ Linting and type-checking are strict—no warnings allowed, all workflows fail on violations

---

## Tasks / Subtasks

### Task 1: Project Initialization

- [ ] Initialize project from `fastapi/full-stack-fastapi-template` (v0.104+)
  - [ ] Clone template repository (see ADR-001 for pinned version)
  - [ ] Adapt template for Socket.io (add python-socketio, aiofiles dependencies)
  - [ ] Verify baseline project structure (backend/, frontend/, docker-compose.yml)
  - [ ] Commit: "chore(init): Initialize from full-stack FastAPI template"

### Task 2: Remove Authentication System

- [ ] Remove auth routes from FastAPI backend
  - [ ] Delete `/api/login`, `/api/logout`, `/api/register` endpoints
  - [ ] Remove `User` model and database tables for users
  - [ ] Remove OAuth/JWT validation middleware
  - [ ] Keep only essential `/api/health` endpoint
  - [ ] Update tests to reflect removed endpoints
  - [ ] Commit: "refactor(auth): Remove authentication system for MVP"

### Task 3: Backend Dockerfile

- [ ] Create/update `backend/Dockerfile` as multi-stage
  - [ ] **Stage 1 (builder):** `python:3.11-slim` base, install dependencies from `pyproject.toml`
  - [ ] **Stage 2 (runtime):** `python:3.11-slim` base, copy only runtime dependencies and app code
  - [ ] Expose port 8000
  - [ ] Set entrypoint: `uvicorn main:app --host 0.0.0.0 --port 8000`
  - [ ] Test: `docker build -t backend:latest backend/` succeeds
  - [ ] Commit: "build(docker): Add multi-stage backend Dockerfile"

### Task 4: Frontend Dockerfile

- [ ] Create/update `frontend/Dockerfile` as multi-stage
  - [ ] **Stage 1 (build):** `node:20-alpine` base, run `npm install && npm run build`
  - [ ] **Stage 2 (runtime):** `nginx:alpine` base, copy built assets from stage 1 to `/usr/share/nginx/html`
  - [ ] Expose port 80
  - [ ] Test: `docker build -t frontend:latest frontend/` succeeds
  - [ ] Commit: "build(docker): Add multi-stage frontend Dockerfile"

### Task 5: Docker Compose Configuration

- [ ] Create/update `docker-compose.yml`
  - [ ] **Backend service:** Build from `backend/Dockerfile`, expose 8000, depends on redis
  - [ ] **Frontend service:** Build from `frontend/Dockerfile`, expose 80 (via Nginx or port mapping)
  - [ ] **Redis service:** Use `redis:7-alpine` image, expose 6379
  - [ ] **Networking:** All services on same Docker network (default), hostnames resolvable (`backend:8000`, `redis:6379`)
  - [ ] **Volumes:** Optional mounts for development (code reload on file change)
  - [ ] Test: `docker-compose up` brings up all services without errors
  - [ ] Test: `curl http://localhost` returns frontend HTML (or 200 response)
  - [ ] Test: Backend accessible at `http://localhost:8000` (or via reverse proxy)
  - [ ] Commit: "build(docker): Add docker-compose.yml with backend, frontend, redis"

### Task 6: GitHub Actions Linting Workflow

- [ ] Create `.github/workflows/lint.yml`
  - [ ] Trigger: Push to `develop` branch
  - [ ] **Backend linting:** `ruff check backend/ --select=E,W,F` (fail on errors/warnings)
  - [ ] **Frontend linting:** `npm run lint` or `eslint` (fail on errors)
  - [ ] Report: Display lint errors clearly in CI output
  - [ ] Commit: "ci(github-actions): Add linting workflow for develop branch"

### Task 7: GitHub Actions Type-Checking Workflow

- [ ] Create `.github/workflows/type-check.yml`
  - [ ] Trigger: Push to `develop` branch
  - [ ] **Backend type-check:** `mypy backend/ --strict` (fail on any type issues)
  - [ ] **Frontend type-check:** `tsc --noEmit` (fail on TypeScript errors)
  - [ ] Report: Display type errors clearly
  - [ ] Commit: "ci(github-actions): Add type-checking workflow for develop branch"

### Task 8: GitHub Actions Testing Workflow

- [ ] Create `.github/workflows/test.yml`
  - [ ] Trigger: Push to `develop` branch
  - [ ] **Backend unit tests:** `pytest backend/tests/` (fail if any test fails)
  - [ ] **Frontend unit tests:** `npm run test` or `vitest run` (fail if any test fails)
  - [ ] Report: Display test results summary
  - [ ] Coverage: Aim for 80% backend, 60% frontend (measure but don't fail on threshold yet)
  - [ ] Commit: "ci(github-actions): Add testing workflow for develop branch"

### Task 9: GitHub Actions Docker Build & Push Workflow

- [ ] Create `.github/workflows/build.yml`
  - [ ] Trigger: Merge to `main` branch only
  - [ ] **Setup:** Authenticate with GitHub Container Registry (GHCR) using `docker/login-action`
  - [ ] **Build backend:** `docker build -t ghcr.io/${{ github.repository }}/backend:${{ github.sha }} backend/`
  - [ ] **Push backend:** Push to GHCR
  - [ ] **Build frontend:** `docker build -t ghcr.io/${{ github.repository }}/frontend:${{ github.sha }} frontend/`
  - [ ] **Push frontend:** Push to GHCR
  - [ ] **Tag as latest:** Also tag images as `:latest`
  - [ ] Report: Display image URLs in CI output
  - [ ] Commit: "ci(github-actions): Add Docker build and GHCR push workflow"

### Task 10: Verify All Workflows Run Successfully

- [ ] Push a commit to `develop` branch
  - [ ] Verify linting workflow passes (0 lint errors)
  - [ ] Verify type-checking workflow passes (0 type errors)
  - [ ] Verify testing workflow passes (all tests pass)
- [ ] Create a Pull Request and merge to `main` branch
  - [ ] Verify build workflow triggers
  - [ ] Verify Docker images are built successfully
  - [ ] Verify images are pushed to GHCR
  - [ ] Confirm images are accessible at `ghcr.io/...`
- [ ] Commit: "chore(ci): Verify all GitHub Actions workflows pass"

### Task 11: README and Setup Documentation

- [ ] Create/update `README.md` with setup instructions
  - [ ] Prerequisites: Docker, Docker Compose
  - [ ] Quick start: `docker-compose up`
  - [ ] URL: `http://localhost` to access app
  - [ ] Development: How to run locally without Docker
  - [ ] Testing: How to run unit tests locally
  - [ ] CI/CD: Reference to GitHub Actions workflows
- [ ] Create `.github/CONTRIBUTING.md` with linting/type-check commands
- [ ] Commit: "docs(readme): Add setup and contribution guidelines"

---

## Dev Notes

### Architecture Context

This story establishes the **foundational infrastructure** for the entire application. Key architectural alignments:

- **Technology Stack (ADR-007, ADR-008):** Confirms Python 3.11 + FastAPI + Vite + React + TypeScript
- **WebSocket Foundation (ADR-002):** Dockerization enables Socket.io server to be deployed; WebSocket support deferred to Story 1.2
- **CI/CD Pipeline (ADR-008):** Implements GitHub Actions and GHCR push; VPS production deployment deferred to Week 10
- **Observability (ADR-009):** Docker logs captured; structured logging implementation in Story 1.2
- **Testing (ADR-010):** Test infrastructure established; TDD patterns to be applied in Story 1.2+

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Detailed-Design]

### Project Structure

Expected file structure after completion:

```
.
├── .github/
│   └── workflows/
│       ├── lint.yml
│       ├── type-check.yml
│       ├── test.yml
│       └── build.yml
├── backend/
│   ├── Dockerfile
│   ├── main.py (FastAPI app)
│   ├── pyproject.toml (dependencies)
│   ├── tests/
│   │   ├── test_main.py
│   │   └── test_health.py
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── src/
│   │   ├── App.tsx
│   │   └── ...
│   ├── tests/
│   │   └── App.test.tsx
│   └── ...
├── docker-compose.yml
├── README.md
└── .github/
    └── CONTRIBUTING.md
```

**Citation:** [Source: docs/architecture.md#Technology-Stack]

### Testing Strategy

**Unit Tests:**

- Backend: `pytest` with fixtures for FastAPI TestClient
- Frontend: `vitest` + React Testing Library (optional mocks for Socket.io in this story)

**Integration Tests:**

- Deferred to Story 1.2 (end-to-end WebSocket test)

**CI/CD Tests:**

- All linting/type-checking/testing must pass before merge

**Manual Testing:**

- Run `docker-compose up` locally
- Verify services start without errors
- Verify frontend loads at `http://localhost`

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Test-Strategy-Summary]

### Key Dependencies

| Package        | Version | Purpose             | Citation                                            |
| -------------- | ------- | ------------------- | --------------------------------------------------- |
| fastapi        | 0.104+  | REST API framework  | [Source: docs/architecture.md#Backend-Stack]        |
| uvicorn        | 0.24+   | ASGI server         | [Source: docs/architecture.md#Backend-Stack]        |
| pytest         | 7.4+    | Backend testing     | [Source: docs/architecture.md#Backend-Stack]        |
| react          | 18.2+   | Frontend UI         | [Source: docs/architecture.md#Frontend-Stack]       |
| typescript     | 5.3+    | Type safety         | [Source: docs/architecture.md#Frontend-Stack]       |
| vite           | 5.0+    | Frontend build tool | [Source: docs/architecture.md#Frontend-Stack]       |
| vitest         | 1.0+    | Frontend testing    | [Source: docs/architecture.md#Frontend-Stack]       |
| docker         | 24+     | Containerization    | [Source: docs/architecture.md#Infrastructure-Stack] |
| docker-compose | 2.23+   | Orchestration       | [Source: docs/architecture.md#Infrastructure-Stack] |

### Risks & Mitigations

| Risk                                             | Mitigation                                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Docker Compose networking issues on Windows      | Use explicit hostname mapping; provide `.env` file for custom ports                                         |
| CI/CD secrets (GHCR auth) not configured         | Document setup in CONTRIBUTING.md; use template GitHub repo with secrets pre-configured                     |
| Port conflicts (3000, 8000, 6379 already in use) | Provide `docker-compose.override.yml` template for custom ports                                             |
| Tight linting rules cause delays                 | Start with warnings, escalate to errors incrementally; document exceptions in `.ruff.toml`, `.eslintignore` |

---

## References

- **Epic Tech Spec:** [Source: docs/sprint-artifacts/tech-spec-epic-1.md]
- **PRD - Project Classification:** [Source: docs/PRD.md#Project-Classification]
- **Architecture - Technology Stack:** [Source: docs/architecture.md#Technology-Stack]
- **Architecture - Implementation Roadmap:** [Source: docs/architecture.md#Implementation-Roadmap]
- **ADR-001 (Template):** [Source: docs/architecture.md#Architectural-Decisions]
- **ADR-008 (CI/CD):** [Source: docs/architecture.md#Architectural-Decisions]

---

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/1-1-project-scaffolding-and-ci-cd-setup.context.xml

### Agent Model Used

Claude 3 (Latest)

### Completion Notes List

_To be filled by dev agent upon completion_

- Patterns established for Dockerfile best practices
- GitHub Actions workflow templates created for reuse in future stories
- Linting/type-checking standards enforced from Day 1

### Debug Log References

_To be filled by dev agent if issues encountered_

### File List

**NEW FILES (created)**

- `.github/workflows/lint.yml`
- `.github/workflows/type-check.yml`
- `.github/workflows/test.yml`
- `.github/workflows/build.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `README.md` (updated/created)
- `.github/CONTRIBUTING.md`

**MODIFIED FILES**

- `docker-compose.yml` (updated)
- `pyproject.toml` (dependencies added)
- `package.json` (dependencies added)
- `backend/main.py` (auth removed)
- `frontend/src/App.tsx` (simplified for init)

**DELETED FILES**

- Authentication-related backend routes (integrated into main.py)

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
- 11 tasks defined covering project setup, CI/CD, Docker, and documentation
- 10 acceptance criteria mapped to tech spec
- Risk mitigation strategies documented
