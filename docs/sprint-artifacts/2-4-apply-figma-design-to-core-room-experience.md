# Story 2.4: Apply Figma Design to Core Room Experience

Status: ready-for-dev

**Design Context:** Stories 2.1-2.3 delivered functional room creation, joining, and basic dice rolling with minimal UI. This story implements the professional Figma design system for those completed features, migrating from basic Tailwind components to shadcn/ui design system.

**Critical:** Preserve ALL Socket.io integration. Replace ONLY UI components, not business logic.

---

## Story

As a **User**,
I want to **experience a polished, professional UI when creating rooms, joining rooms, and rolling dice**,
so that **the application feels trustworthy and enjoyable to use**.

---

## Acceptance Criteria

1. ✅ Design tokens imported from `docs/uex/figma-design/src/styles/globals.css` to `frontend/src/styles/globals.css`
2. ✅ shadcn/ui primitives installed and configured (Button, Input, Card, Badge, Separator, ScrollArea)
3. ✅ HomePage matches Figma design with Create Room and Join Room flows
4. ✅ RoomView layout matches Figma design (three-column responsive layout)
5. ✅ DiceInput (simple 1d20 mode) matches Figma design with prominent Roll button
6. ✅ RollHistory displays with Figma styling (card-based, scrollable)
7. ✅ PlayerList matches Figma collapsible drawer design with player badges
8. ✅ Lucide React icons integrated (Dices, Users, Copy, Settings, Wifi/WifiOff)
9. ✅ Mobile responsive per Figma breakpoints (sm: 640px, md: 768px, lg: 1024px)
10. ✅ All Socket.io event handlers unchanged (NO Supabase REST API calls)
11. ✅ All E2E tests still pass (18/18 - 100%)
12. ✅ Dark mode support via CSS custom properties (optional)

---

## Tasks / Subtasks

### Task 1: Install shadcn/ui and Design System Dependencies

- [ ] Install shadcn/ui CLI: `pnpm dlx shadcn@latest init`
  - [ ] Configure for TypeScript, Tailwind CSS, CSS variables
  - [ ] Set base color to "neutral" (matches Figma design)
  - [ ] Install components: Button, Input, Card, Badge, Separator, ScrollArea, Dialog
- [ ] Install Lucide React icons: `pnpm add lucide-react`
- [ ] Install class-variance-authority: `pnpm add class-variance-authority`
- [ ] Copy design tokens from `docs/uex/figma-design/src/styles/globals.css` to `frontend/src/styles/globals.css`
- [ ] Verify: Run `pnpm run dev`, check styles load correctly
- [ ] Commit: "feat(frontend): Install shadcn/ui design system and Figma design tokens"

### Task 2: Migrate HomePage to Figma Design

- [ ] Reference: `docs/uex/figma-design/src/components/HomePage.tsx`
- [ ] Update `frontend/src/pages/Home.tsx`:
  - [ ] Import shadcn Button, Input, Card components
  - [ ] Import Lucide icons: Dices, Plus, Users
  - [ ] Replace current form inputs with shadcn Input components
  - [ ] Replace buttons with shadcn Button (variant="default" for primary, variant="outline" for secondary)
  - [ ] Apply Figma layout: centered card (max-width: 28rem), prominent branding
  - [ ] Add Dices icon to header with brand color
  - [ ] Styling: Use design tokens (--primary, --muted, --radius)
- [ ] Preserve functionality:
  - [ ] Keep all useState hooks for form state
  - [ ] Keep Socket.io event handlers (socket.emit('create_room'), socket.emit('join_room'))
  - [ ] Keep navigation logic (useNavigate)
- [ ] Test: Create room and join room flows work identically
- [ ] Commit: "feat(frontend): Apply Figma design to HomePage"

### Task 3: Migrate RoomView Layout to Figma Design

