# Figma Design System - D&D Dice Roller

## Overview

**Figma File:** https://www.figma.com/design/AJJNTekg7IfRQgQ33fr9Jh/D-D-Dice-Roller-Static-Design

This document provides a visual reference and integration guide for the Figma-designed UI components.

## Design Screenshots

### Home Page

The landing page with Create Room and Join Room options. Features:

- Centered card design on dark background
- Purple-to-blue gradient primary button
- White secondary button (Join Room)
- Connection status indicator (green dot)
- Dice icon branding
- Clean, minimal aesthetic

![Home Page](Shown in screenshots - Create Room and Join Room buttons)

### Join Room Modal

Modal dialog for joining an existing room. Features:

- Room code input (ALPHA-1234 format)
- Player name input (0/20 character counter)
- Purple gradient Join Room button
- Connection status at bottom
- Close button (X) in top right

### Create Room Modal

Similar to Join Room but for creating a new room:

- Player name input only
- Room code generated after creation
- Success state shows room code prominently
- Copy link functionality

### Room View (Main Game Interface)

**Not yet captured - requires node ID from user**

Expected features based on specifications:

- Top bar: Room code badge, copy button, connection status, settings menu
- DC threshold badge (DM-led rooms only)
- Dice roller section (simple and advanced modes)
- Roll history feed (scrollable, virtual scrolling)
- Player list drawer (collapsible)

## Color Palette (from Design Tokens)

### Light Mode

```css
--primary: #030213 /* Dark blue/black - primary actions */ --secondary: #f3f3f5
  /* Light purple-gray - secondary buttons */ --destructive: #d4183d
  /* Red - danger actions */ --muted: #ececf0 /* Light gray - disabled/muted */
  --accent: #e9ebef /* Subtle highlight */ --background: #ffffff
  /* Page background */ --foreground: oklch(0.145 0 0) /* Text color (dark) */;
```

### Dark Mode

```css
--background: oklch(0.145 0 0) /* Dark background */
  --foreground: oklch(0.985 0 0) /* Light text */ --primary: oklch(0.985 0 0)
  /* Inverted for dark mode */;
```

### Gradient (Primary Button)

- Purple to Blue gradient
- `from-purple-600 to-blue-600` in Tailwind
- Hover state: slightly darker (`hover:from-purple-700 hover:to-blue-700`)

## Typography

### Font Family

- **Primary:** System font stack (likely Inter or Roboto)
- **Monospace:** For room codes and dice formulas

### Font Sizes

```css
--font-size: 16px /* Base */;
```

### Font Weights

```css
--font-weight-medium: 500 /* Headings, buttons */ --font-weight-normal: 400
  /* Body text */;
```

### Scale (from Tailwind)

- `text-xs` (12px) - Character counter, timestamps
- `text-sm` (14px) - Body text, labels
- `text-base` (16px) - Default
- `text-lg` (18px) - Subheadings
- `text-xl` (20px) - Headings
- `text-2xl` (24px) - Large headings, room codes
- `text-3xl` (30px) - Large roll results

## Spacing System

### Border Radius

```css
--radius: 0.625rem /* 10px - consistent across all components */;
```

### Padding Scale (Tailwind)

- `p-2` (8px) - Tight spacing
- `p-4` (16px) - Default component padding
- `p-6` (24px) - Card padding
- `p-8` (32px) - Large sections

### Gap Scale

- `gap-2` (8px) - Between related items
- `gap-4` (16px) - Between sections
- `gap-6` (24px) - Between major sections

## Component Variants

### Button Variants

1. **Default (Primary)**
   - Gradient: Purple to Blue
   - White text
   - Hover: Darker gradient
   - Use for: Primary actions (Create Room, Roll)

2. **Secondary**
   - Light gray background
   - Dark text
   - Hover: Slightly darker
   - Use for: Secondary actions (Join Room)

3. **Destructive**
   - Red background
   - White text
   - Hover: Darker red
   - Use for: Danger actions (Kick Player, Close Room)

4. **Outline**
   - Transparent with border
   - Dark text
   - Hover: Light background
   - Use for: Tertiary actions

5. **Ghost**
   - Transparent
   - Dark text
   - Hover: Light background
   - Use for: Icon buttons, minimal actions

### Button Sizes

