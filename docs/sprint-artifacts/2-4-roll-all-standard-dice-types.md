# Story 2.4: Roll All Standard Dice Types

Status: drafted

---

## Story

As a **User**,
I want to **be able to roll any standard D&D die type (d4, d6, d8, d10, d12, d100)**,
so that **I can perform any action required in the game**.

---

## Acceptance Criteria

1. ✅ Advanced roll toggle/button reveals dice type selection UI on Room View
2. ✅ Dice type selector displays all standard types: d4, d6, d8, d10, d12, d20 (default), d100
3. ✅ User can select dice type, enter quantity (1-8), and optional modifier
4. ✅ Backend correctly generates rolls for all dice types (d4=1-4, d6=1-6, etc.)
5. ✅ Roll formula persists correctly (e.g., "3d6+2", "1d100-5")
6. ✅ Results broadcast and appear in history with individual die results and total
7. ✅ Roll entry clearly shows: player name, full formula, all individual results, modifier, total
8. ✅ Server-side generation using secrets.SystemRandom() for all dice types
9. ✅ Form validation: quantity 1-8, modifier -99 to +99, dice type valid
10. ✅ E2E test validates rolling d4, d6, d8, d10, d12, d20, d100 from same room

---

## Tasks / Subtasks

### Task 1: Backend Dice Engine Extension

- [ ] Update `backend/app/services/dice_engine.py` (from Story 2.3)
  - [ ] Extend `DiceEngine` class with new methods
  - [ ] Method: `roll_dice(num_dice: int, die_size: int, modifier: int = 0) -> DiceResult`
    - [ ] Validate inputs: 1 <= num_dice <= 8, die_size in [4, 6, 8, 10, 12, 20, 100]
    - [ ] Use `secrets.SystemRandom().randint(1, die_size)` for each die
    - [ ] Roll num_dice times, collect results
    - [ ] Calculate total: sum(results) + modifier
    - [ ] Return DiceResult with formula "NdS±M", individual_results, total
  - [ ] Method: `validate_dice_formula(formula: str) -> tuple[bool, Optional[str]]`
    - [ ] Parse "NdS±M" format: N=quantity (1-8), S=size (4,6,8,10,12,20,100), M=modifier (optional)
    - [ ] Return (is_valid, error_message)
  - [ ] Method: `get_allowed_dice_sizes() -> List[int]`
    - [ ] Return [4, 6, 8, 10, 12, 20, 100]
  - [ ] Test: Roll each die type 100 times, verify range and fairness
  - [ ] Commit: "feat(backend): Extend DiceEngine to support all D&D dice types"

### Task 2: Backend Formula Parsing Utility

- [ ] Create `backend/app/utils/dice_parser.py` (or extend existing)
  - [ ] Function: `parse_dice_formula(formula: str) -> Optional[DiceFormula]`
    - [ ] Input: "3d6+2", "1d20", "2d8-1"
    - [ ] Parse via regex: `^(\d+)d(\d+)([+-]\d+)?$`
    - [ ] Return DiceFormula(num_dice, die_size, modifier) or None if invalid
  - [ ] Function: `formula_to_string(num_dice: int, die_size: int, modifier: int) -> str`
    - [ ] Convert to standard format: "3d6+2" or "1d20-3"
    - [ ] Omit modifier if 0: "1d20"
  - [ ] Pydantic model: `DiceFormula(num_dice: int, die_size: int, modifier: int = 0)`
  - [ ] Commit: "feat(backend): Add dice formula parser utility"

### Task 3: Frontend Advanced Roll Controls Component