- [ ] Reference: `docs/uex/figma-design/src/components/RoomView.tsx`
- [ ] Update `frontend/src/pages/RoomView.tsx`:
  - [ ] Import shadcn Card, Badge, Separator components
  - [ ] Import Lucide icons: Copy, Settings, Users, Wifi, WifiOff
  - [ ] Implement three-column responsive layout:
    - [ ] Left: PlayerList (collapsible on mobile)
    - [ ] Center: DiceInput and RollHistory
    - [ ] Right: Room info (room code, copy button, connection status)
  - [ ] Add room code display with Copy button (Lucide Copy icon)
  - [ ] Add connection status indicator (Wifi/WifiOff icon with color)
  - [ ] Apply Card components with proper spacing and shadows
  - [ ] Mobile: Stack vertically, collapsible PlayerList drawer
- [ ] Preserve functionality:
  - [ ] Keep all Zustand store connections (useSocketStore)
  - [ ] Keep Socket.io listeners (useSocket hook)
  - [ ] Keep all business logic unchanged
- [ ] Test: Room view displays correctly, all interactions work
- [ ] Commit: "feat(frontend): Apply Figma design to RoomView layout"

### Task 4: Migrate DiceInput to Figma Design

- [ ] Reference: `docs/uex/figma-design/src/components/DiceRoller.tsx`
- [ ] Update `frontend/src/components/DiceInput.tsx`:
  - [ ] Import shadcn Button, Input components
  - [ ] Import Lucide Dices icon
  - [ ] Apply Figma styling to simple 1d20 mode:
    - [ ] Modifier input: shadcn Input with number type
    - [ ] Roll button: shadcn Button (size="lg", prominent styling)
    - [ ] Add Dices icon to Roll button
    - [ ] Formula preview: Muted text showing "1d20+{modifier}"
  - [ ] Styling: Match Figma spacing, colors, and sizing
- [ ] Preserve functionality:
  - [ ] Keep Socket.io emit: socket.emit('roll_dice', { formula })
  - [ ] Keep all state management (useState for modifier)
  - [ ] Keep validation logic
- [ ] Test: Rolling dice works identically to before
- [ ] Commit: "feat(frontend): Apply Figma design to DiceInput (simple mode)"

### Task 5: Migrate RollHistory to Figma Design

- [ ] Reference: `docs/uex/figma-design/src/components/RollHistory.tsx`
- [ ] Update `frontend/src/components/RollHistory.tsx`:
  - [ ] Import shadcn Card, ScrollArea, Badge components
  - [ ] Apply card-based layout for each roll entry:
    - [ ] Player name: Badge component with player color
    - [ ] Formula: Bold text with --primary color
    - [ ] Individual results: Inline with muted color
    - [ ] Total: Large, prominent text
    - [ ] Timestamp: Small, muted text
  - [ ] Wrap in ScrollArea component for smooth scrolling
  - [ ] Add visual separators between rolls (Separator component)
  - [ ] Styling: Match Figma spacing and typography
- [ ] Preserve functionality:
  - [ ] Keep Zustand store connection (rollHistory from store)
  - [ ] Keep auto-scroll behavior
  - [ ] Keep all data display logic
- [ ] Test: Roll history displays correctly with new styling
- [ ] Commit: "feat(frontend): Apply Figma design to RollHistory"

### Task 6: Migrate PlayerList to Figma Design

- [ ] Reference: `docs/uex/figma-design/src/components/PlayerList.tsx`
- [ ] Update `frontend/src/components/PlayerList.tsx`:
  - [ ] Import shadcn Card, Badge components
  - [ ] Import Lucide Users icon
  - [ ] Apply Figma collapsible drawer design:
    - [ ] Header: "Players ({count})" with Users icon
    - [ ] Each player: Badge with online/offline status indicator
    - [ ] Current player: Highlighted with accent color
    - [ ] Mobile: Collapsible with toggle button
  - [ ] Styling: Match Figma player list design
- [ ] Preserve functionality:
  - [ ] Keep Zustand store connection (players from store)
  - [ ] Keep all player display logic
  - [ ] Keep current player highlighting
- [ ] Test: Player list displays and updates correctly
- [ ] Commit: "feat(frontend): Apply Figma design to PlayerList"

### Task 7: Cross-Component Integration Testing