- `sm` - 32px height (8px vertical padding)
- `default` - 36px height (9px vertical padding)
- `lg` - 40px height (10px vertical padding)
- `icon` - 36x36px square

### Input Variants

- **Default:** Light gray background, transparent border
- **Focus:** Ring with primary color
- **Error:** Red ring, red border
- **Disabled:** Muted background, reduced opacity

### Badge Variants

- **Default:** Gray background, dark text (room codes)
- **Success:** Green background, white text (online status)
- **Destructive:** Red background, white text (offline)
- **Secondary:** Light background, dark text

## Icons (Lucide React)

### Key Icons Used

| Icon          | Usage                 | Context               |
| ------------- | --------------------- | --------------------- |
| `Dices`       | Branding, roll button | Homepage, dice roller |
| `Copy`        | Copy room code/link   | Room view, permalink  |
| `Settings`    | Room settings         | Top bar menu          |
| `Users`       | Player list           | Player drawer         |
| `Wifi`        | Online status         | Connection indicator  |
| `WifiOff`     | Offline status        | Connection indicator  |
| `Eye`         | Show hidden roll      | DM hidden rolls       |
| `EyeOff`      | Hide roll             | DM hidden roll toggle |
| `ChevronDown` | Expand                | Collapsible sections  |
| `ChevronUp`   | Collapse              | Collapsible sections  |
| `Plus`        | Add preset            | Preset rolls          |
| `X`           | Close                 | Modal dialogs         |

### Icon Sizing

- Small: `size-3` (12px) - Inline with text
- Default: `size-4` (16px) - Buttons, badges
- Large: `size-6` (24px) - Branding, headers
- Extra Large: `size-8` (32px) - Hero sections

## Responsive Breakpoints

### Mobile (Default - 320px+)

- Single column layout
- Stacked buttons
- Full-width cards
- Collapsible sections

### Tablet (768px+)

- Slightly wider cards (max-width: 600px)
- Same single column layout
- More padding around content

### Desktop (1024px+)

- Centered layout (max-width: 800px)
- Side margins for breathing room
- Same functionality as mobile (no multi-column)

## Animation & Transitions

### Durations

- **Fast:** 150ms - Hover states, button feedback
- **Default:** 200ms - Modal open/close, drawer slide
- **Slow:** 300ms - Page transitions, complex animations

### Easing

- **Default:** `ease-in-out` for most transitions
- **Spring:** For playful feedback (dice roll animation)

### Key Animations

1. **Modal Open/Close:** Fade + scale
2. **Drawer Slide:** Translate Y
3. **Button Hover:** Background color transition
4. **Dice Roll:** Brief shake/tumble (200-300ms)
5. **Roll Result:** Pop in with scale effect
6. **Connection Status:** Pulse animation on "reconnecting"

## Accessibility Features

### Focus States

- **Ring:** 3px solid ring with primary color
- **Offset:** 2px from element
- **Visible:** Always visible on keyboard focus

### ARIA Labels

All interactive elements include proper ARIA labels:

```typescript
<Button aria-label="Roll 1d20 dice">
  <Dices />
  Roll
</Button>
```

### Screen Reader Support

- Live regions for roll announcements
- Semantic HTML (button, nav, main, aside)
- Proper heading hierarchy (h1 → h2 → h3)

### Keyboard Navigation

- Tab order: Logical flow (top to bottom, left to right)
- Enter: Submit forms, activate buttons
- Escape: Close modals, cancel actions
- Arrow keys: Navigate lists (player list, roll history)

### Touch Targets

- Minimum 44x44px for all interactive elements
- Generous padding around buttons
- Swipe gestures for drawer open/close

## Dark Mode Implementation

### Toggle Method