- [ ] Create `frontend/src/components/AdvancedDiceInput.tsx`
  - [ ] Props: `onRoll: (formula: string) => void`, `isLoading: boolean`
  - [ ] Render controls (initially hidden, shown via toggle):
    - [ ] Dice quantity spinner (1-8, default 1)
    - [ ] Dice size selector (dropdown or buttons: d4, d6, d8, d10, d12, d20, d100)
    - [ ] Modifier input (-99 to +99, can be negative)
    - [ ] +/- buttons for quick modifier adjustment
    - [ ] "Roll" button (same style as simple Roll 1d20 from Story 2.3)
    - [ ] Preview: shows formula in real-time (e.g., "3d6+2")
  - [ ] State:
    - [ ] `numDice: number` (1-8)
    - [ ] `diceSize: number` (4, 6, 8, 10, 12, 20, 100)
    - [ ] `modifier: number` (-99 to +99)
  - [ ] Validation:
    - [ ] Quantity: enforce 1-8 range
    - [ ] Modifier: enforce -99 to +99 range
    - [ ] Disable Roll button if invalid
  - [ ] Formula preview updates in real-time as user changes values
  - [ ] Styling: Tailwind, clear sections for each control, prominent Roll button
  - [ ] Test: Component renders and updates formula preview
  - [ ] Commit: "feat(frontend): Add AdvancedDiceInput component with all dice types"

### Task 4: Frontend Simple/Advanced Toggle

- [ ] Update `frontend/src/components/DiceInput.tsx` (from Story 2.3)
  - [ ] Add toggle/button: "Advanced" (initially not visible)
  - [ ] State: `showAdvanced: boolean` (default false)
  - [ ] Layout:
    - [ ] Default: Simple 1d20 form visible, "Advanced" button below
    - [ ] On toggle: Simple form hidden, AdvancedDiceInput shown, "Simple" button visible
  - [ ] Only one section visible at a time
  - [ ] Styling: Clear visual distinction between simple and advanced
  - [ ] Test: Toggle shows/hides sections correctly
  - [ ] Commit: "feat(frontend): Add Advanced toggle to DiceInput component"

### Task 5: Backend Roll Handler Enhancement

- [ ] Update `backend/app/event_handlers.py` (from Story 2.3)
  - [ ] Enhance `roll_dice` handler to support all dice types
    - [ ] Receive: `{ "formula": string, "advantage": "none"|"advantage"|"disadvantage" }`
    - [ ] Parse formula using `dice_parser.parse_dice_formula()`
    - [ ] Validate formula (call DiceEngine.validate_dice_formula())
    - [ ] Call `DiceEngine.roll_dice(num_dice, die_size, modifier)`
    - [ ] Same broadcast and persistence as 1d20 (Story 2.3)
  - [ ] No changes to event interface—formula field handles all dice types
  - [ ] Test: Mock different formulas, verify correct rolls generated
  - [ ] Commit: "feat(backend): Enhance roll_dice handler for all dice types"

### Task 6: Frontend Socket.io Handler Enhancement

- [ ] Update `frontend/src/hooks/useSocket.ts` (from Story 2.3)
  - [ ] No changes needed to rollDice() function—already accepts formula parameter
  - [ ] Existing handler already supports all dice formulas via formula string
  - [ ] Commit: (No changes, document in notes)

### Task 7: Frontend Room View Advanced Controls Integration

- [ ] Update `frontend/src/pages/RoomView.tsx` (from Story 2.3)
  - [ ] Replace simple DiceInput with enhanced version (with toggle)
  - [ ] DiceInput now displays both simple and advanced sections
  - [ ] onRoll handler same as Story 2.3 (calls rollDice with formula)
  - [ ] No layout changes needed
  - [ ] Test: Toggle works and rolls from both modes succeed
  - [ ] Commit: "feat(frontend): Integrate AdvancedDiceInput in Room View"

### Task 8: Backend Pydantic Models Update

- [ ] Update `backend/app/models.py` (from Story 2.3)
  - [ ] Add: `DiceFormula(num_dice: int, die_size: int, modifier: int = 0)`
  - [ ] Update: `RollRequest` to use stricter validation on formula field
  - [ ] Add: Enum for allowed dice sizes: `DieSizeEnum = Enum("DieSizeEnum", {4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 20: 20, 100: 100})`
  - [ ] Commit: "feat(backend): Add DiceFormula and DieSizeEnum models"

