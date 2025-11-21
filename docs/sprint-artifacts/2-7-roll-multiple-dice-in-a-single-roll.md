# Story 2.7: Roll Multiple Dice in a Single Roll

Status: drafted

---

## Story

As a **User**,
I want to **roll multiple dice at once (e.g., 3d6)**,
so that **I can calculate damage or other effects efficiently**.

---

## Acceptance Criteria

1. ✅ Input parser accepts NdN format (e.g., "3d6", "8d10", "2d20", "1d100")
2. ✅ Input validation: N (count) and N (sides) are positive integers (1-100 each)
3. ✅ Parser rejects invalid formats (e.g., "3d", "d6", "0d6", "101d6")
4. ✅ Negative modifiers work with multiple dice (e.g., "3d6-2")
5. ✅ Backend rolls N dice of D sides server-side using cryptographic randomness
6. ✅ All individual die results displayed in roll history (e.g., "[4, 2, 5]")
7. ✅ Total sum displayed prominently (e.g., "Total: 11")
8. ✅ Roll formula shows in history (e.g., "3d6-2 = [4, 2, 5] → 9")
9. ✅ Advantage/disadvantage applies only to d20, not other dice (from Story 2.5)
10. ✅ E2E test validates multiple dice rolls with concurrent players

---

## Tasks / Subtasks

### Task 1: Backend Input Parser - NdN Format

- [ ] Update `backend/app/services/dice_engine.py` (from Story 2.4)
  - [ ] Method: `parse_dice_formula(formula: str) -> Dict[str, int]`
    - [ ] Regex pattern: `^(\d+)d(\d+)([\+\-]\d+)?$` (e.g., "3d6", "3d6+5", "3d6-2")
    - [ ] Extract count (first number), sides (after 'd'), modifier (optional)
    - [ ] Validate count: 1 <= count <= 100
    - [ ] Validate sides: 1 <= sides <= 100
    - [ ] Validate modifier: -100 <= modifier <= 100 (optional)
    - [ ] Return: `{ "count": 3, "sides": 6, "modifier": 0 }`
    - [ ] Raise `ValueError` for invalid format with descriptive message
  - [ ] Test: Parse valid formats (3d6, 8d10, 1d20, 2d20, 1d100)
  - [ ] Test: Parse with modifiers (3d6+5, 3d6-2)
  - [ ] Test: Reject invalid formats (3d, d6, 0d6, 101d6, 3d-6)
  - [ ] Commit: "feat(backend): Add NdN format parser to DiceEngine"

### Task 2: Backend Dice Engine - Multiple Dice Rolling

- [ ] Update `backend/app/services/dice_engine.py` (from Task 1)
  - [ ] Method: `roll_multiple_dice(count: int, sides: int, modifier: int = 0) -> DiceResult`
    - [ ] Roll `count` dice, each with `sides` sides using secrets.SystemRandom()
    - [ ] Store all individual results in `individual_results: List[int]`
    - [ ] Calculate total: sum(individual_results) + modifier
    - [ ] Set formula: "NdN" or "NdN+/-M" (e.g., "3d6", "3d6+5")
    - [ ] Return DiceResult with all individual results visible
  - [ ] Method: `roll_dice(formula: str, modifier: int = 0, advantage: str = "none") -> DiceResult`
    - [ ] Current: handles "1d20" and "1dN" only (from Stories 2.3-2.5)
    - [ ] New: parse NdN format, delegate to roll_multiple_dice()
    - [ ] Handle edge case: "1d20" with advantage still uses roll_d20_advantage()
    - [ ] Handle edge case: "Nd20" (N > 1) with advantage flag → ignore advantage
  - [ ] Test: Roll 3d6 multiple times, verify individual results
  - [ ] Test: Roll 8d10, verify sum
  - [ ] Test: Roll 3d6-2, verify modifier applies to total only
  - [ ] Test: Roll 2d20 with advantage → rolls 4 dice (2d20 + 2d20), returns highest pair
  - [ ] Commit: "feat(backend): Add multiple dice rolling to DiceEngine"

### Task 3: Backend Pydantic Models - NdN Support

