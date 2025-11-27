# Story 2.3: Basic Dice Roll (1d20)

Status: complete
Completed: 2025-11-23

---

## Story

As a **User**,
I want to **roll a single 20-sided die with an optional modifier**,
so that **I can perform the most common action in D&D**.

---

## Acceptance Criteria

1. ✅ Modifier input field provided with +/- buttons (easily accessible on Room View)
2. ✅ "Roll 1d20" button is prominent and has clear visual states (active/inactive/loading)
3. ✅ Roll generated server-side using `secrets.SystemRandom()` for fairness
4. ✅ Roll result broadcast to all players in room within 500ms (p95)
5. ✅ Roll entry appears in shared roll history with: player name, formula (1d20±X), individual die result, total, timestamp
6. ✅ Roll history auto-scrolls smoothly to show newest roll at bottom
7. ✅ Subtle animation (flash/glow) highlights new roll for 1 second
8. ✅ Roll history entries clearly distinguishable by player (background color or avatar)
9. ✅ Multiple concurrent rolls handled correctly (no race conditions, correct order preserved)
10. ✅ E2E test validates full roll flow: input modifier → click button → result broadcasts → appears in history

---

## Tasks / Subtasks

### Task 1: Backend Dice Engine Service

- [ ] Create `backend/app/services/dice_engine.py`
  - [ ] Class: `DiceEngine` with methods for roll generation
  - [ ] Method: `roll_d20(modifier: int = 0) -> DiceResult`
    - [ ] Use `secrets.SystemRandom().randint(1, 20)` for fairness
    - [ ] Add modifier to result
    - [ ] Return `DiceResult(formula="1d20", individual_results=[roll], modifier=modifier, total=roll+modifier, timestamp=now())`
  - [ ] Method: `validate_formula(formula: str) -> bool`
    - [ ] Accept formats: "1d20", "1d20+5", "1d20-3"
    - [ ] Parse via regex: `^\d+d\d+([+-]\d+)?$`
    - [ ] Return boolean
  - [ ] Test: Direct calls return correct roll ranges
  - [ ] Commit: "feat(backend): Add DiceEngine.roll_d20() with cryptographic randomness"

### Task 2: Backend Pydantic Models for Rolls

- [ ] Update `backend/app/models.py` (from Story 2.1/2.2)
  - [ ] Add Pydantic models:

    ```python
    class DiceResult(BaseModel):
        roll_id: str  # UUID
        player_id: str
        player_name: str
        formula: str  # "1d20+5"
        individual_results: List[int]  # [18] for 1d20
        modifier: int  # 5
        total: int  # 23
        timestamp: datetime
        dc_pass: Optional[bool] = None

    class RollRequest(BaseModel):
        formula: str  # "1d20+5"
        advantage: Literal["none", "advantage", "disadvantage"] = "none"

    class RollResponse(BaseModel):
        roll: DiceResult
    ```

  - [ ] Commit: "feat(backend): Add DiceResult and RollRequest Pydantic models"

### Task 3: Backend Socket.io Roll Event Handler

- [ ] Add `roll_dice` event handler to `backend/app/event_handlers.py`
  - [ ] Handler signature: `@sio.event` for event `roll_dice`
  - [ ] Handler receives: `{ "formula": string, "advantage": "none"|"advantage"|"disadvantage" }`
  - [ ] Validate formula (regex check, allowed dice types)
  - [ ] Validate sender is in a room (check room membership)
  - [ ] Call `DiceEngine.roll_d20(modifier)` (or appropriate method)
  - [ ] Create `DiceResult` with player info, formula, results, timestamp
  - [ ] Append to room.roll_history in Redis (update room hash)
  - [ ] Emit `roll_result` event → broadcast to all room members
  - [ ] Log: `[ROLL] {player_name} rolled {formula} = {total} in {room_code}`
  - [ ] On error: emit `error` event with message
  - [ ] Test: Mock Redis and Socket.io, verify roll_result broadcast
  - [ ] Commit: "feat(backend): Add Socket.io roll_dice handler with broadcast"