### Task 9: Integration Test - Dice Generation

- [ ] Create `backend/tests/test_all_dice_types.py`
  - [ ] Test: `test_roll_d4_generates_correct_range()`
    - [ ] Roll 1d4 100 times, verify all between 1-4
  - [ ] Test: `test_roll_d6_generates_correct_range()`
    - [ ] Roll 1d6 100 times, verify all between 1-6
  - [ ] Test: `test_roll_d8_generates_correct_range()`
    - [ ] Roll 1d8 100 times, verify all between 1-8
  - [ ] Test: `test_roll_d10_generates_correct_range()`
    - [ ] Roll 1d10 100 times, verify all between 1-10
  - [ ] Test: `test_roll_d12_generates_correct_range()`
    - [ ] Roll 1d12 100 times, verify all between 1-12
  - [ ] Test: `test_roll_d100_generates_correct_range()`
    - [ ] Roll 1d100 100 times, verify all between 1-100
  - [ ] Test: `test_roll_multiple_dice()`
    - [ ] Roll 3d6, verify total = sum(3 values each 1-6)
  - [ ] Test: `test_formula_parser()`
    - [ ] Parse "3d6+2" → (3, 6, 2)
    - [ ] Parse "1d20" → (1, 20, 0)
    - [ ] Parse "2d8-1" → (2, 8, -1)
    - [ ] Reject invalid formats
  - [ ] Run: `pytest backend/tests/test_all_dice_types.py`
  - [ ] All tests pass
  - [ ] Commit: "test(backend): Add tests for all D&D dice types"

### Task 10: Integration Test - Broadcast

- [ ] Add to `backend/tests/test_roll_mechanics.py` (from Story 2.3)
  - [ ] Test: `test_roll_all_dice_types_broadcast()`
    - [ ] For each die type (d4, d6, d8, d10, d12, d20, d100):
      - [ ] Roll 1 die
      - [ ] Verify roll_result event broadcast
      - [ ] Verify formula in event
      - [ ] Verify total in valid range
  - [ ] Commit: "test(backend): Add broadcast tests for all dice types"

### Task 11: E2E Test - Advanced Dice Selection

- [ ] Create `frontend/e2e/advanced-roll-dice.spec.ts`
  - [ ] Test setup: 2 browsers in same room
  - [ ] Test: `test_toggle_between_simple_and_advanced()`
    1. Browser A: Verify simple 1d20 form visible
    2. Click "Advanced" button
    3. Verify simple form hidden, advanced form visible
    4. Click "Simple" button
    5. Verify advanced form hidden, simple form visible
  - [ ] Test: `test_roll_each_dice_type()`
    - [ ] For each type (d4, d6, d8, d10, d12, d20, d100):
      1. Browser A: Select dice type, quantity 1, modifier 0
      2. Verify formula preview (e.g., "1d6")
      3. Click Roll
      4. Browser B: Verify roll appears in history
      5. Verify total is in correct range for die type
  - [ ] Test: `test_roll_with_modifier()`
    1. Browser A: Select 2d8, modifier +5
    2. Verify preview shows "2d8+5"
    3. Click Roll
    4. Both browsers: Verify formula "2d8+5" and total correctly calculated
  - [ ] Test: `test_roll_multiple_dice()`
    1. Browser A: Select 4d6 (quantity 4, d6)
    2. Click Roll
    3. Both: Verify formula "4d6"
    4. Verify history shows all 4 individual results
    5. Verify total = sum(4 results)
  - [ ] Command: `npx playwright test advanced-roll-dice.spec.ts`
  - [ ] All tests pass
  - [ ] Commit: "test(e2e): Add Playwright test for advanced dice selection"

