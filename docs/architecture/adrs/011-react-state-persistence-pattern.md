# ADR-011: React State Persistence Across Navigation

**Status:** Approved
**Date:** 2025-11-23
**Verification Date:** 2025-11-23
**Decision Maker:** Development Team

## Context

During Epic 2 implementation (Stories 2.1-2.3), E2E tests revealed that player identity (currentPlayerId, currentPlayerName) was being lost when users navigated between routes (e.g., Home → Room View). This broke core functionality as players appeared as "Unknown" in roll history and player lists.

**Root Cause:** The useSocket hook's cleanup function called `reset()` which cleared ALL Zustand store state. React's useEffect cleanup runs on EVERY dependency change, not just component unmount. Since `navigate` was in the dependencies array, any navigation triggered the cleanup → reset → state loss.

**Impact:**

- 5 E2E tests failing
- Player names showing as "Unknown"
- Player lists empty after navigation
- Critical user experience broken

## Decision

**Remove `reset()` call from useSocket cleanup function.** State should only be reset on explicit user actions (logout, leaving room), NOT on React lifecycle events.

### Implementation

```typescript
// useSocket.ts cleanup function - BEFORE
return () => {
  socket.off('connect', onConnect);
  // ... other cleanup
  reset(); // ❌ WRONG - clears state on navigation
};

// useSocket.ts cleanup function - AFTER
return () => {
  socket.off('connect', onConnect);
  // ... other cleanup

  // DO NOT call reset() here!
  // This cleanup runs when dependencies change (like navigate reference),
  // NOT just on actual component unmount. Calling reset() here clears
  // player identity when navigating between routes, breaking the user experience.
  // State should only be reset on explicit user actions (leaving room, logout).
};
```

## Pattern Established

**React useEffect Cleanup Timing Rule:**

- Cleanup functions run on EVERY dependency change, not just unmount
- Never put state resets in cleanup unless certain of component unmount
- Prefer explicit state management actions over lifecycle-based resets

**State Persistence Rule:**

- User identity (player name, player ID) must persist across navigation
- State resets only on explicit user actions
- Document in code WHY reset is not called (prevent future regressions)

## Rationale

1. **User Experience:** Players expect their identity to persist during session
2. **React Lifecycle:** useEffect cleanup !== componentWillUnmount when dependencies change
3. **Explicit Over Implicit:** State changes should be intentional, not side effects
4. **Future-Proofing:** Inline documentation prevents regression

## Consequences

### Positive

- ✅ Player identity persists across navigation
- ✅ 5 E2E tests fixed (9 failing → 4 failing)
- ✅ User experience preserved
- ✅ Clear pattern for future state management

### Negative

- ⚠️ State cleanup must be handled explicitly (e.g., "Leave Room" button)
- ⚠️ Developers must understand React cleanup timing

### Mitigations

- Documented pattern in code comments
- Added to coding standards
- E2E tests validate behavior

## Verification

**Test Coverage:**

- `e2e/dice-roll.spec.ts` - Validates player name in rolls after navigation
- `e2e/join-room.spec.ts` - Validates player appears in list after join
- `e2e/simple-roll-test.spec.ts` - Validates basic roll flow with navigation

**Results:** All tests passing (18/18 - 100%)

## Related Decisions

- ADR-006: Frontend State Management (Zustand choice)
- ADR-002: WebSocket Architecture (useSocket hook pattern)

## First Story Using This Pattern

Epic 2, Stories 2.1-2.3: Room creation, joining, and dice rolling with persistent player identity.
