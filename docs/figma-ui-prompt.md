# Figma AI Prompt: D&D Dice Roller UI Design

## Project Overview
Design a mobile-first, web-based multiplayer D&D dice roller interface for real-time shared dice rolling with complete transparency and trust. The app is used during actual D&D game sessions with zero friction entry - no accounts, just create/join a room and play.

## Design Philosophy
**"Get out of the way"** - The interface should be invisible during gameplay. Players think about their game, not the tool. Trust through transparency - all rolls visible, complete history, no hidden behavior.

---

## Page 1: Home Page (Landing + Room Entry)

### Layout
- **Centered card design** on clean background
- **Large, friendly heading**: "D&D Dice Roller"
- **Tagline**: "Roll dice together in real-time"

### Primary Actions (Stacked vertically)
1. **"Create Room" button** - Large, primary color, prominent
2. **"Join Room" button** - Large, secondary color, equally prominent

### Create Room Flow (Modal/Inline)
- Input: Player name (20 char max)
- Button: "Create Room"
- Result: Display room code prominently (e.g., "ALPHA-1234" in large text)
- Copy link button with visual feedback

### Join Room Flow (Modal/Inline)
- Input: Room code (WORD-#### format, auto-format as user types)
- Input: Player name (20 char max)
- Button: "Join Room"

### Design Details
- **Mobile-optimized**: Touch-friendly buttons (min 44px height)
- **Clean, minimal** aesthetic - avoid clutter
- **High contrast** for accessibility
- **Connection status indicator** in corner (green dot)

---

## Page 2: Room View (Main Game Interface)

### Top Bar (Sticky)
**Left side:**
- Room code badge (e.g., "ALPHA-1234") - always visible
- Copy room link icon button

**Right side:**
- Connection status indicator (online/offline with reconnecting state)
- Room settings menu (3-dot menu)

**Center (DM-led rooms only):**
- DC threshold badge (e.g., "DC: 15") with edit/clear controls
- Prominent, color-coded (green when set)

### Main Content Area (Split vertical layout)

#### Section 1: Dice Roller (Top, Fixed Height)

**Default Mode (Simple):**
- Large "1d20" quick-roll button with +/- modifier input
- Modifier displayed as "+5" or "-2" next to roll button
- **"Roll" button** - Large, action color (green/blue)
- Small "Advanced" toggle link

**Advanced Mode (Revealed on toggle):**
- Dice type selector: d4, d6, d8, d10, d12, d20, d100 (chips/pills)
- Quantity input (1-10)
- Modifier input (+/- with number)
- Advantage/Disadvantage toggle (3-way: None, Advantage, Disadvantage)
- **Hidden roll toggle** (DM only, DM-led rooms only)
- **"Roll" button** - Large, action color

**Preset Rolls (Below main roller):**
- Horizontal scrollable list of saved presets
- Each preset: small chip showing formula (e.g., "Attack: 1d20+5")
- Tap to instant roll
- "+" button to save current configuration as preset

#### Section 2: Roll History (Scrollable Feed)

**Layout:**
- Reverse chronological (newest at top)
- Auto-scroll to top on new roll
- Virtual scrolling (performance for 100+ rolls)

**Each Roll Entry:**
- **Player name** (bold)
- **Timestamp** (relative: "2 seconds ago")
- **Dice formula** (e.g., "1d20+5")
- **Individual die results** displayed as small dice icons or numbers in brackets
  - Example: [18] +5 = 23
  - For multiple dice: [3][5][6] +2 = 16 (3d6+2)
- **Total result** - Large, prominent number
- **Pass/Fail indicator** (if DC set) - Green checkmark / Red X with "Pass" / "Fail" text
- **Advantage/Disadvantage**: Show both die results, highlight the one used
  - Example: Advantage [12][18] +3 = 21 (with [18] highlighted)
- **Permalink icon** - Small share button (copies unique URL)

**Hidden Rolls (DM-led rooms):**
- Non-DM view: "DM rolled hidden d20" (grayed out, no results)
- DM view: Full roll details + "Reveal" button
- After reveal: Full roll details visible to all

**Mode Change Marker:**
- Visual divider when room promotes from Open to DM-led
- Text: "Room promoted to DM-led mode" with timestamp

### Bottom Section: Player List (Collapsible Drawer)

**Collapsed State:**
- Small bar showing player count (e.g., "5 players online")
- Swipe/tap to expand

**Expanded State:**
- List of all players with:
  - Player name
  - Connection status indicator (green dot = online, gray = disconnected)
  - **Kick button** (admin only) - small, danger color
- **DM badge** (DM-led rooms only) - special icon/color for DM player

### Room Settings Menu (Slide-out/Modal)
- **Promote to DM-led** (room creator only, Open rooms only)
  - Select player from dropdown
  - Confirm button
- **Close Room** (admin only) - danger action with confirmation
- **Room Info**: Created time, mode, expiration warning
- **Leave Room** button

---

## Page 3: Permalink Page (Public Roll Verification)

### Layout
- **Centered card** with roll details
- **Heading**: "Verified Roll"
- **Branding**: Small app logo/name at top

### Roll Details (Read-only)
- Player name
- Dice formula
- Individual die results (visual dice icons)
- Total result
- Timestamp (absolute: "Nov 22, 2025 7:45 PM UTC")
- Room code (if room still active, link to join)
- Pass/Fail indicator (if DC was set)

### Actions
- **"Roll Your Own" button** - Links to home page
- Social share buttons (optional)

---

## Design System

### Colors
**Primary:** Bold, saturated blue/purple (trust, gaming)
**Secondary:** Warm orange/gold (D&D theme, energy)
**Success:** Bright green (pass, online, positive)
**Danger:** Red (fail, kick, warnings)
**Neutral:** Dark gray text on light background (or dark mode: light text on dark)

### Typography
- **Headings**: Bold, clear sans-serif (e.g., Inter, Roboto)
- **Body**: Readable sans-serif, 16px minimum
- **Monospace**: For dice formulas and room codes
- **Large numbers**: Roll results should be 24-32px

### Dice Visuals
- Consider: Icon set of dice (d4, d6, d8, d10, d12, d20, d100) for visual appeal
- Alternative: Simple brackets with numbers [18] for simplicity

### Spacing
- **Generous padding** around touch targets (44px min height)
- **Clear visual hierarchy** with whitespace
- **Card-based** design with subtle shadows

### Responsive Behavior
- **Mobile (320-768px)**: Single column, stacked layout
- **Tablet (768-1024px)**: Slightly wider, same layout
- **Desktop (1024px+)**: Centered max-width container (800px), side margins

### Dark Mode (Optional but recommended)
- Toggle in settings
- High contrast maintained
- Reduce eye strain for long game sessions

---

## Animation & Feedback

### Roll Animation
- Brief dice "shake" or "tumble" animation (200-300ms)
- Result "pop in" with slight scale effect
- Confetti/sparkle on natural 20 (optional, subtle)
- Vibration on mobile (optional)

### Connection Status
- Smooth fade between online/reconnecting/offline states
- Pulse animation on "reconnecting"

### Transitions
- Smooth 200ms easing for mode toggles, drawer open/close
- No jarring instant state changes

---

## Accessibility

- **Keyboard navigation**: Tab order, Enter to submit, Esc to close modals
- **Screen reader**: ARIA labels on all controls, live region announcements for rolls
- **High contrast mode**: Support system preference
- **Focus indicators**: Clear blue outline on focused elements
- **Touch targets**: Minimum 44x44px for all interactive elements

---

## Mobile-Specific Considerations

- **One-handed use**: Primary actions reachable with thumb
- **Sticky header**: Room code and DC always visible
- **Collapsible sections**: Minimize vertical scroll
- **Swipe gestures**: Drawer open/close, dismiss modals
- **Auto-focus**: Focus input fields on modal open (with keyboard shown)

---

## Key User Flows to Optimize

1. **Create → Share → Join**: 15 seconds total
2. **Roll dice**: 1-2 seconds (default mode)
3. **DM hidden roll**: 3 seconds (toggle, roll, reveal)
4. **Set DC**: 2 seconds (inline edit)
5. **Promote to DM**: 5 seconds (select, confirm)

---

## Design Constraints

- **No account required**: No login, signup, or profile screens
- **Ephemeral rooms**: Convey temporary nature (expiration warnings)
- **Real-time sync**: Visual feedback that everyone sees the same state
- **Trust indicators**: Permalinks, immutable history reinforce transparency

---

## Inspiration & References

**Style inspiration:**
- Discord (clean, gaming-friendly)
- Notion (card-based, minimal)
- D&D Beyond (theme, gaming aesthetic)

**Avoid:**
- Complex VTT interfaces (Roll20, Foundry) - too busy
- Gamified/playful designs - keep it clean and functional

---

## Deliverables Expected from Figma AI

1. **Home page** with Create/Join flows
2. **Room view** with dice roller (default + advanced) and roll history
3. **Player list drawer** (collapsed + expanded states)
4. **Permalink page** (public verification view)
5. **Mobile responsive** variants (320px, 375px, 768px)
6. **Component library**: Buttons, inputs, cards, badges, modals
7. **Dark mode variant** (optional but recommended)

---

## Design the UI with these principles:

✅ **Mobile-first**: Design for 375px viewport first
✅ **High contrast**: Ensure WCAG AA compliance
✅ **Touch-friendly**: 44px minimum touch targets
✅ **Clean & minimal**: Remove unnecessary elements
✅ **Trust through transparency**: Clear, honest visual language
✅ **Gaming aesthetic**: Subtle D&D theming without being childish
✅ **Real-time feel**: Design conveys live, synchronized state

Generate a modern, professional web app UI that D&D players will trust and love using during their game sessions.
