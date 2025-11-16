# ADR-010: Testing Strategy

**Status:** Approved
**Date:** 2025-11-15
**Decision Maker:** Steve

## Context

Real-time multiplayer requires confidence in core flows. Need to balance test coverage with development velocity.

## Decision

TDD for walking skeleton (Week 1), comprehensive coverage for core features, E2E tests for critical paths.

## Testing Pyramid

```
         /\
        /  \    E2E Tests (Playwright)
       /----\   - Create room flow
      /      \  - Join room flow
     /--------\ - Roll dice flow
    /          \ Integration Tests (Pytest + WebSocket)
   /------------\ - Room lifecycle
  /              \ - Roll generation & broadcast
 /----------------\ - Player management
/------------------\ Unit Tests (Pytest + Vitest)
- Dice rolling logic
- Room state management
- Validation functions
- UI components
```

## Coverage Targets

- **Backend Unit Tests:** 80% coverage (core logic)
- **Backend Integration Tests:** Critical Socket.io flows
- **Frontend Unit Tests:** 60% coverage (components)
- **E2E Tests:** Walking skeleton + 3 critical paths

## Test Execution

- **Local:** `make test` (runs all tests)
- **CI:** Automated on every push to develop
- **Pre-commit:** Linting + type checking only (fast)

## Critical E2E Test Paths

1. **Walking Skeleton** (Week 1)
   - Create room → Join room → Roll dice → View result

2. **DM Features** (Week 6)
   - Create DM-led room → Hidden roll → Reveal → Set DC → DC check

3. **Room Promotion** (Week 6)
   - Create Open room → Multiple rolls → Promote to DM-led → Verify history marker

4. **Reconnection** (Week 7)
   - Join room → Disconnect network → Reconnect → Verify state restored

## Consequences

- **Positive:** TDD in Week 1 ensures solid foundation
- **Positive:** High confidence in multiplayer synchronization
- **Negative:** Slower initial development (acceptable: prevents late bugs)
- **Positive:** E2E tests from Day 1 catch integration issues early
- **Positive:** 80% backend coverage prevents security issues