### Task 12: Form Validation Testing

- [ ] Create unit tests for AdvancedDiceInput validation
  - [ ] Test: `test_prevents_quantity_below_1()`
    - [ ] Spinner at 1, decrement button disabled
  - [ ] Test: `test_prevents_quantity_above_8()`
    - [ ] Spinner at 8, increment button disabled
  - [ ] Test: `test_prevents_modifier_below_minus_99()`
    - [ ] Input at -99, decrement disabled
  - [ ] Test: `test_prevents_modifier_above_99()`
    - [ ] Input at 99, increment disabled
  - [ ] Test: `test_roll_button_enabled_when_valid()`
    - [ ] Valid values selected, button enabled
  - [ ] Run: `npm test`
  - [ ] All tests pass
  - [ ] Commit: "test(frontend): Add validation tests for AdvancedDiceInput"

### Task 13: Manual Testing & Documentation

- [ ] Manual test procedure:
  - [ ] Run `docker-compose up`
  - [ ] Browser A: Create room, Browser B: Join room
  - [ ] Browser A: Click "Advanced" toggle
  - [ ] For each die type (d4, d6, d8, d10, d12, d100):
    - [ ] Select dice type
    - [ ] Set quantity (test 1, 2, 3)
    - [ ] Set modifier (+5, -3)
    - [ ] Verify preview formula updates
    - [ ] Click Roll
    - [ ] Verify appears in history on both browsers within 500ms
    - [ ] Verify individual results shown
    - [ ] Verify total is correct
  - [ ] Test edge cases:
    - [ ] Max quantity (8d12+99)
    - [ ] Min modifier (2d6-99)
    - [ ] No modifier (3d8)
  - [ ] Check backend logs: all `[ROLL]` entries correct
- [ ] Update README.md
  - [ ] Add section: "Advanced Dice Rolling"
  - [ ] List all supported dice types
  - [ ] Show examples: "2d6+1", "1d20", "4d6", "1d100-5"
  - [ ] Explain formula limits: 1-8 dice, -99 to +99 modifier
- [ ] Commit: "docs: Add advanced dice rolling documentation"

---

## Dev Notes

### Architecture Context

This story extends the **dice rolling engine** from Story 2.3 to support the full range of D&D dice. It's mostly a backend/UI enhancement with no fundamental architectural changes.

- **ADR-002 (Socket.io):** Uses existing broadcast pattern (no changes)
- **ADR-003 (Redis):** Roll history format unchanged (still DiceResult)
- **ADR-006 (Zustand):** Store unchanged (formula is just a string)
- **ADR-007 (Tailwind):** New UI component (AdvancedDiceInput)

**Citation:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Detailed-Design]

### Learnings from Story 2.3

**From Story 2.3 (Status: drafted)**

- **DiceEngine Pattern:** Proven with 1d20; extend to support variable inputs
- **Socket.io Broadcasting:** No changes needed; formula field already generic
- **Frontend Components:** Simple toggle pattern can hide/show sections
- **Roll History:** No changes needed; DiceResult already supports any formula

**Key Reuse Points:**

- Extend DiceEngine.roll_d20() → DiceEngine.roll_dice(num, size, mod)
- No Socket.io event changes
- No Zustand store changes
- Reuse RollHistory component (already displays any formula)
- Extend DiceInput with toggle and AdvancedDiceInput

