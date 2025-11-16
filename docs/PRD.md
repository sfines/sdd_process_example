# D&D Dice Roller - Product Requirements Document

**Author:** Steve
**Date:** 2025-11-15
**Version:** 1.0

---

## Executive Summary

A multiplayer D&D dice roller web application enabling gaming groups to share dice rolls in real-time with complete trust and transparency. The application provides ephemeral game rooms supporting all standard D&D dice types (d4-d100), advantage/disadvantage mechanics, DM hidden rolls, DC threshold checks, and permanent roll history. Built for actual weekly D&D table use with zero friction entry - no accounts, just create or join a room and play.

### What Makes This Special

**Roll Permalinks** - Every roll gets a unique shareable URL that persists for 30 days, enabling players to verify rolls later, resolve disputes with permanent proof, and share epic moments on social media. This killer feature transforms dice rolling from ephemeral events into shareable, verifiable moments that build trust and community engagement.

---

## Project Classification

**Technical Type:** Full-Stack Web Application (Real-time multiplayer)
**Domain:** Gaming / Entertainment (D&D tabletop)
**Complexity:** Medium (Real-time synchronization, WebSocket management, state consistency)

**Stack:**

- Backend: Python + FastAPI + python-socketio
- Frontend: TypeScript + React + Socket.io-client
- State: Redis (room persistence) + SQLite/PostgreSQL (permalinks)
- Infrastructure: Docker + GitHub Actions CI/CD + VPS (DigitalOcean/Linode)

---

## Success Criteria

### MVP Success Definition

- **Real-world validation**: Steve's D&D group completes a full 3-hour game session using the application
- **Performance**: All players see rolls in real-time with < 500ms latency
- **Reliability**: DM hidden rolls work consistently without revealing premature data
- **Trust**: Roll history provides complete audit trail with no gaps or inconsistencies
- **Quality**: Less than 3 minor issues during 3-hour session
- **Resilience**: Graceful handling of network hiccups with successful reconnection
- **Preference**: Players prefer this solution over their previous dice rolling method
- **Fallback**: If WebSockets fail completely, local rolling with manual share option is available

### Business Metrics (Phase 2+)

- Daily active users from organic discovery
- Average session length (target: 2-4 hours = typical D&D session)
- Room creation rate
- Permalink sharing frequency (social proof indicator)
- Return user rate (weekly D&D groups coming back)

---

## Product Scope

### MVP - Minimum Viable Product

**Core Functionality:**

1. **Dice Rolling Engine** - All D&D dice (d4, d6, d8, d10, d12, d20, d100), multiple dice (3d6, 8d10), modifiers (+/-), advantage/disadvantage (2d20 with highlight), instant synchronization

2. **Multiplayer Rooms** - Ephemeral rooms with WORD-#### codes (e.g., ALPHA-1234), two modes (Open default, DM-led optional), 8 player capacity, WebSocket real-time sync, room creator admin privileges

3. **Room Modes** - Open (all players equal, no hidden rolls) and DM-led (DM has hidden rolls + DC setting), promotion from Open to DM-led mid-session with visual history marker

4. **Roll History** - Immutable audit trail showing player name, dice formula, individual die results, total, timestamp, DC pass/fail (if set), persists for room lifetime

5. **DM Features** (DM-led rooms only) - Hidden rolls (DM sees first, reveals later), room-wide DC threshold setting, auto pass/fail indicators, mid-session DC updates

6. **Roll Permalinks** - Unique URL per roll, 30-day persistence, copy/share button, public verification page showing full roll details

7. **Roll Presets** - Save frequently-used rolls (e.g., "Longsword Attack: 1d20+5") in browser localStorage, quick-access buttons, per-player (not synced)

8. **User Interface** - Shared roll history feed, simplified 1d20+modifier default input with "Advanced" toggle, DC display badge, pass/fail visual indicators, mobile-responsive with collapsible history drawer, connection status indicator, room expiration warnings (3 min, 30 sec)

**Technical Requirements:**