- [ ] Update `backend/app/models.py` (from Story 2.5)
  - [ ] `DiceResult` model already has `individual_results: List[int]` (from Story 2.4)
  - [ ] Ensure formula field captures full "NdN" format
  - [ ] Add optional field: `dice_count: Optional[int]` (for UI to highlight)
  - [ ] Update `RollRequest` model:
    - [ ] Modify formula validation to accept NdN format
    - [ ] Example: `formula: str` with validation regex
  - [ ] Commit: "feat(backend): Extend models for NdN support"

### Task 4: Frontend Input Parser & Validation

- [ ] Update `frontend/src/components/DiceInput.tsx` (from Story 2.5)
  - [ ] Add "Advanced Mode" toggle or tab
    - [ ] Simple mode (current): "1d20" with modifier
    - [ ] Advanced mode (new): "3d6", "8d10", "2d20", etc.
  - [ ] Advanced mode input:
    - [ ] Single input field: "NdN" or "NdN+/-M"
    - [ ] Placeholder: "e.g., 3d6, 8d10+5, 2d20-3"
  - [ ] Client-side validation:
    - [ ] Regex check: `^(\d+)d(\d+)([\+\-]\d+)?$`
    - [ ] Show error if format invalid: "Invalid format. Use NdN, e.g., 3d6"
    - [ ] Disable Roll button until valid
  - [ ] Advantage/disadvantage toggle:
    - [ ] Only visible in simple mode (1d20 only)
    - [ ] Hidden in advanced mode
    - [ ] If user tries advantage with 2d20+ → show warning
  - [ ] Test: Input validation works
  - [ ] Test: Simple vs Advanced modes toggle correctly
  - [ ] Commit: "feat(frontend): Add advanced NdN input mode to DiceInput"

### Task 5: Frontend Socket.io Handler - NdN

- [ ] Update `frontend/src/hooks/useSocket.ts` (from Story 2.5)
  - [ ] Modify `rollDice()` function:
    - [ ] Current: `rollDice(formula: string, advantage?: string)`
    - [ ] No change needed - already generic
  - [ ] When receiving `roll_result`:
    - [ ] Store `individual_results` array
    - [ ] Pass to RollHistory component
  - [ ] Test: Mock Socket.io, verify individual results passed
  - [ ] Commit: (likely no changes needed; verify via test)

### Task 6: Frontend Roll History - NdN Display

- [ ] Update `frontend/src/components/RollHistory.tsx` (from Story 2.5)
  - [ ] Display multiple dice results:
    - [ ] Format: "3d6-2 = [4, 2, 5] → 9" (where total = 4+2+5-2 = 9)
    - [ ] Individual results in brackets
    - [ ] Total clearly labeled
  - [ ] For rolls with many dice (10+):
    - [ ] Show results compactly: "8d10 = [8, 7, 6, 5, 4, 3, 2, 1] → 36"
    - [ ] Scrollable if needed
  - [ ] Styling:
    - [ ] Monospace font for die results (easier to read)
    - [ ] Highlight total sum (bold or color)
  - [ ] Example displays:
    - [ ] "3d6 = [4, 2, 5] → 11"
    - [ ] "3d6-2 = [4, 2, 5] → 9"
    - [ ] "2d20 (Advantage) = [18, 15] → 18"
    - [ ] "8d10 = [8, 7, 6, 5, 4, 3, 2, 1] → 36"
  - [ ] Test: Component renders correctly for various dice counts
  - [ ] Commit: "feat(frontend): Add multiple dice display in RollHistory"

### Task 7: Frontend DiceInput Integration

- [ ] Update `frontend/src/components/DiceInput.tsx` (from Task 4)
  - [ ] Implement mode toggle:
    - [ ] State: `mode: "simple" | "advanced"`
    - [ ] Buttons/Tabs: "Simple Mode" (1d20) and "Advanced Mode" (NdN)
  - [ ] Simple mode (current):
    - [ ] Show d20 input, modifier, advantage toggle
  - [ ] Advanced mode (new):
    - [ ] Show NdN input with validation
    - [ ] Hide advantage toggle (or show disabled)
    - [ ] Show example text: "e.g., 3d6, 8d10+5"
  - [ ] onRoll callback:
    - [ ] Pass formula as-is to socket
    - [ ] Example: onRoll("3d6+5", "none")
  - [ ] Test: Mode toggle works, validation works
  - [ ] Commit: (included in Task 4)