```typescript
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Check preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

### Color Adjustments

- Background: Light → Dark
- Text: Dark → Light
- Borders: Subtle → More pronounced
- Shadows: Deep → Minimal

## Integration Checklist

### Phase 1: UI Primitives

- [ ] Copy `docs/uex/figma-design/src/components/ui/` → `frontend/src/components/ui/`
- [ ] Copy design tokens from `globals.css`
- [ ] Configure Tailwind with custom colors
- [ ] Test button variants
- [ ] Test input variants
- [ ] Test badge variants
- [ ] Verify icon imports work

### Phase 2: Feature Components

- [ ] Migrate `HomePage.tsx` (replace Supabase with Socket.io)
- [ ] Migrate `RoomView.tsx` (connect to roomStore)
- [ ] Migrate `DiceRoller.tsx` (remove client-side roll generation)
- [ ] Migrate `RollHistory.tsx` (Socket.io event listeners)
- [ ] Migrate `PlayerList.tsx` (use roomStore.players)
- [ ] Migrate `RoomSettings.tsx` (Socket.io events for admin actions)
- [ ] Migrate `PermalinkPage.tsx` (REST endpoint for public view)

### Phase 3: Testing

- [ ] Visual regression test (compare with Figma screenshots)
- [ ] Mobile responsive (320px, 375px, 768px)
- [ ] Dark mode toggle works
- [ ] Keyboard navigation works
- [ ] Screen reader announcements work
- [ ] All rolls are server-side generated
- [ ] Real-time sync works (multi-player test)

### Phase 4: Documentation

- [ ] Update component README with usage examples
- [ ] Document custom hooks (useSocket, useRoom)
- [ ] Create Storybook stories (optional)
- [ ] Add inline comments for complex logic

## Key Differences from Figma Code

### ❌ Remove These Patterns

1. **Client-side roll generation:**

   ```typescript
   // BAD - From Figma
   const rollDice = (sides: number) => Math.floor(Math.random() * sides) + 1;
   ```

2. **Supabase REST API calls:**

   ```typescript
   // BAD - From Figma
   fetch(`https://${projectId}.supabase.co/functions/...`);
   ```

3. **Polling for updates:**

   ```typescript
   // BAD - From Figma
   useEffect(() => {
     const interval = setInterval(fetchRolls, 1000);
     return () => clearInterval(interval);
   }, []);
   ```

4. **Local state for room data:**
   ```typescript
   // BAD - From Figma
   const [rolls, setRolls] = useState<Roll[]>([]);
   ```

### ✅ Replace With

1. **Socket.io event emission:**

   ```typescript
   socket.emit('roll_dice', { room_code, dice_type: 20, quantity: 1 });
   ```

2. **Socket.io event listeners:**

   ```typescript
   socket.on('roll_result', (data) => {
     useRoomStore.getState().addRoll(data);
   });
   ```

3. **Zustand store access:**
   ```typescript
   const { rolls, players, roomCode } = useRoomStore();
   ```

## File Structure After Migration

```
frontend/src/
├── components/
│   ├── ui/                    # Copied from Figma (no changes)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── DiceRoller.tsx         # Migrated (Socket.io integrated)
│   ├── RollHistory.tsx        # Migrated (Socket.io listeners)
│   ├── PlayerList.tsx         # Migrated (roomStore)
│   └── RoomSettings.tsx       # Migrated (Socket.io events)
├── pages/
│   ├── Home.tsx               # Migrated (Socket.io)
│   ├── Room.tsx               # Migrated (Socket.io + roomStore)
│   └── Permalink.tsx          # Migrated (REST endpoint)
├── hooks/
│   ├── useSocket.ts           # NEW - Socket.io connection
│   └── useRoom.ts             # NEW - Room management
├── store/
│   ├── roomStore.ts           # EXISTING - Room state
│   └── socketStore.ts         # EXISTING - Socket state
├── styles/
│   └── globals.css            # Copied from Figma + tokens
└── App.tsx                    # Router setup
```

## Next Steps

1. **Review Figma file** - Get node IDs for Room View and other screens
2. **Take screenshots** - Document all screens for reference
3. **Create Epic 3** - UI Integration epic in sprint artifacts
4. **Break into stories** - One story per component migration
5. **Start migration** - Begin with UI primitives, then feature components
6. **Test continuously** - Visual regression + functional testing
7. **Security audit** - Verify no client-side randomness

## References

- **Figma File:** https://www.figma.com/design/AJJNTekg7IfRQgQ33fr9Jh/
- **Local Components:** `docs/uex/figma-design/src/components/`
- **Integration Plan:** `docs/uex/FIGMA_INTEGRATION_PLAN.md`
- **Design System Rules:** `.cursor/rules/design_system_rules.md`
- **Socket.io Events:** `backend/src/sdd_process_example/socket_manager.py`
- **Zustand Stores:** `frontend/src/store/`

---

**Last Updated:** 2025-11-23
**Status:** Draft - Ready for Implementation
