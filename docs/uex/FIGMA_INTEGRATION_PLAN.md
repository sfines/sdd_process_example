# Figma Design System Integration Plan

## Overview

The D&D Dice Roller Figma design has been created and includes a complete UI implementation. This document outlines how to integrate the Figma-generated components with the existing Socket.io backend architecture.

**Figma File:** https://www.figma.com/design/AJJNTekg7IfRQgQ33fr9Jh/D-D-Dice-Roller-Static-Design
**Local Components:** `/docs/uex/figma-design/src/components/`

## Design System Analysis

### 1. Component Architecture

**Location:** `docs/uex/figma-design/src/components/`

**Main Components:**

- `HomePage.tsx` - Landing page with Create/Join room flows
- `RoomView.tsx` - Main game interface with dice roller and roll history
- `DiceRoller.tsx` - Dice rolling interface (simple and advanced modes)
- `RollHistory.tsx` - Scrollable roll history feed
- `PlayerList.tsx` - Collapsible player list drawer
- `RoomSettings.tsx` - Room configuration modal
- `PermalinkPage.tsx` - Public roll verification page

**UI Primitives:** `docs/uex/figma-design/src/components/ui/`

- Built on **Radix UI** primitives
- Uses **class-variance-authority** for variant management
- **shadcn/ui** style component library

### 2. Design Tokens

**Location:** `docs/uex/figma-design/src/styles/globals.css`

**Token System:**

```css
:root {
  --primary: #030213; /* Dark blue/black */
  --secondary: oklch(0.95 0.0058 264.53);
  --destructive: #d4183d; /* Red for danger actions */
  --muted: #ececf0; /* Light gray */
  --accent: #e9ebef; /* Subtle highlight */
  --radius: 0.625rem; /* 10px border radius */
}
```

**Color Palette:**

