# Story 2.7: Roll Multiple Dice in a Single Roll

Status: ready-for-dev

**Backend Note:** The dice parser (Stories 2.1-2.3) already handles multiple dice expressions perfectly (e.g., "3d6+2", "20d6"). This story focuses on **frontend UX enhancement only** - ensuring the quantity input from Story 2.4 provides clear visual feedback for multiple dice rolls.

---

## Story

As a **User**,
I want to **roll multiple dice of the same type in one roll (e.g., 3d6, 8d10, 20d6)**,
so that **I can efficiently roll damage or ability scores**.

---

## Acceptance Criteria

1. ✅ UI allows entering quantity of dice (1-100) for selected dice type
2. ~~✅ Backend correctly generates N rolls of the same die type~~ **DONE** - Parser already handles NdX format
3. ✅ Results show all individual die values (e.g., "3d6: [4, 2, 5] = 11", "20d6: [4,2,5,6,1,3...] = 67")
4. ✅ Roll history clearly displays multi-die formulas with all individual results
5. ✅ Performance: 20d6 rolls complete within 500ms (p95)
6. ✅ E2E test validates rolling 1d6, 5d6, 20d6 in same room

---

## Tasks / Subtasks

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

### Task 4: E2E Testing

- [ ] Create `frontend/tests/e2e/multi-dice.spec.ts`
  - [ ] Test: Player A rolls 1d6, Player B sees result
  - [ ] Test: Player A rolls 5d6, Player B sees all 5 individual results
  - [ ] Test: Player A rolls 20d6, Player B sees compact display
  - [ ] Test: Expand 20d6 results, verify all 20 dice shown
  - [ ] Test: Performance test: 20d6 roll completes < 500ms
  - [ ] Commit: "test(e2e): Add multi-dice roll tests"
