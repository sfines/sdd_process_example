# Sprint Change Proposal - Epic 2 Backend Work Already Complete

**Date:** 2025-11-23
**Prepared By:** BMad Master (Course Correction Workflow)
**Project:** D&D Dice Roller
**Epic:** Epic 2 - Core Dice Rolling & Room Experience
**Status:** Ready for Implementation

---

## Section 1: Issue Summary

### Problem Statement

During Epic 2 implementation (Stories 2.1-2.3 complete), it was discovered that the **backend formula-based dice roller is significantly more sophisticated than originally anticipated**. The Lark grammar parser implemented in `dice_parser.py` already supports:

- All standard D&D dice types (d4, d6, d8, d10, d12, d20, d100)
- Complex expressions: `1d4+3d6+2` (multiple different dice types)
- Arithmetic operations: addition, subtraction, multiplication, division
- Up to 100 dice per expression
- Up to 1000 sides per die

### Context

**When Discovered:** After completing Stories 2.1-2.3 with full TDD implementation
**How Discovered:** Code review of `dice_parser.py` revealed Lark grammar parser capabilities exceed story requirements
**Evidence:** Backend already passing tests for `3d6+2`, `20d6`, and complex multi-dice formulas

### Impact on Sprint Plan

Stories 2.4, 2.5, and 2.7 were scoped assuming significant backend work was required. This assumption is **no longer valid**:

- **Story 2.4:** Backend work 100% complete (zero effort required)
- **Story 2.7:** Backend work 100% complete (zero effort required)
- **Story 2.5:** Backend needs minor modification only (~2 hours vs 8 hours estimated)

**Estimated Effort Reduction:** ~24 hours of backend development eliminated

---

## Section 2: Impact Analysis

### Epic Impact

**Epic 2: Core Dice Rolling & Room Experience**

- Stories 2.1-2.3: ✅ Complete (backend + frontend)
- Story 2.4: **Scope reduced** (backend done → frontend only)
- Story 2.5: **Effort reduced** (major backend → minor backend + frontend)
- Story 2.7: **Scope reduced** (backend done → frontend only)

**Overall Epic 2 Impact:**

- ✅ **Positive:** Velocity increase (~40% faster completion)
- ✅ **Positive:** Frontend-focused work aligns with Figma design integration
- ⚠️ **Attention:** Need to ensure 100-dice limit reflected in all stories (not 8 or 20)

### Story Impact

#### Story 2.4: Roll All Standard Dice Types

**Current Status:** `drafted`
**New Status:** `ready-for-dev`

**Changes Required:**

- Update dice quantity limit: 8 → 100 (matches backend capability)
- Mark backend Tasks 1-2 as complete (already implemented)
- Focus Tasks 3-5 on frontend UI only (dice selector buttons)
- Add backend note explaining work already done
- Add E2E test for large quantity rolls (20d6)

**Effort Change:** 16 hours → 6 hours (62% reduction)

#### Story 2.5: Roll with Advantage/Disadvantage

**Current Status:** `drafted`
**New Status:** `ready-for-dev`

**Changes Required:**

- Update Task 1 to clarify: Backend can roll 2d20, needs logic to select higher/lower
- Use existing parser for 2d20 roll, add selection layer
- Add socket handler enhancement
- No parser modifications needed

**Effort Change:** 12 hours → 5 hours (58% reduction)

#### Story 2.7: Roll Multiple Dice in a Single Roll

**Current Status:** `drafted`
**New Status:** `ready-for-dev`

**Changes Required:**

- Update dice quantity limit: 20 → 100
- Mark backend Task 1 as complete (parser handles NdX notation)
- Note Task 2 covered by Story 2.4's AdvancedDiceInput
- Focus Task 3 on history display UX (expandable view for 10+ dice)

**Effort Change:** 10 hours → 3 hours (70% reduction)

### Artifact Conflicts

**No conflicts identified with:**

- ✅ PRD - All functional requirements still deliverable
- ✅ Architecture Document - Dice parser implementation already documented
- ✅ Epics Document - Epic 2 goals unchanged

**Documentation Updates Needed:**

- ✅ Story files (2.4, 2.5, 2.7) - Scope and effort adjustments
- ⚠️ Sprint velocity tracking - Adjust estimates for remaining Epic 2 stories

### Technical Impact

**Code Changes:**

- ✅ No breaking changes
- ✅ No architecture modifications needed
- ✅ Existing tests continue to pass

**Infrastructure:**

- ✅ No deployment changes
- ✅ No database schema changes
- ✅ No Redis key structure changes

