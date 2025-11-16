# Product Brief: D&D Dice Roller

**Date:** 2025-11-15
**Author:** Steve
**Context:** Personal/Gaming Project

---

## Executive Summary

A multiplayer D&D dice roller web application that enables gaming groups to share dice rolls in real-time. The application supports all standard D&D dice types (d4, d6, d8, d10, d12, d20, d100) with advanced features including advantage/disadvantage mechanics, modifiers, DM hidden rolls, DC threshold checks, and roll history. Built with a Python backend (FastAPI) and TypeScript/React frontend, the solution provides ephemeral game rooms that players can join via simple room codes. This is a focused dice rolling tool designed for actual weekly D&D table use, not a full virtual tabletop platform.

---

## Core Vision

### Problem Statement

D&D players need a reliable way to share dice rolls with their gaming group, especially when playing remotely or in hybrid settings. Current solutions either lack multiplayer synchronization, are buried within complex VTT platforms, or don't support the specific D&D mechanics that players need (advantage/disadvantage, hidden DM rolls, DC checks). Players want something simple, focused, and trustworthy - where everyone sees the same rolls at the same time, and there's no question about the integrity of the results.

Additionally, many D&D groups have DMs who aren't comfortable with technology or prefer to focus on the narrative without managing digital tools. These groups still need shared dice rolling for remote/hybrid players, just without special DM features.

The core frustration: **"We just need to roll dice together and trust the results - why is this so complicated?"**

### Proposed Solution

A dedicated web-based D&D dice roller that does one thing exceptionally well: synchronized multiplayer dice rolling. Players join ephemeral game rooms via simple room codes, roll from their own devices, and instantly see each other's results in a shared dice tray. The DM has special privileges for hidden rolls and setting DC thresholds. Roll history provides a complete audit trail so nobody can be accused of cheating. The interface is clean and focused - no character sheets, no maps, no bloat - just reliable, trustworthy dice rolling for D&D tables.

### Key Differentiators

- **Multiplayer-first design**: Real-time synchronization is core, not an afterthought
- **D&D-specific mechanics**: Native support for advantage/disadvantage, not generic dice rolling
- **DM tools built-in**: Hidden rolls and DC threshold checks address actual table needs
- **Focused simplicity**: Not trying to be a VTT - just excellent dice rolling
- **Trustworthy history**: Complete roll audit trail prevents cheating concerns
- **Zero friction entry**: No accounts required, just create/join a room and play
- **Roll Permalinks** (killer feature): Every roll gets a unique shareable URL that anyone can verify later - perfect for resolving disputes or sharing epic moments on social media

---

## Target Users

### Primary Users

**D&D Players (4-6 per table)**

- Play weekly or bi-weekly campaigns
- Mix of in-person, remote, or hybrid sessions
- Want focus on gameplay, not fighting with tools
- Need to trust that rolls are fair and visible to all
- Range from casual players to rules-focused optimizers
- Current frustration: Managing physical dice remotely or trusting individual roll apps

**Dungeon Masters**

- Run the game and need additional controls
- Make hidden rolls for NPCs, traps, secret checks
- Set DC thresholds for skill checks and saves
- Need to maintain game flow without technical interruptions
- Want simple room management (create, share code, kick disruptive players)
- Current frustration: Lack of good tools for hidden rolls in multiplayer contexts

**Groups with Non-Technical DMs**

- DM prefers pen-and-paper or isn't comfortable with digital tools
- Remote/hybrid players need to share dice rolls with the group
- Don't need special DM features, just synchronized rolling
- Want the simplest possible experience (no extra buttons or options)
- Current frustration: Existing tools assume DM will manage the technology

---

## MVP Scope

### Core Features

**Dice Rolling Engine:**

- All D&D dice types: d4, d6, d8, d10, d12, d20, d100
- Multiple dice rolls (e.g., 3d6, 8d10)
- Modifiers (+5, -2, etc.)
- Advantage/Disadvantage mechanics (roll 2d20, highlight which is used)
- Roll results instantly displayed to all players

**Multiplayer Rooms:**

