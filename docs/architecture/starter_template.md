## fastapi/full-stack-fastapi-template — summary of what it provides

This document lists what the `fastapi/full-stack-fastapi-template` starter gives you out of the box, and the key versions and ranges the template declares (as of the template release documented in the template repo).

### What the starter provides

- Backend: FastAPI application scaffold with JWT auth and secure password hashing, SQLModel ORM, Alembic migrations, email templates, OpenAPI docs, health checks, and a test setup (Pytest).
- Frontend: React + TypeScript scaffold with Vite, Chakra UI, TanStack Query, TanStack Router, and an automatic OpenAPI-generated client; preview and build scripts ready.
- End-to-end tests: Playwright configured for E2E tests against the running stack.
- Dev tooling: Docker Compose for local development, Traefik reverse proxy (with TLS/autocert configuration), adminer for DB browsing, preconfigured GitHub Actions CI workflows.
- Project scaffolding: `copier` integration for generating starter projects and a set of convenience scripts for development and client generation.

### Concrete functionality included

- User management endpoints and admin dashboard examples (create user, login, admin views).
- JWT based authentication and password recovery via email.
- Database models using SQLModel with example models; migrations via Alembic.
- API client generation for the frontend from the backend OpenAPI schema.
- Traefik setup for HTTPS and routing; production-friendly Docker Compose examples.

### Key software versions & pinned ranges (examples from template files)

- Template releases: the template tags/releases include `0.8.0` (refer to the repo for latest release).
- Python: `>=3.10, <4.0`.
- FastAPI: `fastapi[standard] >= 0.114.2, < 1.0.0`.
- SQLModel: `>=0.0.21, <1.0.0`.
- Pydantic: `>2.0` (check for minor version compatibility when you upgrade).
- Alembic: `>=1.12.1, <2.0.0`.
- bcrypt pinned: `==4.3.0` (note: pinned to avoid passlib compatibility issues).
- Node: `.nvmrc` points to Node 24.
- React: `^19.1.1`; TypeScript: `^5.2.2`; Vite: `^7.1.11`.
- Playwright: `1.56.1` for E2E tests.
- Postgres Docker image: `postgres:17`.
- Traefik: `traefik:3.0`.

### How to reference the template in architecture decisions

- Record the template version used (e.g., `0.8.0` or the commit SHA) in the architecture decision that references the starter template.
- Mark decisions the starter provides as `PROVIDED_BY_STARTER` when you want to preserve notion of origin. Typical provided decisions: auth scaffolding, ORM and DB migrations, openapi client generation, CI pipeline scaffolding, standard dev tooling (Docker Compose and Traefik).

### Repro tips for the template

- Recommended clone command: `git clone https://github.com/fastapi/full-stack-fastapi-template.git --branch 0.8.0` (or use `copier` as `copier copy https://github.com/fastapi/full-stack-fastapi-template my-project --trust`).
- Validate versions and update the Architecture document with verification dates for the template and any critical pinned third-party packages.
- If you intend to use a different frontend stack (e.g., Tailwind + Headless UI), document replacement and the list of files that require changes.

---

If you want I can add this file as a referenced ADR entry or attach it the ADR that records starting from a starter template. I can also add a short snippet to mark which project files and scaffolding are provided by the template (`PROVIDED_BY_STARTER`).