---

## Section 3: Recommended Approach

### Chosen Path: **Direct Adjustment**

Modify Stories 2.4, 2.5, and 2.7 within existing Epic 2 plan. No rollback or MVP review required.

### Rationale

1. **Zero Risk:** Backend capabilities already validated with passing tests
2. **Faster Delivery:** Reduced scope accelerates Epic 2 completion
3. **Better Alignment:** Frontend-focused work matches Figma design integration
4. **No Dependencies:** Changes don't affect other epics or stories

### Effort Estimate

**Original Epic 2 Remaining Effort:** 38 hours
**Revised Epic 2 Remaining Effort:** 14 hours
**Effort Saved:** 24 hours (63% reduction)

### Risk Assessment

**Low Risk:**

- Backend functionality already proven with E2E tests (18/18 passing)
- Frontend work is additive (no breaking changes)
- Story dependencies remain unchanged

**Mitigation:**

- Validate frontend against backend capabilities before starting each story
- Ensure E2E tests cover edge cases (100d6, complex formulas)
- Document backend capabilities clearly in story files

### Timeline Impact

**Original Epic 2 Completion:** Estimated 2 more sprints
**Revised Epic 2 Completion:** Estimated 1 sprint
**Acceleration:** 1 sprint faster than planned

---

## Section 4: Detailed Change Proposals

### Change #1: Story 2.4 - Roll All Standard Dice Types

**File:** `docs/sprint-artifacts/2-4-roll-all-standard-dice-types.md`

**Status Change:**

```markdown
OLD: Status: drafted
NEW: Status: ready-for-dev
```

**Add Backend Note (after Status):**

```markdown
**Backend Note:** The dice parser (implemented in Stories 2.1-2.3) already supports all standard dice types and quantities up to 100 dice per roll. This story focuses on **frontend UI convenience only** - adding dice type selector buttons and quantity input per Figma design.
```

**Update Acceptance Criteria:**

```markdown
OLD: 3. ✅ User can select dice type, enter quantity (1-8), and optional modifier
NEW: 3. ✅ User can select dice type, enter quantity (1-100), and optional modifier

OLD: 4. ✅ Backend correctly generates rolls for all dice types (d4=1-4, d6=1-6, etc.)
NEW: 4. ~~✅ Backend correctly generates rolls for all dice types~~ **DONE** - Backend parser already handles all dice types

OLD: 9. ✅ Form validation: quantity 1-8, modifier -99 to +99, dice type valid
NEW: 9. ✅ Form validation: quantity 1-100, modifier -99 to +99, dice type valid

ADD: 11. ✅ E2E test validates rolling large quantities (20d6 fireball damage, etc.)
```

**Update Tasks Section:**

```markdown
ADD BEFORE Task 3:

### ~~Task 1: Backend Dice Engine Extension~~ ✅ COMPLETE

**Status:** Backend dice parser already supports all dice types via Lark grammar parsing. Parser validates up to 100 dice and 1000 sides per die. No backend work needed.

### ~~Task 2: Backend Formula Parsing Utility~~ ✅ COMPLETE

**Status:** `dice_parser.py` and `dice_engine.py` already handle all standard dice formulas (e.g., "3d6+2", "1d100-5", "20d6").
```

**Update Task 3 - Frontend Component:**

```markdown
OLD: - [ ] Dice quantity spinner (1-8, default 1)
NEW: - [ ] **Dice quantity input (1-100, default 1)** - spinner or text input

OLD: - [ ] `numDice: number` (1-8)
NEW: - [ ] `numDice: number` **(1-100)**

OLD: - [ ] Quantity: enforce 1-8 range
NEW: - [ ] Quantity: enforce **1-100 range**
```

**Justification:** Backend parser already handles all dice types and quantities. Story now frontend-only work with realistic D&D dice limits (fireball = 8d6+, massive damage = 20d6+).

---

### Change #2: Story 2.7 - Roll Multiple Dice in a Single Roll

**File:** `docs/sprint-artifacts/2-7-roll-multiple-dice-in-a-single-roll.md`

**Status Change:**

```markdown
OLD: Status: drafted
NEW: Status: ready-for-dev
```

**Add Backend Note (after Status):**

```markdown
**Backend Note:** The dice parser (Stories 2.1-2.3) already handles multiple dice expressions perfectly (e.g., "3d6+2", "20d6"). This story focuses on **frontend UX enhancement only** - ensuring the quantity input from Story 2.4 provides clear visual feedback for multiple dice rolls.
```

**Update Story Description:**