- Ephemeral rooms (no persistence for MVP)
- **Room modes**: DM-led (with special privileges) or Open (all players equal)
- **Default mode**: Open (room creator can convert to DM-led via Promote to DM)
- **Room code format**: WORD-#### (e.g., ALPHA-1234) - easy to read, type, and share verbally
- Simple room code generation and joining
- Player identification (enter name on join)
- Real-time synchronization via WebSockets
- Room capacity: 8 players maximum
- Room creator has admin privileges (kick players, close room)
- In DM-led mode: DM has additional special features (hidden rolls, DC setting)

**Roll History:**

- Visible to all players in the room
- Shows: player name, dice rolled, individual results, total, timestamp
- Immutable (cannot be deleted - audit trail)
- Persists for room lifetime

**DM Features (DM-led rooms only):**

- Hidden rolls (only DM sees result initially, can reveal later)
- Set room-wide DC threshold
- All rolls auto-check against DC and show pass/fail
- DM can change or clear DC mid-session

**Open Room Mode:**

- All players have equal privileges
- No hidden rolls (all rolls visible to everyone)
- No DC threshold setting (players can manually note success/failure)
- Room creator retains admin privileges (kick/close room only)
- **Promote to DM-led**: Room creator can convert Open room to DM-led mode and designate a DM mid-session
  - Existing rolls remain in history with visual separator/timestamp showing mode change
  - Roll history displays "Room promoted to DM-led mode" marker at transition point

**Roll Presets:**

- Players save frequently-used rolls ("Longsword Attack: 1d20+5")
- Stored in browser localStorage (per-player, not synced)
- Quick-access buttons for saved rolls

**User Interface:**

- Shared roll history visible to all
- **Simplified roll input**: Default one-tap experience for common 1d20+modifier rolls, with "Advanced" toggle for multiple dice/special mechanics
- DC display when set by DM
- Clear visual indicators for pass/fail on DC checks
- Mobile-responsive design with collapsible roll history drawer
- Connection status indicator (connected/reconnecting/disconnected)
- **Roll Permalinks**: Copy/share button on any roll result (permalinks persist for 30 days after creation)
- **Room expiration warnings**: Visual indicator at 3 minutes before expiry, second warning at 30 seconds

### Out of Scope for MVP

- User accounts or authentication
- Persistent rooms or campaign history
- Character sheet integration
- Damage tracking or HP management
- Initiative tracking
- Dice rolling statistics or analytics
- Custom dice types beyond standard D&D
- Animated 3D dice (keeping it 2D for performance)
- Cross-device preset synchronization
- Room password protection
- Private messaging between players

### MVP Success Criteria

- Steve's D&D group uses it for an actual game session
- All players can see rolls in real-time (< 500ms latency)
- DM hidden rolls work reliably
- Roll history provides trustworthy audit trail
- **Less than 3 minor issues** during 3-hour session (realistic expectation)
- Graceful handling of network hiccups (reconnection works)
- Players prefer it over previous solution
- **Fallback mode**: If WebSockets fail, local rolling with manual share option available

### Future Vision

**Phase 2 (Post-MVP):**

- Persistent rooms tied to campaigns
- Roll statistics and probability insights
- Integration with D&D Beyond or other character management tools
- Custom dice macros (complex roll formulas)
- Room password protection
- Voice/video chat integration

**Phase 3 (Long-term):**

- Mobile native apps (iOS/Android)
- Dice collections (custom dice skins/themes)
- Initiative tracker (lightweight, stays focused)
- Export roll logs to PDF
- API for third-party integrations

---

## Technical Preferences

**Backend:**

