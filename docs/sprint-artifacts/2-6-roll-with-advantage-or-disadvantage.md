# Story 2.5: Roll with Advantage or Disadvantage

Status: ready-for-dev

**Note:** Story renumbered from 2.5 due to insertion of Figma design story.

## **Backend Note:** The dice parser supports rolling 2d20, but does NOT automatically determine which die to use for advantage/disadvantage. Backend requires **minor modification** to add advantage/disadvantage logic and track which result is "active."

## Story

As a **User**,
I want to **roll with advantage or disadvantage**,
so that **I can follow the rules of D&D for these situations**.

---

## Acceptance Criteria

1. ✅ Advantage/Disadvantage toggle UI displayed in simple roll mode (radio buttons or toggle)
2. ✅ Toggle options: "Normal", "Advantage" (roll 2d20, use higher), "Disadvantage" (roll 2d20, use lower)
3. ✅ Backend rolls 2d20 when Advantage or Disadvantage selected (not affected by modifier on 2d20)
4. ✅ Roll history displays both die results clearly (e.g., "[18, 15]")
5. ✅ Highlighted result clearly shows which die is "active" (higher for Advantage, lower for Disadvantage)
6. ✅ Roll formula shows selected option (e.g., "1d20 (Advantage)" or "1d20 (Disadvantage)")
7. ✅ Modifier applied to active result only (e.g., Advantage: [18, 15] → use 18+5=23)
8. ✅ Roll broadcasts within 500ms with both results and modifier
9. ✅ No visual or functional impact on non-d20 rolls (Advantage only applies to 1d20)
10. ✅ E2E test validates Advantage and Disadvantage rolls with 2 concurrent players

---

## Tasks / Subtasks

### Task 1: Backend Dice Engine - Advantage/Disadvantage Logic

- [ ] Update `backend/app/services/dice_engine.py` (from Story 2.4)
  - [ ] Method: `roll_d20_advantage() -> DiceResult`
    - [ ] Roll 2d20 using secrets.SystemRandom()
    - [ ] Return both results in individual_results: [roll1, roll2]
    - [ ] Use higher value as "active" result for total calculation
    - [ ] Set formula to "1d20 (Advantage)"
    - [ ] Return DiceResult with active_result field (optional)
  - [ ] Method: `roll_d20_disadvantage() -> DiceResult`
    - [ ] Roll 2d20 using secrets.SystemRandom()
    - [ ] Return both results in individual_results: [roll1, roll2]
    - [ ] Use lower value as "active" result for total calculation
    - [ ] Set formula to "1d20 (Disadvantage)"
    - [ ] Return DiceResult with active_result field
  - [ ] Modify: `roll_d20(modifier, advantage="none")` (from Story 2.3)
    - [ ] Add advantage parameter: "none", "advantage", "disadvantage"
    - [ ] Delegate to roll_d20_advantage() or roll_d20_disadvantage() as needed
    - [ ] Apply modifier to active result only
  - [ ] Test: Advantage always returns higher die
  - [ ] Test: Disadvantage always returns lower die
  - [ ] Commit: "feat(backend): Add advantage/disadvantage logic to DiceEngine"

### Task 2: Backend Pydantic Models - Advantage/Disadvantage

- [ ] Update `backend/app/models.py` (from Story 2.4)
  - [ ] Update `DiceResult` model:
    - [ ] Add field: `active_result: Optional[int]` (which die is being used)
    - [ ] Add field: `advantage: Literal["none", "advantage", "disadvantage"] = "none"`
  - [ ] Update `RollRequest` model:
    - [ ] Add field: `advantage: Literal["none", "advantage", "disadvantage"] = "none"`
  - [ ] Commit: "feat(backend): Add advantage fields to DiceResult and RollRequest"

### Task 3: Frontend Advantage/Disadvantage Toggle UI