### Task 8: Frontend Room View Integration

- [ ] Update `frontend/src/pages/RoomView.tsx` (from Story 2.5)
  - [ ] No changes needed if DiceInput handles both modes
  - [ ] Verify: DiceInput renders in room
  - [ ] Test: Can switch between simple/advanced modes
  - [ ] Commit: (likely no changes needed)

### Task 9: Backend Integration Test - NdN Parsing

- [ ] Create `backend/tests/test_multiple_dice.py`
  - [ ] Test: `test_parse_dice_formula_valid_formats()`
    - [ ] Parse "3d6" → count=3, sides=6, modifier=0
    - [ ] Parse "8d10" → count=8, sides=10, modifier=0
    - [ ] Parse "3d6+5" → count=3, sides=6, modifier=5
    - [ ] Parse "3d6-2" → count=3, sides=6, modifier=-2
    - [ ] Parse "1d100" → count=1, sides=100, modifier=0
  - [ ] Test: `test_parse_dice_formula_invalid_formats()`
    - [ ] Reject "3d" (missing sides)
    - [ ] Reject "d6" (missing count)
    - [ ] Reject "0d6" (count out of range)
    - [ ] Reject "3d0" (sides out of range)
    - [ ] Reject "101d6" (count out of range)
    - [ ] Reject "3d101" (sides out of range)
    - [ ] All raise ValueError with descriptive message
  - [ ] Test: `test_roll_multiple_dice_3d6()`
    - [ ] Roll 3d6 100 times
    - [ ] Verify individual_results has 3 items
    - [ ] Verify each result is 1-6
    - [ ] Verify total = sum(individual_results)
  - [ ] Test: `test_roll_multiple_dice_with_modifier()`
    - [ ] Roll 3d6-2
    - [ ] Verify individual results + modifier = total
  - [ ] Test: `test_roll_2d20_vs_d20_advantage()`
    - [ ] Roll "2d20" without advantage → rolls 2d20
    - [ ] Roll "1d20" with advantage → rolls 2d20, uses higher
    - [ ] Verify behavior differs
  - [ ] Run: `pytest backend/tests/test_multiple_dice.py`
  - [ ] All tests pass
  - [ ] Commit: "test(backend): Add NdN parsing and multiple dice tests"

### Task 10: Integration Test - Broadcasting

- [ ] Add to `backend/tests/test_roll_mechanics.py`
  - [ ] Test: `test_multiple_dice_roll_broadcasts_all_results()`
    - [ ] Roll 3d6 in a room with 2 players
    - [ ] Verify roll_result event includes all 3 individual results
    - [ ] Verify event includes correct total
    - [ ] Both players receive identical data
  - [ ] Test: `test_8d10_roll_broadcasts_correctly()`
    - [ ] Roll 8d10 in room
    - [ ] Verify all 8 individual results broadcast
    - [ ] Verify total matches sum
  - [ ] Commit: "test(backend): Add multiple dice broadcast tests"

### Task 11: E2E Test - Multiple Dice Rolls

