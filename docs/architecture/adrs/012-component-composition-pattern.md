# ADR-012: Humble Components - Content Over Structure

**Status:** Approved
**Date:** 2025-11-23
**Verification Date:** 2025-11-23
**Decision Maker:** Development Team

## Context

During Epic 2 implementation, E2E tests revealed duplicate UI elements causing Playwright strict mode violations. Investigation found that child components (PlayerList, RollHistory, DiceInput) were rendering their own containers and headings, while parent components (RoomView) ALSO wrapped them in containers with headings.

**Example of Problem:**

```tsx
// RoomView.tsx
<div className="bg-white rounded-lg shadow-sm p-6">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    Players ({players.length})
  </h2>
  <PlayerList players={players} /> {/* This also rendered a heading! */}
</div>;

// PlayerList.tsx (BEFORE)
export default function PlayerList() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {' '}
      {/* Duplicate container */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Players</h2>{' '}
      {/* Duplicate heading */}
      <ul>{/* actual list */}</ul>
    </div>
  );
}
```

**Impact:**

- 6 E2E tests failing with "strict mode violation"
- Duplicate headings: "Players" (gray-900) and "Players" (gray-800)
- Inconsistent styling between components
- Confused component responsibilities

## Decision

**Adopt "Humble Components" pattern:** Child components render ONLY content, parent components provide structure (containers, headings, layout).

### Implementation

```tsx
// PlayerList.tsx (AFTER) - Humble Component
export default function PlayerList({ players, currentPlayerId }: Props) {
  // Component renders just the list content, not the container
  // Parent component (RoomView) provides the container and heading
  return (
    <>
      {players.length === 0 ? (
        <p className="text-gray-500 text-sm">No players yet</p>
      ) : (
        <ul className="space-y-2" role="list">
          {players.map((player) => (
            <li key={player.player_id}>{/* player content */}</li>
          ))}
        </ul>
      )}
    </>
  );
}

// RoomView.tsx (AFTER) - Parent Controls Structure
<div className="bg-white rounded-lg shadow-sm p-6">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    Players ({players.length})
  </h2>
  <PlayerList players={players} currentPlayerId={currentPlayerId} />
</div>;
```

## Pattern Rules

### Child Component Responsibilities (Humble Components)

- ✅ Render content only (lists, forms, data display)
- ✅ Handle internal state (if needed)
- ✅ Emit events to parent
- ❌ NO containers (divs with padding/margins/shadows)
- ❌ NO headings (h1, h2, etc.)
- ❌ NO layout control

### Parent Component Responsibilities

- ✅ Provide containers and layout
- ✅ Provide headings and labels
- ✅ Control spacing and positioning
- ✅ Coordinate multiple child components
- ✅ Manage shared state

### Benefits

1. **Reusability:** Components work in any layout context
2. **Consistency:** Styling controlled at page level
3. **Simplicity:** Clear separation of concerns
4. **Testability:** Content logic separate from structure

## Rationale

1. **Component Composition:** Aligns with React composition model
2. **Single Responsibility:** Content components shouldn't know about layout
3. **DRY Principle:** Avoid duplicate containers and headings
4. **Maintainability:** Changes to layout don't require component updates

## Consequences

### Positive

- ✅ 6 E2E tests fixed (duplicate element errors resolved)
- ✅ Consistent styling across application
- ✅ Components more reusable
- ✅ Clearer component boundaries

### Negative

- ⚠️ Requires discipline - developers must not add containers to child components
- ⚠️ More verbose parent components (explicit structure)

### Mitigations

- Pattern documented in ADR
- Added to coding standards
- Code review checklist item
- Component tests enforce pattern

## Components Refactored

1. **PlayerList** - Removed container and heading
2. **RollHistory** - Removed container and heading
3. **DiceInput** - Removed container and heading

All now render content only, parents provide structure.

## Verification

**Test Coverage:**

- All E2E tests passing (18/18)
- No Playwright strict mode violations
- Visual consistency validated

**Code Review:**

- All components follow pattern
- No duplicate containers found
- Consistent styling throughout

## Related Decisions

- ADR-007: Styling System (Tailwind CSS utility-first)
- ADR-006: Frontend State Management (Zustand)

## Coding Standard Update

Added to `docs/standards/typescript-react-standards.md`:

- Component composition guidelines
- Humble components pattern
- Parent/child responsibility matrix

## First Story Using This Pattern

Epic 2, Stories 2.1-2.3: All UI components refactored to follow humble components pattern.