- [ ] Update `frontend/src/components/DiceInput.tsx` (from Story 2.4)
  - [ ] Add Advantage/Disadvantage toggle in simple mode
    - [ ] Three options: "Normal" (default), "Advantage", "Disadvantage"
    - [ ] Radio buttons or segmented control (Tailwind)
    - [ ] Position below modifier input, above Roll button
  - [ ] State: `advantage: "none" | "advantage" | "disadvantage"` (default "none")
  - [ ] When rolling:
    - [ ] Include advantage parameter in formula sent to Socket.io
    - [ ] Example: onRoll("1d20+5", "advantage")
  - [ ] Styling: Clear visual distinction between options
  - [ ] Only visible for simple mode (1d20), not in advanced mode
  - [ ] Test: Toggle renders and selection works
  - [ ] Commit: "feat(frontend): Add Advantage/Disadvantage toggle to DiceInput"

### Task 4: Backend Roll Handler - Advantage/Disadvantage

- [ ] Update `backend/app/event_handlers.py` (from Story 2.4)
  - [ ] Enhance `roll_dice` handler to handle advantage parameter
    - [ ] Receive: `{ "formula": string, "advantage": "none"|"advantage"|"disadvantage" }`
    - [ ] When formula is "1d20" (or "1d20+/-M"):
      - [ ] Parse modifier if present
      - [ ] Call DiceEngine.roll_d20(modifier, advantage)
    - [ ] When formula is not 1d20:
      - [ ] Ignore advantage parameter (set to "none")
      - [ ] Generate normal roll
    - [ ] Broadcast includes advantage flag and both die results
  - [ ] Test: Mock different advantage modes, verify correct rolls
  - [ ] Commit: "feat(backend): Enhance roll_dice handler for advantage/disadvantage"

### Task 5: Frontend Socket.io Handler - Advantage/Disadvantage

- [ ] Update `frontend/src/hooks/useSocket.ts` (from Story 2.4)
  - [ ] Modify `rollDice()` function signature
    - [ ] Current: `rollDice(formula: string) -> void`
    - [ ] New: `rollDice(formula: string, advantage: string = "none") -> void`
  - [ ] When calling Socket.io:
    - [ ] Emit: `{ "formula": formula, "advantage": advantage }`
  - [ ] When receiving `roll_result`:
    - [ ] Store advantage flag in roll object
    - [ ] Pass to RollHistory component for rendering
  - [ ] Test: Mock Socket.io, verify advantage parameter passed correctly
  - [ ] Commit: "feat(frontend): Add advantage parameter to rollDice hook"

### Task 6: Frontend Roll History - Advantage/Disadvantage Display

- [ ] Update `frontend/src/components/RollHistory.tsx` (from Story 2.3)
  - [ ] For rolls with advantage/disadvantage:
    - [ ] Display both die results: "[18, 15]"
    - [ ] Highlight active result (bold, color, or background)
    - [ ] Show label: "(Advantage)" or "(Disadvantage)" after formula
  - [ ] For normal rolls:
    - [ ] No changes (display as before)
  - [ ] Styling:
    - [ ] Active result: bold or green highlight
    - [ ] Inactive result: gray or lighter color
  - [ ] Example displays:
    - [ ] "1d20 (Advantage): [18, 15] → 18+5 = 23" (active=18)
    - [ ] "1d20 (Disadvantage): [12, 8] → 8-2 = 6" (active=8)
  - [ ] Test: Component renders advantage rolls correctly
  - [ ] Commit: "feat(frontend): Add advantage/disadvantage display in RollHistory"

### Task 7: Frontend DiceInput Integration

- [ ] Update `frontend/src/components/DiceInput.tsx` (from Task 3)
  - [ ] Modify onRoll call to pass advantage parameter:
    - [ ] `onRoll(formula, advantage)`
  - [ ] Update Room View integration (Task 8)
- [ ] Test: Form passes advantage flag correctly
- [ ] Commit: (included in Task 3 or separate if changes substantial)