- [ ] Create `frontend/e2e/multiple-dice.spec.ts`
  - [ ] Test setup: 2 browsers (A and B) in same room
  - [ ] Test: `test_simple_mode_still_works()`
    1. Browser A: Leave on Simple Mode
    2. Enter "1d20", modifier "5"
    3. Click Roll
    4. Browser B: Verify result shows single d20 + modifier
  - [ ] Test: `test_switch_to_advanced_mode()`
    1. Browser A: Click "Advanced Mode"
    2. Verify simple mode controls hidden
    3. Verify advanced mode input visible with placeholder "e.g., 3d6"
    4. Click "Simple Mode"
    5. Verify controls switch back
  - [ ] Test: `test_roll_3d6_shows_all_results()`
    1. Browser A: Advanced Mode
    2. Enter "3d6"
    3. Click Roll
    4. Browser B: Verify history shows [X, Y, Z] → Total
    5. Verify all 3 individual results visible
    6. Verify total = X + Y + Z
  - [ ] Test: `test_roll_with_modifier()`
    1. Browser A: Advanced Mode
    2. Enter "3d6-2"
    3. Click Roll
    4. Browser B: Verify history shows [X, Y, Z] → X+Y+Z-2
    5. Verify modifier applied to total only
  - [ ] Test: `test_8d10_roll()`
    1. Browser A: Enter "8d10"
    2. Click Roll
    3. Browser B: Verify all 8 results visible
    4. Verify total sum displayed
  - [ ] Test: `test_invalid_format_rejected()`
    1. Browser A: Enter "3d" (invalid)
    2. Verify error message shown
    3. Verify Roll button disabled
    4. Enter "3d6" (valid)
    5. Verify error cleared, Roll button enabled
  - [ ] Test: `test_advantage_toggle_hidden_in_advanced_mode()`
    1. Browser A: Advanced Mode
    2. Verify Advantage/Disadvantage toggle hidden
    3. Simple Mode: Verify toggle shown
  - [ ] Command: `npx playwright test multiple-dice.spec.ts`
  - [ ] All tests pass
  - [ ] Commit: "test(e2e): Add Playwright test for multiple dice rolls"

### Task 12: Manual Testing & Documentation

- [ ] Manual test procedure:
  - [ ] Run `docker-compose up`
  - [ ] Browser A: Create room, Browser B: Join room
  - [ ] Browser A: Simple Mode (default)
    - [ ] Roll "1d20"
    - [ ] Verify single result
  - [ ] Browser A: Switch to Advanced Mode
    - [ ] Roll "3d6"
    - [ ] Verify three individual results [X, Y, Z]
    - [ ] Verify total = X+Y+Z
    - [ ] Browser B: Verify same display
  - [ ] Browser A: Roll "3d6-2"
    - [ ] Verify total = X+Y+Z-2
  - [ ] Browser A: Roll "8d10"
    - [ ] Verify all 8 results shown
    - [ ] Verify total sum
  - [ ] Browser A: Roll "2d20" (without advantage)
    - [ ] Verify two d20 results shown
    - [ ] Verify both used in total (not advantage logic)
  - [ ] Browser A: Simple Mode, 1d20 with Advantage
    - [ ] Verify only higher d20 used
    - [ ] Advantage button hidden in Advanced Mode
  - [ ] Test invalid inputs:
    - [ ] Enter "3d" → error shown
    - [ ] Enter "d6" → error shown
    - [ ] Enter "0d6" → error shown
    - [ ] Enter "101d6" → error shown
  - [ ] Check backend logs: All rolls logged with NdN format
- [ ] Update README.md
  - [ ] Add section: "Rolling Multiple Dice"
  - [ ] Explain simple mode (1d20) vs advanced mode (NdN)
  - [ ] Examples: "3d6" for damage, "8d10" for bulk rolls
  - [ ] Explain modifiers: "3d6+5" or "3d6-2"
  - [ ] Note: Advantage only applies to d20
- [ ] Commit: "docs: Add multiple dice rolling documentation"

---

## Dev Notes

### Architecture Context

This story extends the **existing dice engine** to support variable dice counts without architectural changes.

- **ADR-001 (DiceEngine):** Proven flexible with Story 2.4; extends naturally to NdN
- **ADR-002 (Socket.io):** Already handles generic DiceResult; no changes needed
- **ADR-003 (Redis):** Rolls stored as DiceResult; backward compatible
- **ADR-006 (Zustand):** Store unchanged; rolls immutable once received
- **ADR-007 (Tailwind):** DiceInput UI extends with mode toggle

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Detailed-Design]

### Learnings from Stories 2.3-2.5

**From Stories 2.3-2.5 (Status: drafted)**

- **DiceEngine Pattern:** Parsing + rolling separation works well
- **Frontend Input:** Validation before send improves UX
- **Roll History:** Can display any number of individual results
- **Advanced Mode:** UI toggle for simple/complex perfectly isolates features

**Key Reuse Points:**

- Extend DiceEngine.parse_dice_formula() (new method)
- Extend DiceEngine.roll_dice() to handle NdN (existing method)
- Extend DiceInput with mode toggle (simple/advanced)
- RollHistory already handles individual_results (no changes needed)
- Socket.io already generic (no changes needed)