### Task 4: Backend Roll History Persistence

- [ ] Update `backend/app/services/room_manager.py`
  - [ ] Method: `add_roll_to_history(room_code: str, roll: DiceResult) -> None`
    - [ ] Get room hash from Redis
    - [ ] Parse roll_history JSON array
    - [ ] Append new roll
    - [ ] Serialize back to JSON
    - [ ] Update room hash in Redis
    - [ ] Refresh TTL (18000s)
  - [ ] Method: `get_roll_history(room_code: str, offset: int = 0, limit: int = 100) -> List[DiceResult]`
    - [ ] Query room hash from Redis
    - [ ] Parse roll_history JSON
    - [ ] Return paginated slice (offset, limit)
  - [ ] Test: Rolls persist in Redis correctly
  - [ ] Commit: "feat(backend): Add roll history persistence methods"

### Task 5: Frontend Dice Input Component (Simple Mode)

- [ ] Create `frontend/src/components/DiceInput.tsx`
  - [ ] Props: `onRoll: (formula: string) => void`, `isLoading: boolean`
  - [ ] Render:
    - [ ] Modifier input field (number input, range -20 to +20, default 0)
    - [ ] +/- buttons next to modifier (each increments/decrements by 1)
    - [ ] "Roll 1d20" button (prominent, large)
  - [ ] State: `modifier` (number)
  - [ ] Button click → validate → call `onRoll("1d20+" + modifier)` (or "1d20" if modifier=0)
  - [ ] Styling: Tailwind, button prominent (large, distinct color), clear input styling
  - [ ] Test: Component renders and button click works
  - [ ] Commit: "feat(frontend): Add DiceInput component with modifier controls"

### Task 6: Frontend Roll History Component

- [ ] Create `frontend/src/components/RollHistory.tsx`
  - [ ] Props: `rolls: DiceResult[]`
  - [ ] Render: List of roll entries
  - [ ] For each roll:
    - [ ] Player name (color-coded or with avatar)
    - [ ] Formula (e.g., "1d20+5")
    - [ ] Individual results (e.g., "[18]" for 1d20)
    - [ ] Total (large/prominent, e.g., "23")
    - [ ] Timestamp (relative format, e.g., "2s ago")
  - [ ] Styling: Tailwind, each entry has distinct background or border
  - [ ] Virtual scrolling for 500+ rolls (use @tanstack/react-virtual from Story 2.2)
  - [ ] Test: Component renders rolls correctly
  - [ ] Commit: "feat(frontend): Add RollHistory component with virtual scrolling"

### Task 7: Frontend Roll Animation & Auto-Scroll

- [ ] Enhance `RollHistory` component with animation
  - [ ] When new roll added:
    - [ ] Highlight entry with animation (CSS animation: 1s flash/glow)
    - [ ] Auto-scroll to bottom to show newest roll
  - [ ] Implementation:
    - [ ] Use `useEffect` to detect new rolls (compare length)
    - [ ] Add CSS class with animation on new entry
    - [ ] Remove class after 1s animation completes
    - [ ] Scroll to bottom using `scrollIntoView()` or virtualization API
  - [ ] CSS animation: `@keyframes` with opacity change (flash) or box-shadow (glow)
  - [ ] Test: Animation plays on new roll
  - [ ] Commit: "feat(frontend): Add roll animation and auto-scroll to bottom"

### Task 8: Frontend Socket.io Roll Handler

- [ ] Update `frontend/src/hooks/useSocket.ts` (from Story 2.2)
  - [ ] Add `rollDice()` function
    - [ ] Validate formula (client-side check)
    - [ ] Emit `roll_dice` event with formula and advantage
    - [ ] Set loading state (button disabled while waiting)
  - [ ] Listen for `roll_result` event (broadcast from server)
    - [ ] Parse roll data
    - [ ] Append to Zustand store rolls array
    - [ ] Trigger animation on new roll
  - [ ] Listen for `error` event
    - [ ] Display error toast
    - [ ] Clear loading state
  - [ ] Test: Mock Socket.io, verify event emission and listening
  - [ ] Commit: "feat(frontend): Add rollDice Socket.io handler"

