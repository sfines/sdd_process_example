# Story 2.4: Roll All Standard Dice Types

Status: ready-for-dev

**Backend Note:** The dice parser (implemented in Stories 2.1-2.3) already supports all standard dice types and quantities up to 100 dice per roll. This story focuses on **frontend UI convenience only** - adding dice type selector buttons and quantity input per Figma design.

---

## Story

As a **User**,
I want to **be able to roll any standard D&D die type (d4, d6, d8, d10, d12, d100)**,
so that **I can perform any action required in the game**.

---

## Acceptance Criteria

1. ✅ Advanced roll toggle/button reveals dice type selection UI on Room View
2. ✅ Dice type selector displays all standard types: d4, d6, d8, d10, d12, d20 (default), d100
3. ✅ User can select dice type, enter quantity (1-100), and optional modifier
4. ~~✅ Backend correctly generates rolls for all dice types~~ **DONE** - Backend parser already handles all dice types
5. ✅ Roll formula persists correctly (e.g., "3d6+2", "1d100-5", "20d6") - Backend already supports this
6. ✅ Results broadcast and appear in history with individual die results and total
7. ✅ Roll entry clearly shows: player name, full formula, all individual results, modifier, total
8. ~~✅ Server-side generation using secrets.SystemRandom()~~ **DONE** - Already implemented
9. ✅ Form validation: quantity 1-100, modifier -99 to +99, dice type valid
10. ✅ E2E test validates rolling d4, d6, d8, d10, d12, d20, d100 from same room
11. ✅ E2E test validates rolling large quantities (20d6 fireball damage, etc.)

---

## Tasks / Subtasks

### ~~Task 1: Backend Dice Engine Extension~~ ✅ COMPLETE

**Status:** Backend dice parser already supports all dice types via Lark grammar parsing. Parser validates up to 100 dice and 1000 sides per die. No backend work needed.

### ~~Task 2: Backend Formula Parsing Utility~~ ✅ COMPLETE

**Status:** `dice_parser.py` and `dice_engine.py` already handle all standard dice formulas (e.g., "3d6+2", "1d100-5", "20d6").

### Task 3: Frontend Advanced Roll Controls Component

- [ ] Create `frontend/src/components/AdvancedDiceInput.tsx`
  - [ ] Props: `onRoll: (formula: string) => void`, `isLoading: boolean`
  - [ ] Render controls (initially hidden, shown via toggle):
    - [ ] **Dice quantity input (1-100, default 1)** - spinner or text input
    - [ ] Dice size selector (dropdown or buttons: d4, d6, d8, d10, d12, d20, d100)
    - [ ] Modifier input (-99 to +99, can be negative)
    - [ ] +/- buttons for quick modifier adjustment
    - [ ] "Roll" button (same style as simple Roll 1d20 from Story 2.3)
    - [ ] Preview: shows formula in real-time (e.g., "3d6+2", "20d6")
  - [ ] State:
    - [ ] `numDice: number` **(1-100)**
    - [ ] `diceSize: number` (4, 6, 8, 10, 12, 20, 100)
    - [ ] `modifier: number` (-99 to +99)
  - [ ] Validation:
    - [ ] Quantity: enforce **1-100 range**
    - [ ] Modifier: enforce -99 to +99 range
    - [ ] Disable Roll button if invalid
  - [ ] Formula preview updates in real-time as user changes values
  - [ ] Styling: Tailwind, clear sections for each control, prominent Roll button
  - [ ] Test: Component renders and updates formula preview correctly for large quantities
  - [ ] Commit: "feat(frontend): Add AdvancedDiceInput component with all dice types and 1-100 quantity support"

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

- [ ] Update Socket.io event handler `roll_dice` in `backend/app/socket_manager.py`
  - [ ] Accept dice_formula parameter from frontend (e.g., "3d6+2", "1d100")
  - [ ] Validate formula via `DiceEngine.validate_formula()` before rolling
  - [ ] Return validation error if formula invalid
  - [ ] Use `DiceEngine.roll(formula)` to generate roll
  - [ ] Broadcast DiceResult to all players in room
  - [ ] Test: Handle various formulas, reject invalid syntax
  - [ ] Commit: "feat(backend): Enhance roll_dice handler to accept dice formulas"

### Task 6: Frontend Roll History Display

- [ ] Update `frontend/src/components/RollHistory.tsx` (from Story 2.3)
  - [ ] Display dice formula in each roll entry (e.g., "3d6+2")
  - [ ] Show all individual die results clearly (e.g., "[4, 2, 5]")
  - [ ] Display total with modifier applied
  - [ ] Styling: Make die results and total visually distinct
  - [ ] Test: History displays various dice types correctly
  - [ ] Commit: "feat(frontend): Update RollHistory to display dice formulas"

### Task 7: E2E Testing

- [ ] Create `frontend/tests/e2e/dice-types.spec.ts`
  - [ ] Test: Player A rolls d4, Player B sees correct result
  - [ ] Test: Player A rolls d6, d8, d10, d12, d20, d100 in sequence
  - [ ] Test: Player A rolls 3d6+2, Player B sees all 3 individual results
  - [ ] Test: Player A rolls 20d6, Player B sees all 20 individual results
  - [ ] Test: Invalid formula shows error message
  - [ ] Test: Formula validation feedback in realtime
  - [ ] Commit: "test(e2e): Add comprehensive dice types and formulas tests"