```markdown
OLD: I want to **roll multiple dice of the same type in one roll (e.g., 3d6, 8d10)**,
NEW: I want to **roll multiple dice of the same type in one roll (e.g., 3d6, 8d10, 20d6)**,
```

**Update Acceptance Criteria:**

```markdown
OLD: 1. ✅ UI allows entering quantity of dice (1-20) for selected dice type
NEW: 1. ✅ UI allows entering quantity of dice (1-100) for selected dice type

OLD: 2. ✅ Backend correctly generates N rolls of the same die type
NEW: 2. ~~✅ Backend correctly generates N rolls of the same die type~~ **DONE** - Parser already handles NdX format

OLD: 3. ✅ Results show all individual die values (e.g., "3d6: [4, 2, 5] = 11")
NEW: 3. ✅ Results show all individual die values (e.g., "3d6: [4, 2, 5] = 11", "20d6: [4,2,5,6,1,3...] = 67")

ADD: 6. ✅ E2E test validates rolling 1d6, 5d6, 20d6 in same room
```

**Replace Tasks Section:**

```markdown
### ~~Task 1: Backend Multi-Dice Support~~ ✅ COMPLETE

**Status:** Dice parser Lark grammar already handles NdX notation (e.g., "3d6", "20d6", "100d4"). Supports up to 100 dice per roll.

### Task 2: Frontend Quantity Input Enhancement

- [ ] **This work is covered by Story 2.4's AdvancedDiceInput component**
- [ ] Ensure quantity input (1-100) is prominent and clear
- [ ] Real-time formula preview shows multi-die notation (e.g., "20d6+5")
- [ ] Validation feedback for large quantities (>50 dice shows performance note)
- [ ] Test: Verify formula preview updates correctly for various quantities

### Task 3: Frontend Roll History Display Enhancement

- [ ] Update `RollHistory` component to handle long individual_results arrays
- [ ] For rolls with >10 individual dice: Show compact format with expand/collapse
- [ ] Example display: "20d6: [4, 2, 5, 6, 1, 3... +14 more] = 67" with "Show all" link
- [ ] Expanded view shows all individual results in grid format
- [ ] Ensure smooth scrolling performance with large result arrays
- [ ] Test: Roll 100d6, verify history displays correctly without UI lag
- [ ] Commit: "feat(frontend): Add expandable display for multi-dice rolls in history"
```

**Justification:** Backend already handles multiple dice via formula parser. Story now focuses on history display UX for large result sets (10+ dice). Story 2.4's quantity input covers the UI mechanism.

---

### Change #3: Story 2.5 - Roll with Advantage or Disadvantage

**File:** `docs/sprint-artifacts/2-5-roll-with-advantage-or-disadvantage.md`

**Status Change:**

```markdown
OLD: Status: drafted
NEW: Status: ready-for-dev
```

**Add Backend Note (after Status):**

```markdown
**Backend Note:** The dice parser supports rolling 2d20, but does NOT automatically determine which die to use for advantage/disadvantage. Backend requires **minor modification** to add advantage/disadvantage logic and track which result is "active."
```

**Update Task 1:**

```markdown
### Task 1: Backend Dice Engine - Advantage/Disadvantage Logic

- [ ] Update `backend/app/services/dice_engine.py`
  - [ ] Add method: `roll_with_advantage(formula: str, advantage_type: str, modifier: int = 0) -> DiceResult`
    - [ ] For advantage_type="advantage": Parse formula, if 1d20 → roll 2d20, select higher
    - [ ] For advantage_type="disadvantage": Parse formula, if 1d20 → roll 2d20, select lower
    - [ ] Use existing parser: `self._parser.parse("2d20")` for rolls
    - [ ] Return DiceResult with both rolls in individual_results, mark active result
    - [ ] Apply modifier to active result only
    - [ ] Update formula display: "1d20 (Advantage)+5" or "1d20 (Disadvantage)+5"
  - [ ] Test: Advantage always uses higher of 2d20
  - [ ] Test: Disadvantage always uses lower of 2d20
  - [ ] Test: Modifier applies to active result only
  - [ ] Commit: "feat(backend): Add advantage/disadvantage logic using existing parser"
```

**Update Task 2:**

```markdown
### Task 2: Backend Pydantic Models - Advantage/Disadvantage

- [ ] Update `backend/app/models.py`
  - [ ] Update `DiceResult` model:
    - [ ] Add field: `active_result: Optional[int]` (which die is being used for total)
    - [ ] Add field: `advantage_type: Literal["none", "advantage", "disadvantage"] = "none"`
  - [ ] Update `RollRequest` model (if exists):
    - [ ] Add field: `advantage_type: Literal["none", "advantage", "disadvantage"] = "none"`
  - [ ] Commit: "feat(backend): Add advantage fields to DiceResult model"
```