### Task 9: Frontend Store Integration

- [ ] Update `frontend/src/store/socketStore.ts` (from Story 2.2)
  - [ ] Add/update fields:
    - [ ] `rollHistory: DiceResult[]` (list of rolls in current room)
    - [ ] `addRoll(roll: DiceResult)` action
    - [ ] `clearRollHistory()` action
    - [ ] `isRolling: boolean` (loading state during roll broadcast)
  - [ ] Update on `roll_result` event:
    - [ ] Call `addRoll(roll)`
    - [ ] Set `isRolling = false`
  - [ ] Commit: "feat(frontend): Add rollHistory store and actions"

### Task 10: Frontend Room View Integration

- [ ] Update `frontend/src/pages/RoomView.tsx` (from Story 2.2)
  - [ ] Import and render `DiceInput` component
    - [ ] Pass `onRoll` handler → call `useSocket().rollDice(formula)`
    - [ ] Pass `isLoading` from store
  - [ ] Import and render `RollHistory` component
    - [ ] Pass `rolls` from Zustand store
  - [ ] Layout:
    - [ ] Top: Room header with code and player list (from 2.1/2.2)
    - [ ] Middle-left: Player list
    - [ ] Main area: Roll history (scrollable)
    - [ ] Bottom: Dice input sticky (always visible)
  - [ ] Styling: Tailwind, responsive layout
  - [ ] Test: Page renders with all components
  - [ ] Commit: "feat(frontend): Integrate DiceInput and RollHistory in Room View"

### Task 11: Integration Test (Backend + Redis)

- [ ] Create `backend/tests/test_roll_mechanics.py`
  - [ ] Test: `test_roll_d20_generates_valid_result()`
    - [ ] Roll 1000 times
    - [ ] Verify all rolls between 1-20
    - [ ] Verify distribution roughly uniform
  - [ ] Test: `test_roll_with_modifier()`
    - [ ] Roll 1d20+5
    - [ ] Verify total = roll + modifier
  - [ ] Test: `test_roll_broadcasts_to_room()`
    - [ ] Mock room with 3 players
    - [ ] Roll on behalf of player 1
    - [ ] Verify roll_result event sent to all 3
  - [ ] Test: `test_roll_persists_to_history()`
    - [ ] Roll in a room
    - [ ] Query room history from Redis
    - [ ] Verify roll appears in history
  - [ ] Test: `test_roll_order_preserved()`
    - [ ] Roll 3 times sequentially
    - [ ] Verify history order matches roll order
  - [ ] Run with: `pytest backend/tests/test_roll_mechanics.py`
  - [ ] All tests pass
  - [ ] Commit: "test(backend): Add integration tests for dice rolling mechanics"

### Task 12: E2E Test (Playwright)

- [ ] Create `frontend/e2e/roll-dice.spec.ts`
  - [ ] Test setup: 2 browsers, both in same room (use Story 2.2 join flow)
  - [ ] Test: `test_single_roll_broadcasts_to_both_players()`
    1. Browser A enters modifier +5
    2. Browser A clicks Roll 1d20 button
    3. Wait for roll_result event
    4. Browser A: Verify roll appears in history with formula "1d20+5", total shown
    5. Browser B: Verify same roll appears in history with formula and total
    6. Both see player name and timestamp
  - [ ] Test: `test_roll_animation_plays()`
    1. Browser A rolls
    2. Verify new roll entry has animation class
    3. After 1s, verify animation class removed
  - [ ] Test: `test_history_auto_scrolls()`
    1. Browser A: Scroll history to top manually
    2. Browser B: Roll dice
    3. Browser A: Verify history auto-scrolls to bottom showing new roll
  - [ ] Test: `test_concurrent_rolls_preserve_order()`
    1. Browser A rolls (pause 100ms)
    2. Browser B rolls
    3. Browser A rolls again
    4. Verify history shows 3 rolls in correct order
  - [ ] Command: `npx playwright test roll-dice.spec.ts`
  - [ ] All tests pass
  - [ ] Commit: "test(e2e): Add Playwright test for dice rolling and history"