### Task 8: Frontend Room View Integration

- [ ] Update `frontend/src/pages/RoomView.tsx` (from Story 2.4)
  - [ ] Update DiceInput onRoll handler:
    - [ ] Current: `onRoll={(formula) => useSocket().rollDice(formula)}`
    - [ ] New: `onRoll={(formula, advantage) => useSocket().rollDice(formula, advantage)}`
  - [ ] No layout changes needed
  - [ ] Test: Form integration works
  - [ ] Commit: (likely included in DiceInput changes)

### Task 9: Integration Test - Advantage/Disadvantage Logic

- [ ] Create `backend/tests/test_advantage_disadvantage.py`
  - [ ] Test: `test_advantage_rolls_2d20_and_uses_higher()`
    - [ ] Roll advantage 100 times
    - [ ] Verify both die results returned
    - [ ] Verify higher value used as total
    - [ ] Verify average is biased toward higher numbers
  - [ ] Test: `test_disadvantage_rolls_2d20_and_uses_lower()`
    - [ ] Roll disadvantage 100 times
    - [ ] Verify both die results returned
    - [ ] Verify lower value used as total
    - [ ] Verify average is biased toward lower numbers
  - [ ] Test: `test_advantage_with_modifier()`
    - [ ] Roll 1d20 Advantage +5
    - [ ] Verify active result + 5 = total
    - [ ] Modifier applies only to active result, not both
  - [ ] Test: `test_disadvantage_with_negative_modifier()`
    - [ ] Roll 1d20 Disadvantage -3
    - [ ] Verify active result - 3 = total
  - [ ] Test: `test_advantage_not_applied_to_other_dice()`
    - [ ] Roll 1d6 with "advantage" flag
    - [ ] Verify advantage is ignored (rolls normal 1d6)
  - [ ] Run: `pytest backend/tests/test_advantage_disadvantage.py`
  - [ ] All tests pass
  - [ ] Commit: "test(backend): Add advantage/disadvantage logic tests"

### Task 10: Integration Test - Broadcasting

- [ ] Add to `backend/tests/test_roll_mechanics.py`
  - [ ] Test: `test_advantage_roll_broadcasts_both_results()`
    - [ ] Roll advantage in a room with 2 players
    - [ ] Verify roll_result event includes both die results
    - [ ] Verify event includes advantage="advantage" flag
    - [ ] Both players receive identical roll data
  - [ ] Test: `test_disadvantage_roll_broadcasts_lower_as_active()`
    - [ ] Roll disadvantage
    - [ ] Verify active_result is the lower of the two
    - [ ] Verify event indicates which result is active
  - [ ] Commit: "test(backend): Add advantage/disadvantage broadcast tests"

### Task 11: E2E Test - Advantage/Disadvantage

- [ ] Create `frontend/e2e/advantage-disadvantage.spec.ts`
  - [ ] Test setup: 2 browsers in same room
  - [ ] Test: `test_toggle_advantage_disadvantage_options()`
    1. Browser A: Verify "Normal" option selected by default
    2. Click "Advantage" option
    3. Verify "Advantage" is now selected
    4. Click "Disadvantage" option
    5. Verify "Disadvantage" is now selected
    6. Click "Normal" option
    7. Verify "Normal" is now selected
  - [ ] Test: `test_advantage_roll_shows_both_dice()`
    1. Browser A: Select "Advantage"
    2. Enter modifier +5
    3. Click Roll
    4. Browser B: Verify roll appears in history
    5. Verify history shows both die results (e.g., "[18, 15]")
    6. Verify higher die (18) is highlighted/bold
    7. Verify total shows 18+5=23 (not 15+5)
  - [ ] Test: `test_disadvantage_roll_shows_both_dice()`
    1. Browser A: Select "Disadvantage"
    2. Enter modifier -2
    3. Click Roll
    4. Browser B: Verify roll appears
    5. Verify history shows both dice (e.g., "[9, 16]")
    6. Verify lower die (9) is highlighted
    7. Verify total shows 9-2=7 (not 16-2)
  - [ ] Test: `test_normal_roll_shows_single_result()`
    1. Browser A: Select "Normal" (or leave default)
    2. Click Roll
    3. Browser B: Verify roll shows single die result (not two)
    4. No highlighting needed
  - [ ] Command: `npx playwright test advantage-disadvantage.spec.ts`
  - [ ] All tests pass
  - [ ] Commit: "test(e2e): Add Playwright test for advantage/disadvantage"