- Python (Steve's preferred language)
- FastAPI for REST endpoints and WebSocket management
- python-socketio for real-time communication
- Pydantic for data validation
- **Server-side roll generation** for security (client displays results only)
- In-memory storage with Redis backup for room state persistence across deploys
- **Permalink storage**: Lightweight database (SQLite or PostgreSQL) for 30-day roll permalink persistence
- **Room auto-expiration**:
  - DM-led rooms: 30 minutes after last activity
  - Open rooms: 5 hours after last roll
- **DM reconnection grace period**: 60-second window before DM-led room terminates
- pydantic-to-typescript for type synchronization between backend/frontend

**Frontend:**

- TypeScript + React
- Socket.io-client for real-time sync with automatic reconnection logic
- Zustand or Context API for state management
- Tailwind CSS for styling
- 2D interface (no WebGL/3D animations)
- Progressive Web App (PWA) capabilities for better mobile experience

**Infrastructure:**

- **VPS deployment** (DigitalOcean/Linode) for reliable WebSocket support and always-on server
- Single server initially (sufficient for personal use + small user base)
- Simple deployment via Docker + docker-compose
- SSL certificate (Let's Encrypt) for secure WebSocket connections

---

## Risks and Assumptions

**Key Risks:**

1. **WebSocket reliability**: Dropped connections could break multiplayer experience
   - _Mitigation_: Automatic reconnection with exponential backoff, connection status indicator, 60s grace period for DM reconnection
2. **Room creator disconnect**: If room creator leaves, room needs continuity
   - _DM-led rooms_: Room persists for the 30 min grace period
   - _Open rooms_: Room persists; oldest remaining player becomes new room admin
3. **Room spam/abuse**: Anyone can create rooms, could be abused
   - _Mitigation_: Room auto-expiration (DM-led: 30 min idle, Open: 5 hours after last roll), rate limiting (1 room per IP per 5 minutes), simple CAPTCHA on room creation
4. **Cheating concerns**: Could players manipulate rolls?

   - _Mitigation_: All rolls generated server-side with cryptographic randomness, clients receive and display results only

5. **Kicked player re-entry**: Kicked players can rejoin with different names

   - _Mitigation_: Session-based kick tracking (IP + browser fingerprint), kicked sessions blocked for room lifetime

6. **Race conditions**: Simultaneous rolls could cause ordering issues

   - _Mitigation_: Server-side timestamp + sequence number for deterministic history ordering

7. **Load/Performance**: Roll history with 500+ rolls could slow down UI

   - _Mitigation_: Virtual scrolling for history, pagination after 100 visible rolls

8. **Browser compatibility**: Safari iOS has known WebSocket quirks
   - _Mitigation_: Explicit testing on iOS Safari 16+, fallback to long-polling if WebSocket fails

**Assumptions:**

- D&D groups are small (4-7 people) - scaling to 8 concurrent users per room is sufficient
- Players have reasonably stable internet (3G or better)
- Browser compatibility: Modern Chrome, Firefox, Safari (last 2 versions), explicit iOS Safari support
- Responsive web sufficient for MVP; native apps deferred to Phase 2
- Most players are trusted, but basic accountability needed (session-based kick tracking)
- Spectator mode deferred to Phase 2 (not critical for MVP)
- Desktop testing prioritized first, mobile optimization in Week 8-9

---

## Timeline Constraints

**Target Timeline:**

- **Week 1**: Architecture & Walking Skeleton (create room → join → roll → view - basic flow without DM features)
- **Week 2-3**: Backend Core (WebSocket handling, room management, roll generation, reconnection logic)
- **Week 4-6**: Frontend Development (UI, roll input, history, DM features, mobile responsive)
- **Week 7**: Integration & Edge Cases (race conditions, disconnect handling, kick tracking)
- **Week 8-9**: Testing & Polish (load testing, iOS Safari testing, UX refinements)
- **Week 10**: Buffer for unknowns (WebSocket debugging, performance tuning)
- **Total to MVP**: 8-10 weeks (realistic estimate accounting for technical debt)

**Critical Milestone:**

- **Week 1**: Walking skeleton working end-to-end
- **Week 5**: Internal alpha testing with Steve solo
- **Week 8**: Beta test with Steve's D&D group
- **Week 10**: MVP ready for campaign use

**No hard deadlines** - this is a personal project, prioritizing quality over speed, but structured milestones keep progress visible

---

_This Product Brief captures the vision and requirements for D&D Dice Roller._

_It was created through collaborative discovery and reflects the unique needs of this Personal/Gaming Project project._

_Next: Use the PRD workflow to create detailed product requirements from this brief._