- [ ] Verify all components work together with new design system
- [ ] Test responsive behavior at all breakpoints (mobile, tablet, desktop)
- [ ] Verify Socket.io integration unchanged:
  - [ ] Create room → Socket.io event emitted
  - [ ] Join room → Socket.io event emitted
  - [ ] Roll dice → Socket.io event emitted
  - [ ] Real-time updates received and displayed
- [ ] Visual regression testing:
  - [ ] Compare to Figma designs for alignment
  - [ ] Check spacing, colors, typography consistency
- [ ] Performance testing:
  - [ ] Page load time unchanged or improved
  - [ ] No layout shift or flicker on component mount

### Task 8: E2E Test Validation

- [ ] Run full E2E test suite: `pnpm run test:e2e`
- [ ] Verify all 18 tests pass (100%)
- [ ] If any tests fail due to selector changes:
  - [ ] Update test selectors to match new shadcn/ui components
  - [ ] Use data-testid attributes if needed for stability
  - [ ] Document selector changes in commit message
- [ ] Commit: "test(e2e): Update selectors for Figma design components (if needed)"

### Task 9: Documentation Updates

- [ ] Update `docs/uex/FIGMA_INTEGRATION_PLAN.md`:
  - [ ] Mark Phase 1 components as COMPLETE (HomePage, RoomView, DiceInput, RollHistory, PlayerList)
  - [ ] Document any deviations from Figma design with rationale
  - [ ] Add screenshots or links to deployed preview
- [ ] Create migration notes document:
  - [ ] List all replaced components
  - [ ] Document new dependencies (shadcn/ui, Lucide React)
  - [ ] Note any breaking changes or gotchas for future development
- [ ] Commit: "docs: Mark Phase 1 Figma integration complete for Stories 2.1-2.3"

---

## Dependencies

**Blocks:** None (Stories 2.1-2.3 are complete)
**Blocked By:** None
**Enhances:** Stories 2.1, 2.2, 2.3 (adds professional UI to functional features)

---

## Design Reference

**Figma File:** https://www.figma.com/design/AJJNTekg7IfRQgQ33fr9Jh/D-D-Dice-Roller-Static-Design
**Local Components:** `docs/uex/figma-design/src/components/`
**Integration Plan:** `docs/uex/FIGMA_INTEGRATION_PLAN.md`

---

## Technical Notes

### Socket.io Integration (PRESERVE)

All Socket.io event handlers MUST remain unchanged:

- `socket.emit('create_room', { player_name })`
- `socket.emit('join_room', { room_code, player_name })`
- `socket.emit('roll_dice', { formula })`
- `socket.on('room_created', handleRoomCreated)`
- `socket.on('player_joined', handlePlayerJoined)`
- `socket.on('dice_rolled', handleDiceRolled)`

### Figma vs Current Architecture

**DO NOT MIGRATE:**

- ❌ Supabase REST API calls (don't exist in Figma prototypes)
- ❌ Client-side roll generation (security vulnerability)
- ❌ HTTP polling (replace with WebSocket listeners)

**DO MIGRATE:**

- ✅ UI components and styling
- ✅ Layout and responsive design
- ✅ Design tokens and theme
- ✅ Icon system (Lucide React)

### shadcn/ui Component Mapping

| Current Component          | shadcn/ui Component | Figma Reference      |
| -------------------------- | ------------------- | -------------------- |
| `<button>`                 | `<Button>`          | All buttons          |
| `<input>`                  | `<Input>`           | Form inputs          |
| `<div className="card">`   | `<Card>`            | All card containers  |
| `<span className="badge">` | `<Badge>`           | Player names, status |
| `<hr>`                     | `<Separator>`       | Visual dividers      |
| Custom scrollbar           | `<ScrollArea>`      | Roll history         |

---

## Success Criteria

✅ All acceptance criteria met
✅ E2E tests passing (18/18)
✅ Visual parity with Figma design (>90% match)
✅ No Socket.io integration broken
✅ Mobile responsive and accessible
✅ Zero console errors or warnings
✅ Performance unchanged or improved