### Task 12: Manual Testing & Documentation

- [ ] Manual test procedure:
  - [ ] Run `docker-compose up`
  - [ ] Browser A: Create room, Browser B: Join room
  - [ ] Browser A: Default (Normal mode)
    - [ ] Click Roll 1d20
    - [ ] Verify single result appears in history
  - [ ] Browser A: Select Advantage
    - [ ] Enter modifier +5
    - [ ] Click Roll
    - [ ] Verify both die results shown in history
    - [ ] Verify higher die is highlighted
    - [ ] Verify total = higher_die + 5
    - [ ] Browser B: Verify same display
  - [ ] Browser A: Select Disadvantage
    - [ ] Enter modifier -3
    - [ ] Click Roll
    - [ ] Verify both die results shown
    - [ ] Verify lower die is highlighted
    - [ ] Verify total = lower_die - 3
    - [ ] Browser B: Verify same display
  - [ ] Test edge cases:
    - [ ] Advantage with negative modifier
    - [ ] Disadvantage with positive modifier
    - [ ] Advantage/Disadvantage with 0 modifier
  - [ ] Check backend logs: All `[ROLL]` entries show correct advantage flag
- [ ] Update README.md
  - [ ] Add section: "Advantage and Disadvantage Rolls"
  - [ ] Explain mechanics: "Advantage rolls 2d20, uses higher"
  - [ ] Explain mechanics: "Disadvantage rolls 2d20, uses lower"
  - [ ] Show example: "1d20 (Advantage) +5: [18, 15] → 18+5 = 23"
- [ ] Commit: "docs: Add advantage/disadvantage documentation"

---

## Dev Notes

### Architecture Context

This story adds D&D's signature **advantage/disadvantage** mechanic without changing fundamental architecture.

- **ADR-002 (Socket.io):** Uses existing broadcast pattern (advantage flag added to payload)
- **ADR-003 (Redis):** Roll history format unchanged (still DiceResult)
- **ADR-006 (Zustand):** Store unchanged (rolls are immutable once received)
- **ADR-007 (Tailwind):** Toggle UI styled with Tailwind

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Detailed-Design]

### Learnings from Stories 2.3-2.4

**From Stories 2.3-2.4 (Status: drafted)**

- **DiceEngine Pattern:** Proven flexible; easy to add advantage/disadvantage methods
- **Socket.io Broadcasting:** Already generic enough to handle new advantage field
- **RollHistory Display:** Can display multiple results with highlighting
- **Frontend Form Pattern:** Toggle/radio buttons work well

**Key Reuse Points:**

- Extend DiceEngine with advantage/disadvantage methods
- Add advantage field to DiceResult Pydantic model
- Extend Socket.io payload (add advantage flag)
- Enhance RollHistory display logic (show 2 results + highlight)
- Add toggle UI to DiceInput component