- Primary: Dark blue (#030213) - Trust, gaming aesthetic
- Destructive: Red (#d4183d) - Danger, kick, warnings
- Muted: Light gray (#ececf0) - Secondary UI elements
- Dark mode: Full oklch() color system with auto-conversion

### 3. Styling Approach

**Framework:** Tailwind CSS
**Methodology:** Utility-first CSS
**Responsive:** Mobile-first design (min-width breakpoints)
**Theme:** CSS custom properties for theming

**Example from Button component:**

```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        lg: 'h-10 px-6',
      },
    },
  },
);
```

### 4. Icon System

**Library:** Lucide React
**Import Pattern:** Named imports from `lucide-react`
**Usage:**

```typescript
import { Dices, Copy, Settings, Users, Wifi, WifiOff } from 'lucide-react';
```

**Common Icons:**

- `Dices` - Dice roller, branding
- `Copy` - Copy room code/permalink
- `Settings` - Room settings
- `Users` - Player list
- `Wifi`/`WifiOff` - Connection status
- `Eye`/`EyeOff` - Hidden roll toggle

### 5. Key Differences from Current Implementation

#### Current Backend (FastAPI + Socket.io)

**Location:** `backend/src/sdd_process_example/`

- Redis-based room state management
- Server-side roll generation with `secrets` module
- Pydantic models for validation
- Socket.io event-driven architecture
- No Supabase dependency

#### Figma Frontend (React + REST API)

**Location:** `docs/uex/figma-design/src/`

- Supabase REST API calls (polling-based)
- Client-side roll generation (NOT SECURE)
- useState for local state management
- HTTP polling for updates
- Supabase authentication placeholders

**Critical Issues to Address:**

1. **Security:** Figma components have client-side roll generation - MUST be replaced with Socket.io events
2. **Architecture:** REST polling vs. WebSocket real-time updates
3. **State Management:** Local state vs. Zustand store with Socket.io sync
4. **API Layer:** Supabase calls need to be replaced with Socket.io event emitters

## Integration Strategy

### Phase 1: Component Migration (Preserve UI, Replace Logic)

**Objective:** Move Figma UI components into `frontend/src/components/` and replace API calls with Socket.io events

**Tasks:**

1. Copy UI primitive components from `docs/uex/figma-design/src/components/ui/` → `frontend/src/components/ui/`
2. Copy design tokens from `docs/uex/figma-design/src/styles/globals.css` → `frontend/src/styles/globals.css`
3. Migrate main components one-by-one, replacing:
   - Supabase REST calls → Socket.io events
   - Client-side roll generation → `socket.emit('roll_dice')` events
   - Polling → WebSocket listeners
   - Local state → Zustand store

**Example Migration (DiceRoller):**

```typescript
// BEFORE (Figma - BAD)
const handleRoll = () => {
  const result = Math.floor(Math.random() * 20) + 1; // Client-side!
  fetch('https://supabase.../rolls', {
    method: 'POST',
    body: JSON.stringify({ result }),
  });
};

// AFTER (Socket.io - GOOD)
const handleRoll = () => {
  socket.emit('roll_dice', {
    room_code: roomCode,
    dice_type: 20,
    quantity: 1,
    modifier: 0,
  });
};
```

### Phase 2: State Management Integration

**Objective:** Connect Figma UI to existing Zustand stores

**Current Stores:**

- `frontend/src/store/roomStore.ts` - Room state
- `frontend/src/store/socketStore.ts` - Socket connection state

**Socket.io Event Flow:**

```
Component → socket.emit() → Backend → socket.on() → Zustand Store → Component Re-render
```

**Key Patterns:**

```typescript
// In component
import { useRoomStore } from '@/store/roomStore';
import { useSocket } from '@/hooks/useSocket';

const { socket } = useSocket();
const { roomCode, players, rolls } = useRoomStore();

// Emit event
socket.emit('join_room', { room_code, player_name });

// Listen in custom hook (useSocket.ts)
socket.on('player_joined', (data) => {
  useRoomStore.getState().updatePlayers(data.players);
});
```

### Phase 3: Design System Documentation

**Create:** `frontend/src/components/ui/README.md`

**Document:**

1. Component inventory and usage
2. Variant combinations (button types, sizes)
3. Theming and color tokens
4. Accessibility patterns
5. Mobile-responsive behaviors

### Phase 4: Testing & Validation

**Checklist:**

- [ ] All UI matches Figma designs (visual regression)
- [ ] All rolls are server-side generated
- [ ] Real-time sync works (multi-player test)
- [ ] Mobile responsive (320px, 375px, 768px)
- [ ] Dark mode functional
- [ ] Accessibility (keyboard nav, ARIA labels)
- [ ] Security: No client-side randomness

## File Mapping

| Figma Component     | Target Location                            | Status     | Notes                                  |
| ------------------- | ------------------------------------------ | ---------- | -------------------------------------- |
| `HomePage.tsx`      | `frontend/src/pages/Home.tsx`              | ⏳ Pending | Replace Supabase with Socket.io        |
| `RoomView.tsx`      | `frontend/src/pages/Room.tsx`              | ⏳ Pending | Integrate with roomStore               |
| `DiceRoller.tsx`    | `frontend/src/components/DiceRoller.tsx`   | ⏳ Pending | **CRITICAL:** Remove client-side rolls |
| `RollHistory.tsx`   | `frontend/src/components/RollHistory.tsx`  | ⏳ Pending | Sync with Socket.io events             |
| `PlayerList.tsx`    | `frontend/src/components/PlayerList.tsx`   | ⏳ Pending | Use roomStore.players                  |
| `RoomSettings.tsx`  | `frontend/src/components/RoomSettings.tsx` | ⏳ Pending | Socket.io events for promote/kick      |
| `PermalinkPage.tsx` | `frontend/src/pages/Permalink.tsx`         | ⏳ Pending | Use backend REST endpoint              |
| `ui/*`              | `frontend/src/components/ui/*`             | ⏳ Pending | Copy as-is (Radix + Tailwind)          |

## Critical Security Requirements

⚠️ **NEVER implement these Figma patterns:**

1. **Client-side roll generation:**

   ```typescript
   // ❌ BAD - From Figma
   const rollDice = (sides: number) => Math.floor(Math.random() * sides) + 1;

   // ✅ GOOD - Socket.io event
   socket.emit('roll_dice', { dice_type: 20, quantity: 1 });
   ```

2. **Direct state mutation:**

   ```typescript
   // ❌ BAD
   setRolls([...rolls, newRoll]);

   // ✅ GOOD - Let Socket.io listener update store
   socket.on('roll_result', (data) => {
     useRoomStore.getState().addRoll(data);
   });
   ```

3. **Polling instead of WebSockets:**

   ```typescript
   // ❌ BAD
   setInterval(() => fetch('/api/rolls'), 1000);

   // ✅ GOOD
   socket.on('roll_result', handleNewRoll);
   ```

## Next Steps

1. **Review this plan** with team
2. **Create Epic 3: UI Integration** in `docs/sprint-artifacts/`
3. **Break into stories:**
   - 3.1: Migrate UI primitive components
   - 3.2: Integrate HomePage with Socket.io
   - 3.3: Integrate RoomView (dice roller + history)
   - 3.4: Implement PlayerList and RoomSettings
   - 3.5: Create PermalinkPage
   - 3.6: Mobile responsive testing
   - 3.7: Dark mode implementation
4. **Update ADRs** for UI component architecture decisions
5. **Run security audit** on migrated components

## References

- **Figma Design:** https://www.figma.com/design/AJJNTekg7IfRQgQ33fr9Jh/
- **Architecture ADR:** `docs/architecture/adrs/001-socket-io-architecture.md`
- **Python Standards:** `docs/standards/02-python-standards.md`
- **TypeScript Standards:** `docs/standards/03-typescript-standards.md`
- **Socket.io Events:** `backend/src/sdd_process_example/socket_manager.py`
- **Zustand Stores:** `frontend/src/store/`

---

**Last Updated:** 2025-11-23
**Status:** Draft - Ready for Review