- Server-side roll generation (cryptographic randomness, no client manipulation)
- Room auto-expiration (DM-led: 30 min idle, Open: 5 hours after last roll)
- DM reconnection grace period (60 seconds before room terminates)
- Session-based kick tracking (IP + browser fingerprint, blocked for room lifetime)
- Race condition handling (server timestamp + sequence number for deterministic ordering)
- Virtual scrolling for roll history (pagination after 100 visible rolls)

### Growth Features (Post-MVP)

- Persistent rooms tied to campaigns (save room state between sessions)
- Roll statistics and probability insights (player performance analytics)
- D&D Beyond character sheet integration (import modifiers automatically)
- Custom dice macros (complex formulas like "2d6+1d8+5")
- Room password protection
- Voice/video chat integration
- Spectator mode (watch-only access)

### Vision (Future)

- Native mobile apps (iOS/Android) for better mobile experience
- Custom dice collections and themes (visual customization)
- Lightweight initiative tracker (stay focused, don't become VTT)
- Roll log export (PDF download of session history)
- Public API for third-party integrations
- Multi-room support (DM running multiple tables)

---

## Web Application Specific Requirements

### Architecture Pattern

**Client-Server Real-Time Architecture:**

- Frontend: Single-page application (SPA) with React
- Backend: FastAPI WebSocket server + REST API for permalinks
- State Management: Redis for active rooms (in-memory with persistence), SQLite/PostgreSQL for permalink storage
- Communication: Socket.io for bidirectional real-time events, automatic reconnection with exponential backoff

### API Specification

#### WebSocket Events (Socket.io)

**Client → Server:**

- `create_room` → `{mode: 'open'|'dm-led', player_name: string}` → Returns `{room_code: string, player_id: string}`
- `join_room` → `{room_code: string, player_name: string}` → Returns `{player_id: string, room_state: RoomState}`
- `roll_dice` → `{dice: string, modifier: number, hidden: boolean, advantage: 'none'|'advantage'|'disadvantage'}` → Broadcasts `roll_result`
- `reveal_roll` → `{roll_id: string}` (DM only) → Broadcasts `roll_revealed`
- `set_dc` → `{dc: number}` (DM only) → Broadcasts `dc_updated`
- `promote_to_dm` → `{new_dm_player_id: string}` (room creator only) → Broadcasts `room_mode_changed`
- `kick_player` → `{player_id: string}` (admin only) → Broadcasts `player_kicked`
- `disconnect` → Client cleanup

**Server → Client:**

- `room_created` → `{room_code: string, room_state: RoomState}`
- `player_joined` → `{player: Player}`
- `player_left` → `{player_id: string}`
- `roll_result` → `{roll: Roll}` (broadcast to all)
- `roll_revealed` → `{roll_id: string, results: RollData}` (DM reveals hidden roll)
- `dc_updated` → `{dc: number | null}`
- `room_mode_changed` → `{mode: 'dm-led', dm_player_id: string, timestamp: number}`
- `room_expiring` → `{seconds_remaining: number}` (at 180s and 30s)
- `room_closed` → `{reason: string}`
- `player_kicked` → `{player_id: string}`
- `error` → `{message: string, code: string}`

#### REST API Endpoints

- `GET /api/permalink/{roll_id}` → Returns roll details (public, no auth)
- `GET /api/health` → Server health check
- `GET /api/version` → API version info

### Authentication & Authorization

**No traditional authentication for MVP** (zero friction entry):

- Player identity: UUID generated on room join, stored in session
- Session tracking: Cookie-based session ID + IP + browser fingerprint for kick tracking
- Admin privileges: First player in room = creator with kick/close powers
- DM privileges: In DM-led mode, designated player has hidden rolls + DC setting

**Authorization Rules:**

- Any player can roll dice
- Only DM can make hidden rolls and set DC (DM-led rooms only)
- Only room creator can kick players or close room
- Only room creator can promote room to DM-led
- Kicked sessions cannot rejoin same room (IP + fingerprint blocked)

### Platform Requirements

**Browser Support:**

- Chrome 100+ (primary development target)
- Firefox 100+ (primary development target)
- Safari 16+ (explicit iOS Safari testing required)
- Edge 100+

**Device Support:**

- Desktop: Primary testing focus (Weeks 1-7)
- Mobile: Responsive design throughout, optimization focus in Weeks 8-9
- Tablet: Works via responsive design, not separately optimized

**Progressive Web App (PWA):**

- Installable to home screen
- Offline fallback page (cannot roll offline, but can view cached presets)
- Service worker for asset caching

### Performance Requirements

- **Latency**: Roll result propagation < 500ms (p95)
- **Concurrent Rooms**: Support 50+ simultaneous rooms (single server)
- **Concurrent Players**: 400+ players across all rooms (8 per room × 50 rooms)
- **History Rendering**: Smooth scrolling with 500+ rolls via virtual scrolling
- **Initial Load**: < 2s on 3G connection
- **Reconnection**: < 3s to restore room state after disconnect

### Security Requirements

- **Roll Integrity**: All rolls generated server-side using `secrets.SystemRandom()` (cryptographic PRNG)
- **Client Validation**: Never trust client for game-affecting data (rolls, DC, kick actions)
- **Rate Limiting**: 1 room creation per IP per 5 minutes, 10 rolls per player per 10 seconds
- **CAPTCHA**: Simple CAPTCHA on room creation (prevent spam bots)
- **SSL/TLS**: Required for WebSocket security (wss://) via Let's Encrypt
- **Session Security**: HttpOnly cookies, SameSite=Strict
- **Input Sanitization**: Validate all user inputs (player names, dice formulas, modifiers)
- **XSS Prevention**: Escape all user-generated content in roll history

### Accessibility Requirements

- **WCAG 2.1 AA compliance** (minimum)
- Keyboard navigation for all controls
- Screen reader support for roll announcements (ARIA live regions)
- High contrast mode support
- Font size respects user browser settings
- Focus indicators on all interactive elements

---

## User Experience Principles

### Core UX Philosophy

**"Get out of the way"** - The app should feel invisible during gameplay. Players should think about their game, not about using the tool.

**Trust through transparency** - All rolls visible (except DM hidden), complete history, no deletions, permanent permalinks.

**Mobile-first simplicity, desktop-first testing** - Design for mobile constraints (simplified input), but validate on desktop first (easier debugging).

### Key Interactions

**Creating a Room (5 seconds):**

1. Land on homepage
2. Click "Create Room"
3. Enter name
4. Room code displayed (ALPHA-1234)
5. Share code verbally or copy link

**Joining a Room (5 seconds):**

1. Click "Join Room"
2. Enter room code (ALPHA-1234)
3. Enter name
4. Instantly in room seeing live roll history

**Rolling Dice (1-2 seconds per roll):**

- Default: Tap "1d20", optionally adjust modifier, tap "Roll"
- Advanced: Toggle advanced mode, configure multiple dice, advantage/disadvantage, roll
- Result appears instantly for all players with animation

**DM Hidden Roll (3 seconds):**

1. DM toggles "Hidden" switch
2. Rolls dice
3. Only DM sees result (other players see "DM rolled hidden d20")
4. DM clicks "Reveal" when ready
5. Result broadcasts to all players

**Setting DC (2 seconds):**

1. DM enters DC in top bar
2. All subsequent rolls auto-check pass/fail
3. Green/red indicator on roll results

**Promoting to DM-led (5 seconds):**

1. Room creator clicks "Promote to DM"
2. Selects player from list
3. Confirmation modal
4. Room converts, visual marker in history

---

## Functional Requirements

### FR1: Dice Rolling Engine

**FR1.1** - Support all standard D&D dice types: d4, d6, d8, d10, d12, d20, d100
**FR1.2** - Support multiple dice in single roll (e.g., 3d6, 8d10, 2d20)
**FR1.3** - Support positive and negative modifiers (e.g., +5, -2)
**FR1.4** - Implement advantage mechanic (roll 2d20, display both, highlight higher)
**FR1.5** - Implement disadvantage mechanic (roll 2d20, display both, highlight lower)
**FR1.6** - Generate all rolls server-side using cryptographic randomness
**FR1.7** - Display individual die results, not just totals
**FR1.8** - Broadcast roll results to all players in room within 500ms

### FR2: Room Management

**FR2.1** - Generate unique room codes in format WORD-#### (e.g., ALPHA-1234)
**FR2.2** - Support two room modes: Open (default) and DM-led
**FR2.3** - Limit room capacity to 8 players maximum
**FR2.4** - Assign room creator as admin with kick/close privileges
**FR2.5** - Persist room state in Redis with TTL (DM-led: 30 min, Open: 5 hours)
**FR2.6** - Reset room TTL on each roll or player action
**FR2.7** - Emit room expiration warnings at 3 minutes and 30 seconds before expiry
**FR2.8** - Close room and notify all players on expiration
**FR2.9** - Allow room creator to manually close room
**FR2.10** - Handle DM disconnect with 60-second grace period (DM-led rooms only)
**FR2.11** - Transfer room admin to oldest remaining player if creator leaves (Open rooms)

### FR3: Player Management

**FR3.1** - Require player name on room join (1-20 characters, alphanumeric + spaces)
**FR3.2** - Generate unique player UUID on join
**FR3.3** - Track player connection status (connected/disconnected)
**FR3.4** - Display player list showing name and connection status
**FR3.5** - Allow room admin to kick players
**FR3.6** - Block kicked sessions from rejoining (IP + browser fingerprint tracking)
**FR3.7** - Broadcast player join/leave events to all room members
**FR3.8** - Handle reconnection by preserving player UUID in session

### FR4: Roll History

**FR4.1** - Store all rolls for room lifetime in chronological order
**FR4.2** - Display roll history showing: player name, timestamp, dice formula, individual die results, total, DC pass/fail (if applicable)
**FR4.3** - Make roll history immutable (no deletion or editing)
**FR4.4** - Implement virtual scrolling for history (paginate after 100 visible rolls)
**FR4.5** - Distinguish hidden rolls in history ("DM rolled hidden d20" until revealed)
**FR4.6** - Display visual marker when room mode changes from Open to DM-led
**FR4.7** - Auto-scroll to newest roll on new roll event
**FR4.8** - Persist roll history in Redis for room lifetime

### FR5: DM Features (DM-led rooms only)

**FR5.1** - Enable "Hidden Roll" toggle for DM player
**FR5.2** - Hide roll results from non-DM players until DM reveals
**FR5.3** - Show "Reveal" button on DM's hidden rolls
**FR5.4** - Broadcast revealed roll to all players when DM clicks "Reveal"
**FR5.5** - Allow DM to set room-wide DC threshold (1-30 integer)
**FR5.6** - Display DC badge prominently when set
**FR5.7** - Auto-check all rolls against DC and display pass/fail indicator
**FR5.8** - Allow DM to update DC mid-session
**FR5.9** - Allow DM to clear DC (remove threshold checking)
**FR5.10** - Broadcast DC changes to all players

### FR6: Open Room Mode

**FR6.1** - Default all new rooms to Open mode
**FR6.2** - Disable hidden rolls in Open mode (all rolls visible)
**FR6.3** - Disable DC setting in Open mode
**FR6.4** - Maintain room creator admin privileges (kick/close only)
**FR6.5** - Allow room creator to promote room to DM-led mode
**FR6.6** - Prompt room creator to select DM when promoting
**FR6.7** - Preserve existing roll history when promoting to DM-led
**FR6.8** - Insert visual marker in history showing mode change timestamp

### FR7: Roll Permalinks

**FR7.1** - Generate unique permalink URL for every roll (format: /roll/{uuid})
**FR7.2** - Store roll permalink data in database with 30-day TTL
**FR7.3** - Display "Copy Link" button on each roll in history
**FR7.4** - Copy permalink URL to clipboard on button click
**FR7.5** - Render public permalink page showing: player name, dice formula, individual results, total, timestamp, room code (anonymized)
**FR7.6** - Expire permalink data after 30 days (database cleanup job)
**FR7.7** - Display "Link expired" message for permalinks older than 30 days

### FR8: Roll Presets

**FR8.1** - Allow players to save frequently-used rolls with custom labels
**FR8.2** - Store presets in browser localStorage (per-player, not synced)
**FR8.3** - Display preset buttons for quick access
**FR8.4** - Allow players to edit preset labels and formulas
**FR8.5** - Allow players to delete presets
**FR8.6** - Limit 20 presets per player

### FR9: User Interface

**FR9.1** - Display shared roll history feed as primary UI element
**FR9.2** - Provide simplified roll input (default: 1d20 + modifier)
**FR9.3** - Provide "Advanced" toggle to reveal multiple dice, advantage/disadvantage controls
**FR9.4** - Display DC badge when set by DM
**FR9.5** - Show green checkmark for rolls ≥ DC, red X for rolls < DC
**FR9.6** - Implement collapsible roll history drawer for mobile (save screen space)
**FR9.7** - Display connection status indicator (connected/reconnecting/disconnected)
**FR9.8** - Show room expiration countdown when < 3 minutes remain
**FR9.9** - Display room code prominently with "Copy" button
**FR9.10** - Render mobile-responsive layout (breakpoints: 640px, 1024px)

### FR10: Connection Resilience

**FR10.1** - Implement automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
**FR10.2** - Display "Reconnecting..." status during connection attempts
**FR10.3** - Restore room state on successful reconnection
**FR10.4** - Fallback to long-polling if WebSocket fails repeatedly
**FR10.5** - Provide local-only roll mode if real-time sync unavailable (with manual share option)

---

## Non-Functional Requirements

### Performance

- **NFR-P1**: Roll synchronization latency < 500ms (p95) across all connected clients
- **NFR-P2**: Support 50 concurrent rooms on single VPS (DigitalOcean $20/month tier)
- **NFR-P3**: Initial page load < 2s on 3G connection
- **NFR-P4**: Reconnection time < 3s after network recovery
- **NFR-P5**: Virtual scrolling maintains 60fps with 500+ roll history
- **NFR-P6**: Redis memory usage < 500MB for 50 active rooms

### Security

- **NFR-S1**: All rolls generated server-side using `secrets.SystemRandom()`
- **NFR-S2**: WebSocket connections secured with WSS (TLS 1.3)
- **NFR-S3**: Rate limiting: 1 room creation per IP per 5 minutes
- **NFR-S4**: Rate limiting: 10 rolls per player per 10 seconds
- **NFR-S5**: CAPTCHA on room creation (hCaptcha or reCAPTCHA)
- **NFR-S6**: Session cookies: HttpOnly, Secure, SameSite=Strict
- **NFR-S7**: Input validation on all user data (player names, dice formulas, modifiers)
- **NFR-S8**: XSS prevention via output escaping in roll history

### Scalability

- **NFR-SC1**: Horizontal scaling deferred to Phase 2 (single VPS sufficient for MVP)
- **NFR-SC2**: Redis persistence ensures room survival across backend restarts
- **NFR-SC3**: Database schema supports partitioning for permalink storage growth
- **NFR-SC4**: Stateless backend design enables future load balancing

### Reliability

- **NFR-R1**: 99% uptime during Steve's D&D group sessions (Friday nights, 7-10pm PST)
- **NFR-R2**: Automatic room state recovery from Redis on server restart
- **NFR-R3**: Graceful degradation: local-only roll mode if WebSocket fails
- **NFR-R4**: DM disconnect tolerance: 60-second grace period before room termination
- **NFR-R5**: Database backup for permalink data (daily backups, 7-day retention)

### Accessibility

- **NFR-A1**: WCAG 2.1 AA compliance
- **NFR-A2**: Keyboard navigation for all interactive elements
- **NFR-A3**: Screen reader support with ARIA live regions for roll announcements
- **NFR-A4**: High contrast mode support
- **NFR-A5**: Focus indicators on all interactive elements

### DevOps

- **NFR-D1**: Containerized deployment using Docker + docker-compose
- **NFR-D2**: GitHub Actions CI/CD pipeline:
  - Run tests on push to develop branch
  - Build Docker images on merge to main
  - Deploy to VPS on successful build
- **NFR-D3**: Automated testing: unit tests (backend), integration tests (WebSocket flows), E2E tests (Playwright)
- **NFR-D4**: Zero-downtime deployments using rolling restart strategy
- **NFR-D5**: Environment variable configuration (no secrets in repo)
- **NFR-D6**: Logging: structured JSON logs (Winston/Pino) with log levels
- **NFR-D7**: Monitoring: health check endpoint, uptime monitoring (UptimeRobot or similar)
- **NFR-D8**: SSL certificate auto-renewal (Let's Encrypt Certbot)

---

## Data Models

### Room State (Redis)

```typescript
interface Room {
  room_code: string; // WORD-#### format
  mode: "open" | "dm-led";
  created_at: number; // Unix timestamp
  last_activity: number; // Unix timestamp
  ttl: number; // Seconds (1800 for DM-led, 18000 for Open)
  creator_player_id: string; // Admin privileges
  dm_player_id?: string; // Only in DM-led mode
  dc?: number; // Current DC threshold (1-30)
  players: Player[];
  roll_history: Roll[];
  kicked_sessions: string[]; // IP+fingerprint hashes
  mode_change_history: ModeChange[];
}

interface Player {
  player_id: string; // UUID
  name: string; // 1-20 chars
  connected: boolean;
  joined_at: number;
  session_hash: string; // IP+fingerprint for kick tracking
}

interface Roll {
  roll_id: string; // UUID
  player_id: string;
  player_name: string;
  timestamp: number;
  sequence: number; // For deterministic ordering
  dice_formula: string; // e.g., "3d6+5"
  dice_type: number; // e.g., 6
  dice_count: number; // e.g., 3
  modifier: number; // e.g., 5
  advantage: "none" | "advantage" | "disadvantage";
  individual_results: number[]; // e.g., [4, 2, 6]
  total: number; // e.g., 17
  hidden: boolean; // DM hidden roll
  revealed: boolean; // Hidden roll revealed status
  dc_check?: { dc: number; passed: boolean }; // If DC was set
  permalink: string; // /roll/{roll_id}
}

interface ModeChange {
  timestamp: number;
  from_mode: "open";
  to_mode: "dm-led";
  dm_player_id: string;
}
```

### Permalink Storage (SQLite/PostgreSQL)

```sql
CREATE TABLE roll_permalinks (
  roll_id UUID PRIMARY KEY,
  room_code VARCHAR(10) NOT NULL,
  player_name VARCHAR(20) NOT NULL,
  dice_formula VARCHAR(50) NOT NULL,
  individual_results JSON NOT NULL,
  total INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL -- 30 days from created_at
);

CREATE INDEX idx_expires_at ON roll_permalinks(expires_at);
```

---

## Technical Architecture Overview

### System Components

1. **Frontend (React + TypeScript)**

   - Socket.io-client for WebSocket connection
   - Zustand for state management
   - Tailwind CSS for styling
   - PWA manifest and service worker

2. **Backend (FastAPI + Python)**

   - python-socketio for WebSocket server
   - Pydantic models for validation
   - Redis client for room state
   - SQLite/PostgreSQL for permalinks

3. **State Layer (Redis)**

   - In-memory room state
   - TTL-based auto-expiration
   - Persistence to disk (AOF or RDB)

4. **Permalink Storage (SQLite/PostgreSQL)**

   - 30-day roll history
   - Indexed by expiration date for cleanup

5. **Infrastructure (Docker + GitHub Actions + VPS)**
   - Docker Compose for local dev
   - GitHub Actions for CI/CD
   - VPS deployment (DigitalOcean/Linode)
   - Let's Encrypt for SSL

### Deployment Pipeline

```
┌─────────────────┐
│  Developer Push │
│  (to develop)   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ GitHub Actions  │
│ - Run tests     │
│ - Lint code     │
└────────┬────────┘
         │
         v (merge to main)
┌─────────────────┐
│ GitHub Actions  │
│ - Build Docker  │
│ - Push to       │
│   registry      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ VPS Deployment  │
│ - Pull image    │
│ - Rolling       │
│   restart       │
└─────────────────┘
```

---

## Risks & Mitigations

### Technical Risks

**Risk 1: WebSocket Connection Drops**

- Impact: Players miss rolls, game disrupted
- Likelihood: Medium (mobile networks, Wi-Fi issues)
- Mitigation: Automatic reconnection with exponential backoff, connection status indicator, 60s DM grace period, fallback to long-polling

**Risk 2: Race Conditions on Simultaneous Rolls**

- Impact: Roll history ordering incorrect
- Likelihood: Low (players rarely roll simultaneously)
- Mitigation: Server-side timestamp + sequence number, Redis atomic operations

**Risk 3: Redis Data Loss**

- Impact: Active rooms lost on server restart
- Likelihood: Low (Redis persistence enabled)
- Mitigation: Redis AOF persistence, room state recovery on restart, auto-expiration ensures stale data cleanup

**Risk 4: iOS Safari WebSocket Quirks**

- Impact: iOS users cannot connect
- Likelihood: Medium (known Safari issues)
- Mitigation: Explicit iOS Safari testing in Week 8, fallback to long-polling, Socket.io handles compatibility

**Risk 5: Permalink Database Growth**

- Impact: Storage costs, query performance degradation
- Likelihood: Medium (long-term)
- Mitigation: 30-day auto-expiration, indexed cleanup job, database partitioning strategy for Phase 2

### Product Risks

**Risk 6: Room Spam/Abuse**

- Impact: Server resource exhaustion
- Likelihood: Low (niche product)
- Mitigation: Rate limiting (1 room per IP per 5 min), CAPTCHA on creation, auto-expiration

**Risk 7: Kicked Player Re-Entry**

- Impact: Disruptive player returns
- Likelihood: Medium (motivated troll)
- Mitigation: Session-based kick tracking (IP + browser fingerprint), blocked for room lifetime

**Risk 8: Cheating via Client Manipulation**

- Impact: Trust erosion, players abandon app
- Likelihood: Low (requires technical skill)
- Mitigation: Server-side roll generation only, client receives results read-only, permalinks provide audit trail

---

## Implementation Planning

### Week-by-Week Breakdown

**Week 1: Walking Skeleton**

- Goal: Create → Join → Roll → View (basic flow, no DM features)
- Deliverables: Docker setup, FastAPI skeleton, React skeleton, basic WebSocket connection, single d20 roll

**Week 2-3: Backend Core**

- Goal: Room management, roll engine, Redis persistence
- Deliverables: Room creation/join, all dice types, modifiers, advantage/disadvantage, roll history, reconnection logic

**Week 4-6: Frontend Development**

- Goal: Complete UI, DM features, mobile responsive
- Deliverables: Roll input UI, history feed, DM hidden rolls, DC setting, room mode promotion, presets, mobile layout

**Week 7: Edge Cases & Integration**

- Goal: Race conditions, disconnect handling, kick tracking
- Deliverables: Sequence ordering, DM grace period, kick session tracking, room expiration warnings

**Week 8-9: Testing & Polish**

- Goal: iOS Safari, load testing, UX refinements
- Deliverables: iOS Safari fixes, 50-room load test, permalink verification, E2E test suite

**Week 10: Buffer**

- Goal: Unknowns, debugging, performance tuning
- Deliverables: CI/CD pipeline complete, production deployment, documentation

### Epic Breakdown Required

Requirements must be decomposed into epics and bite-sized stories due to context limits.

**Next Step:** Run `workflow epics-stories` to create the implementation breakdown.

---

## References

- Product Brief: `/Users/sfines/workspace/sdd_process_example/docs/product-brief-dnd-dice-roller-2025-11-15.md`

---

## Next Steps

1. **Epic & Story Breakdown** - Run: `workflow epics-stories` to decompose into implementable chunks
2. **Architecture Design** - Run: `workflow create-architecture` for detailed technical design
3. **Begin Week 1** - Set up Docker, GitHub Actions, walking skeleton

---

_This PRD captures the essence of D&D Dice Roller - a trustworthy, focused multiplayer dice rolling experience that makes D&D groups feel connected through transparent, verifiable rolls._

_Created through collaborative discovery between Steve and AI facilitator._