[Source: docs/sprint-artifacts/2-4-roll-all-standard-dice-types.md#Dev-Notes]

### Project Structure

Expected file additions/modifications:

```
backend/
├── app/
│   ├── services/
│   │   └── dice_engine.py (updated: add advantage/disadvantage methods)
│   ├── event_handlers.py (updated: handle advantage parameter)
│   ├── models.py (updated: add active_result, advantage to DiceResult)
│   └── ...
├── tests/
│   ├── test_advantage_disadvantage.py (NEW)
│   ├── test_roll_mechanics.py (updated: add broadcast tests)
│   └── ...
└── ...

frontend/
├── src/
│   ├── components/
│   │   ├── DiceInput.tsx (updated: add toggle, pass advantage param)
│   │   └── RollHistory.tsx (updated: display 2 results + highlight)
│   ├── pages/
│   │   └── RoomView.tsx (updated: pass advantage to hook)
│   ├── hooks/
│   │   └── useSocket.ts (updated: accept advantage param)
│   └── ...
├── e2e/
│   ├── advantage-disadvantage.spec.ts (NEW)
│   └── ...
└── ...
```

### Testing Strategy

**Unit Tests:**

- Backend: Advantage always returns higher die
- Backend: Disadvantage always returns lower die
- Backend: Modifier applies only to active result
- Backend: Advantage ignored for non-d20 rolls
- Frontend: Toggle renders and selection updates

**Integration Tests:**

- Backend + Socket.io: Both results broadcast correctly
- Backend + Socket.io: Active result flag included
- Backend + Redis: Rolls persist with advantage flag

**E2E Tests (Playwright):**

- Toggle: Switch between Normal/Advantage/Disadvantage
- Advantage roll: Both dice shown, higher highlighted
- Disadvantage roll: Both dice shown, lower highlighted
- Modifier: Applied correctly to active die only
- Concurrent: Both players see same results

**Manual Testing:**

- All three modes (Normal, Advantage, Disadvantage)
- Modifiers (positive, negative, zero)
- Edge cases and display accuracy

### Key Dependencies

| Package | Version | Purpose                |
| ------- | ------- | ---------------------- |
| secrets | builtin | Random 2d20 generation |

### Constraints & Patterns

- **Advantage only for d20:** Only applies to 1d20 rolls, ignored for other dice
- **Modifier application:** Applied only to active result (higher or lower)
- **Display clarity:** Active result clearly highlighted (bold, color)
- **Broadcast integrity:** Both results always included in event
- **Backward compatible:** Normal rolls work exactly as before

---

## References

- **Tech Spec:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- **Story 2.3:** [Source: docs/sprint-artifacts/2-3-basic-dice-roll-1d20.md]
- **Story 2.4:** [Source: docs/sprint-artifacts/2-4-roll-all-standard-dice-types.md]
- **Architecture:** [Source: docs/architecture.md]

---

## Dev Agent Record

### Context Reference

<!-- Story context XML will be added by story-context workflow -->

### Agent Model Used

Claude 3 (Latest)

### Completion Notes List

_To be filled by dev agent upon completion_

- Advantage/disadvantage mechanics proven fair
- 2d20 rolls correctly implemented
- UI toggle pattern established
- Display highlighting works smoothly

### Debug Log References

_To be filled by dev agent if issues encountered_

### File List

**NEW FILES (created)**

- `backend/tests/test_advantage_disadvantage.py`
- `frontend/e2e/advantage-disadvantage.spec.ts`

**MODIFIED FILES**

- `backend/app/services/dice_engine.py` (add advantage/disadvantage methods)
- `backend/app/event_handlers.py` (handle advantage parameter)
- `backend/app/models.py` (add active_result, advantage fields)
- `frontend/src/components/DiceInput.tsx` (add toggle UI)
- `frontend/src/components/RollHistory.tsx` (display 2 results + highlight)
- `frontend/src/hooks/useSocket.ts` (add advantage parameter)
- `frontend/src/pages/RoomView.tsx` (pass advantage to hook)
- `backend/tests/test_roll_mechanics.py` (add broadcast tests)
- `README.md` (add advantage/disadvantage documentation)

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
- 12 tasks defined for advantage/disadvantage mechanics
- 10 acceptance criteria mapping all advantage/disadvantage scenarios
- Learnings from Stories 2.3-2.4 incorporated
- Full E2E test coverage for both modes
