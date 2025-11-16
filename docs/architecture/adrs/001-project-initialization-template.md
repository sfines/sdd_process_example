# ADR-001: Project Initialization via Full-Stack Template

**Status:** Approved
**Date:** 2025-11-15
**Decision Maker:** Steve

## Context

Starting from scratch would require weeks of boilerplate setup (Docker, CI/CD, testing frameworks, project structure). Modern starter templates solve 80% of common architectural decisions.

## Decision

Use `fastapi/full-stack-fastapi-template` as the foundation.

**Command:**

```bash
pipx run copier copy https://github.com/fastapi/full-stack-fastapi-template dnd-dice-roller --trust
```

## What This Provides

- ✅ FastAPI backend with proper structure
- ✅ React + TypeScript + Vite frontend
- ✅ PostgreSQL integration (we'll adapt)
- ✅ Docker Compose dev environment
- ✅ GitHub Actions CI/CD
- ✅ Pytest backend testing
- ✅ Playwright E2E testing
- ✅ Pre-commit hooks
- ✅ SQLModel ORM

## Required Modifications

1. Remove authentication system (users, JWT, email)
2. Replace PostgreSQL with SQLite for permalinks
3. Add Valkey for room state
4. Add python-socketio backend
5. Add socket.io-client frontend
6. Replace Chakra UI with Tailwind CSS
7. Add Zustand for state management

## Rationale

Template provides production-ready patterns for Docker, CI/CD, and testing. Modifications are additive (Socket.io, Valkey) or subtractive (auth), not fundamental rewrites.

## Consequences

- **Positive:** Production-ready baseline, proven patterns
- **Positive:** Saves 2-3 weeks of infrastructure setup
- **Negative:** Need to remove unused auth components
- **Neutral:** Some opinionated choices (acceptable trade-off)

## First Story

Week 1, Story 1: Initialize project from template and verify baseline builds