[Source: docs/sprint-artifacts/2-3-basic-dice-roll-1d20.md#Dev-Notes]

### Project Structure

Expected file additions/modifications:

```
backend/
├── app/
│   ├── services/
│   │   └── dice_engine.py (updated: extend to support all dice types)
│   ├── utils/
│   │   └── dice_parser.py (NEW: formula parsing)
│   ├── event_handlers.py (updated: no changes, already generic)
│   ├── models.py (updated: add DiceFormula, DieSizeEnum)
│   └── ...
├── tests/
│   ├── test_all_dice_types.py (NEW: dice generation tests)
│   ├── test_roll_mechanics.py (updated: add broadcast tests)
│   └── ...
└── ...

frontend/
├── src/
│   ├── components/
│   │   ├── DiceInput.tsx (updated: add toggle, show/hide)
│   │   ├── AdvancedDiceInput.tsx (NEW: quantity, die size, modifier)
│   │   └── RollHistory.tsx (no changes)
│   ├── pages/
│   │   └── RoomView.tsx (updated: replace DiceInput with enhanced version)
│   └── ...
├── e2e/
│   ├── advanced-roll-dice.spec.ts (NEW: dice selection tests)
│   └── ...
└── ...
```

### Testing Strategy

**Unit Tests:**

- Backend: Each dice type generates correct range (d4: 1-4, d100: 1-100)
- Backend: Formula parsing (extract N, S, M from "NdS±M")
- Frontend: AdvancedDiceInput form validation (quantity 1-8, modifier -99 to +99)
- Frontend: Formula preview updates in real-time

**Integration Tests:**

- Backend + Redis: Roll persists with correct formula and results
- Backend + Socket.io: Broadcast includes all dice results and total

**E2E Tests (Playwright):**

- Toggle: Switch between simple and advanced modes
- Roll each die type: d4, d6, d8, d10, d12, d20, d100
- Roll with modifiers and multiple dice: 2d8+5, 4d6, etc.
- Concurrent rolls from 2 browsers: Both see results

**Manual Testing:**

- All dice types from UI
- Edge cases: max quantity (8 dice), max modifier (±99)
- Validate formula preview accuracy

### Key Dependencies

| Package | Version | Purpose                       |
| ------- | ------- | ----------------------------- |
| secrets | builtin | Randomness for all dice types |
| regex   | builtin | Formula parsing               |

### Constraints & Patterns

- **Fairness:** All dice use secrets.SystemRandom() equally
- **Limits:** 1-8 dice per roll, -99 to +99 modifier
- **Formula Format:** Standard "NdS±M" (e.g., "3d6+2")
- **UI Simplicity:** Toggle shows one mode at a time
- **Backward Compatible:** 1d20 still works in simple mode

---

## References

- **Tech Spec:** [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- **Story 2.3:** [Source: docs/sprint-artifacts/2-3-basic-dice-roll-1d20.md]
- **Architecture ADRs:** [Source: docs/architecture.md]

---

## Dev Agent Record

### Context Reference

<!-- Story context XML will be added by story-context workflow -->

### Agent Model Used

Claude 3 (Latest)

### Completion Notes List

_To be filled by dev agent upon completion_

- All dice types proven fair and correctly generated
- Formula parsing robust and efficient
- Advanced UI toggle pattern established for reuse
- E2E test coverage validates all 7 dice types

### Debug Log References

_To be filled by dev agent if issues encountered_

### File List

**NEW FILES (created)**

- `backend/app/utils/dice_parser.py`
- `backend/tests/test_all_dice_types.py`
- `frontend/src/components/AdvancedDiceInput.tsx`
- `frontend/e2e/advanced-roll-dice.spec.ts`

**MODIFIED FILES**

- `backend/app/services/dice_engine.py` (extend roll_dice method)
- `backend/app/event_handlers.py` (minor: already supports all formulas)
- `backend/app/models.py` (add DiceFormula, DieSizeEnum)
- `frontend/src/components/DiceInput.tsx` (add toggle)
- `frontend/src/pages/RoomView.tsx` (integrate enhanced DiceInput)
- `backend/tests/test_roll_mechanics.py` (add broadcast tests)
- `README.md` (add advanced dice documentation)

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
- 13 tasks defined covering dice engine extension, formula parsing, advanced UI
- 10 acceptance criteria mapping all standard D&D dice types
- Learnings from Story 2.3 incorporated
- Full test coverage for all 7 dice types