[Source: docs/sprint-artifacts/2-4-roll-all-standard-dice-types.md#Dev-Notes]

### Project Structure

Expected file additions/modifications:

```
backend/
├── app/
│   ├── services/
│   │   └── dice_engine.py (updated: add parse_dice_formula, extend roll_dice)
│   ├── models.py (updated: extend validation for NdN)
│   └── ...
├── tests/
│   ├── test_multiple_dice.py (NEW)
│   ├── test_roll_mechanics.py (updated: add broadcast tests)
│   └── ...
└── ...

frontend/
├── src/
│   ├── components/
│   │   └── DiceInput.tsx (updated: add advanced mode toggle)
│   └── ...
├── e2e/
│   ├── multiple-dice.spec.ts (NEW)
│   └── ...
└── ...
```

### Testing Strategy

**Unit Tests:**

- Backend: Parser accepts valid NdN, rejects invalid
- Backend: Roll counts and sums correctly
- Frontend: Mode toggle works
- Frontend: Input validation works

**Integration Tests:**

- Backend + Socket.io: All results broadcast correctly
- Backend + Redis: Rolls persist with all individual results
- Multiple dice counts: 1-100 dice work

**E2E Tests (Playwright):**

- Simple mode (1d20) unchanged
- Advanced mode: Switch, input, validate
- Roll 3d6: See all 3 results
- Roll with modifier: Applied correctly
- Roll 8d10: See all 8 results
- Invalid input: Rejected with error

**Manual Testing:**

- Simple vs Advanced modes
- Various dice counts (3d6, 8d10, 2d20)
- Modifiers (positive, negative)
- Edge cases (1d100, 100d1)
- Invalid inputs (0d6, 101d6, malformed)

### Key Dependencies

| Package    | Version | Purpose            |
| ---------- | ------- | ------------------ |
| re (regex) | builtin | NdN format parsing |

### Constraints & Patterns

- **Dice count:** 1-100 per roll (configurable, prevents abuse)
- **Dice sides:** 1-100 per die (d1 to d100, all standard D&D dice included)
- **Modifier:** -100 to +100 (applied to total only)
- **Advantage:** Only applies to "1d20" exactly, not "Nd20"
- **Input validation:** Client + server both validate
- **Display:** All individual results visible (no hiding)
- **Backward compatible:** 1d20, 1d6, etc. work in both modes

---

## References

- **Tech Spec:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- **Story 2.4:** [Source: docs/sprint-artifacts/2-4-roll-all-standard-dice-types.md]
- **Story 2.5:** [Source: docs/sprint-artifacts/2-5-roll-with-advantage-or-disadvantage.md]
- **Architecture:** [Source: docs/architecture.md]

---

## Dev Agent Record

### Context Reference

<!-- Story context XML will be added by story-context workflow -->

### Agent Model Used

Claude 3 (Latest)

### Completion Notes List

_To be filled by dev agent upon completion_

- NdN parser proven robust for edge cases
- Multiple dice display doesn't impact performance
- Mode toggle pattern elegant and non-intrusive
- All individual results visible without cluttering

### Debug Log References

_To be filled by dev agent if issues encountered_

### File List

**NEW FILES (created)**

- `backend/tests/test_multiple_dice.py`
- `frontend/e2e/multiple-dice.spec.ts`

**MODIFIED FILES**

- `backend/app/services/dice_engine.py` (add parser, extend roll_dice)
- `backend/app/models.py` (extend validation)
- `frontend/src/components/DiceInput.tsx` (add mode toggle, advanced input)
- `frontend/src/components/RollHistory.tsx` (already supports, verify)
- `backend/tests/test_roll_mechanics.py` (add broadcast tests)
- `README.md` (add documentation)

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
- 12 tasks defined for NdN multiple dice rolling
- 10 acceptance criteria covering parser, rolling, display, and edge cases
- Learnings from Stories 2.3-2.5 incorporated
- Full E2E test coverage for both simple and advanced modes
- Backward compatibility with existing 1d20/1dN rolls maintained