### Task 13: Manual Testing & Documentation

- [ ] Manual test procedure:
  - [ ] Run `docker-compose up`
  - [ ] Browser A: Create room (Story 2.1)
  - [ ] Browser B: Join room (Story 2.2)
  - [ ] Browser A: Enter modifier +5, click Roll 1d20
  - [ ] Verify:
    - [ ] Roll appears in history on both browsers within 500ms
    - [ ] Shows player name (A), formula "1d20+5", result [18] and total 23
    - [ ] Animation flashes/glows for ~1s
    - [ ] History auto-scrolls to show new roll
    - [ ] Browser B sees exact same roll entry
  - [ ] Browser A & B each roll 5 times, verify all appear and animate
  - [ ] Check backend logs: `[ROLL]` entries for each roll
  - [ ] Check Redis: room.roll_history grows with each roll
- [ ] Update README.md
  - [ ] Add section: "Dice Rolling Mechanics"
  - [ ] Explain roll formula, modifiers, server-side generation
  - [ ] Show example roll with animation/broadcast timing
- [ ] Commit: "docs: Add dice rolling documentation"

---

## Dev Notes

### Architecture Context

This story introduces the **dice rolling engine**, the core feature that makes the app functional. Key architectural alignments:

- **ADR-002 (Socket.io):** Broadcasting roll results to all room members with < 500ms latency
- **ADR-003 (Redis):** Persisting roll history per room; indexed by room_code
- **ADR-006 (Zustand):** Frontend roll history synchronized via Socket.io events
- **ADR-007 (Tailwind):** Roll history styling with animations
- **ADR-010 (Testing):** E2E test with 2 concurrent browsers validating multiplayer flow

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Detailed-Design]

### Learnings from Previous Stories (2.1, 2.2)

**From Story 2.2 (Status: ready-for-dev)**

- **RoomManager Pattern:** Room state persistence proven; extend with roll history methods
- **Socket.io Broadcasting:** player_joined event broadcast established; use same pattern for roll_result
- **Zustand Store:** Players array working; extend with rollHistory array
- **E2E Test Pattern:** 2-browser tests work well; reuse for roll testing
- **Animation & Scrolling:** May need virtual scrolling for large roll histories (1000+)

**Key Reuse Points:**

- Use existing RoomManager for roll history storage/retrieval
- Extend Socket.io event handlers (create_room, join_room patterns)
- Extend Zustand store (add rollHistory array and actions)
- Reuse RollHistory component pattern from Player list (virtual scrolling)
- Follow @tanstack/react-virtual from Story 2.2

[Source: docs/sprint-artifacts/2-2-join-an-existing-room.md#Dev-Notes]

### Project Structure

Expected file additions/modifications:

```
backend/
├── app/
│   ├── services/
│   │   ├── dice_engine.py (NEW: DiceEngine class)
│   │   └── room_manager.py (updated: add roll history methods)
│   ├── event_handlers.py (updated: add roll_dice handler)
│   ├── models.py (updated: add DiceResult, RollRequest, RollResponse)
│   └── ...
├── tests/
│   ├── test_roll_mechanics.py (NEW: roll generation, broadcasting, persistence)
│   └── ...
└── ...

frontend/
├── src/
│   ├── components/
│   │   ├── DiceInput.tsx (NEW: modifier input + roll button)
│   │   ├── RollHistory.tsx (NEW: virtual scrolling with animation)
│   │   └── ...
│   ├── pages/
│   │   └── RoomView.tsx (updated: integrate DiceInput and RollHistory)
│   ├── hooks/
│   │   └── useSocket.ts (updated: add rollDice handler)
│   ├── store/
│   │   └── socketStore.ts (updated: add rollHistory array)
│   └── ...
├── e2e/
│   ├── roll-dice.spec.ts (NEW: Playwright E2E test)
│   └── ...
└── ...
```

### Testing Strategy

**Unit Tests:**

- Backend: DiceEngine.roll_d20() returns correct range (1-20)
- Backend: Modifier addition works correctly
- Frontend: DiceInput component renders and accepts input
- Frontend: RollHistory component renders rolls correctly

**Integration Tests:**

- Backend + Redis: Roll persists to room history
- Backend + Redis: Roll history retrieval works with pagination
- Backend + Socket.io: Roll broadcasts to all room members
- Order preservation: Multiple rolls maintain sequence

**E2E Tests (Playwright):**

- 2-browser concurrent rolls: Both see rolls with correct details
- Animation: Flash/glow plays for 1s
- Auto-scroll: History scrolls to bottom on new roll
- Race condition: Concurrent rolls from multiple players ordered correctly

**Manual Testing:**

- Create room, join with 2 players, both roll and verify visibility

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Test-Strategy-Summary]