**Add Task 3:**

```markdown
### Task 3: Backend Socket Event Handler Enhancement

- [ ] Update socket handler for roll_dice event in `socket_manager.py`
  - [ ] Accept advantage_type parameter from frontend
  - [ ] Route to appropriate DiceEngine method based on advantage_type
  - [ ] Broadcast DiceResult with advantage metadata
  - [ ] Commit: "feat(backend): Add advantage/disadvantage support to roll_dice event"
```

**Justification:** Backend can roll 2d20 via existing parser but needs new logic layer to select higher/lower die. This is minor backend enhancement (~2 hours) rather than major implementation (~8 hours originally estimated).

---

## Section 5: Implementation Handoff

### Change Scope Classification: **Minor**

**Rationale:**

- All changes are documentation updates to story files
- No code changes required (backend already complete for 2.4 and 2.7)
- Minor backend enhancement for 2.5 (uses existing parser)
- No architecture or infrastructure changes

### Handoff Recipients

**Primary:** Development Team (Frontend focus)
**Secondary:** Product Owner (for sprint velocity tracking adjustment)

### Implementation Steps

1. **Update Story Files** (Immediate)
   - Apply all changes from Section 4 to story files
   - Mark Stories 2.4, 2.5, 2.7 as `ready-for-dev`
   - Commit changes to documentation

2. **Update Sprint Velocity** (Before next sprint planning)
   - Adjust remaining Epic 2 effort estimates
   - Update sprint status YAML with new story statuses
   - Reflect 24-hour effort reduction in burndown charts

3. **Begin Story 2.4 Implementation** (Frontend)
   - Implement AdvancedDiceInput component with dice selector
   - Quantity input 1-100 with validation
   - Real-time formula preview
   - E2E test for large quantity rolls

4. **Begin Story 2.5 Implementation** (Minor Backend + Frontend)
   - Add advantage/disadvantage selection logic to DiceEngine
   - Update Pydantic models with advantage fields
   - Frontend toggle UI implementation
   - E2E test for advantage/disadvantage

5. **Begin Story 2.7 Implementation** (Frontend)
   - Update RollHistory component for expandable display
   - Implement compact view for 10+ individual dice
   - E2E test for large multi-dice rolls

### Success Criteria

✅ All three story files updated with approved changes
✅ Sprint velocity tracking reflects reduced effort
✅ Stories 2.4, 2.5, 2.7 marked `ready-for-dev`
✅ Development team acknowledges updated scope
✅ E2E tests validate 100-dice capability

### Risks & Mitigation

**Risk:** Frontend developers implement features backend doesn't support
**Mitigation:** Backend capabilities documented clearly in story files with examples

**Risk:** 100-dice limit causes performance issues
**Mitigation:** Backend parser already validates 100 dice limit; frontend should show performance note for >50 dice

**Risk:** Confusion about what's "done" vs "to-do"
**Mitigation:** Clear strikethrough on completed acceptance criteria, backend notes explain what exists

---

## Section 6: Appendix

### Backend Capabilities Summary

The `dice_parser.py` (Lark grammar parser) supports:

**✅ All Standard Dice:**

- d4, d6, d8, d10, d12, d20, d100

**✅ Complex Expressions:**

- Multiple different dice: `1d4+3d6+2`
- Arithmetic: `2d6*3+1d4-2`
- Nested expressions with parentheses

**✅ Quantity Limits:**

- Up to 100 dice per expression
- Up to 1000 sides per die

**✅ Security:**

- Cryptographic randomness via `secrets.SystemRandom()`
- Server-side only (no client manipulation)

### Testing Evidence

**Backend Tests:** 101/101 passing (86% coverage)
**E2E Tests:** 18/18 passing (100%)
**Formulas Validated:**

- `1d20+5` ✅
- `3d6+2` ✅
- `20d6` ✅
- `1d4+3d6+1d8+2` ✅

### Related Documentation

- ADR-011: React State Persistence Pattern
- ADR-012: Component Composition Pattern
- Backend: `dice_parser.py` - Lark grammar implementation
- Backend: `dice_engine.py` - Roll generation engine

---

**End of Sprint Change Proposal**

_Prepared by BMad Master Course Correction Workflow_
_Date: 2025-11-23_
_Status: Ready for Implementation_