### Key Dependencies

| Package                 | Version | Purpose                               | Ecosystem |
| ----------------------- | ------- | ------------------------------------- | --------- |
| secrets                 | builtin | Cryptographic randomness for fairness | Python    |
| @tanstack/react-virtual | 3.0+    | Virtual scrolling for 500+ rolls      | Node.js   |
| tailwindcss             | 3.4+    | Animation and styling                 | Node.js   |

### Constraints & Patterns

- **Fairness:** Use `secrets.SystemRandom()` for all randomness; never client-side rolls
- **Performance:** Roll broadcast < 500ms p95; handle 100+ concurrent rolls per room
- **Order Preservation:** Server timestamp + sequence number prevent race conditions
- **UI Responsiveness:** Button disabled during roll broadcast; loading indicator shown
- **Animation:** Subtle 1s flash/glow; not distracting or slow

---

## References

- **Epic Tech Spec:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- **Tech Spec - Dice Roll Workflows:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Workflows-and-Sequencing]
- **Story 2.2 (Join Room):** [Source: docs/sprint-artifacts/2-2-join-an-existing-room.md]
- **Story 2.1 (Create Room):** [Source: docs/sprint-artifacts/2-1-create-a-new-room.md]
- **Architecture - ADR-002 (Socket.io):** [Source: docs/architecture.md#Architectural-Decisions]
- **Architecture - ADR-010 (Testing):** [Source: docs/architecture.md#Architectural-Decisions]

---

## Dev Agent Record

### Context Reference

<!-- Story context XML will be added by story-context workflow -->

### Agent Model Used

Claude 3 (Latest)

### Completion Notes List

_To be filled by dev agent upon completion_

- DiceEngine with cryptographic randomness proven fair
- Roll broadcasting patterns established for reuse in advantage/disadvantage (Story 2.5)
- RollHistory component with virtual scrolling foundation for 1000+ roll scaling
- E2E test pattern with animations validated

### Debug Log References

_To be filled by dev agent if issues encountered_

### File List

**NEW FILES (created)**

- `backend/app/services/dice_engine.py`
- `backend/tests/test_roll_mechanics.py`
- `frontend/src/components/DiceInput.tsx`
- `frontend/src/components/RollHistory.tsx`
- `frontend/e2e/roll-dice.spec.ts`

**MODIFIED FILES**

- `backend/app/services/room_manager.py` (add roll history methods)
- `backend/app/event_handlers.py` (add roll_dice handler)
- `backend/app/models.py` (add DiceResult, RollRequest, RollResponse)
- `frontend/src/pages/RoomView.tsx` (integrate DiceInput, RollHistory)
- `frontend/src/hooks/useSocket.ts` (add rollDice handler)
- `frontend/src/store/socketStore.ts` (add rollHistory)
- `README.md` (add dice rolling documentation)

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
- 13 tasks defined covering dice engine, Socket.io broadcasting, frontend components, E2E testing
- 10 acceptance criteria mapped to tech spec
- Learnings from Stories 2.1 and 2.2 incorporated
- Performance targets (&lt;500ms broadcast, smooth animation) documented
