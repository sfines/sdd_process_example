# Spec Driven Development Process Example - Epic Breakdown

**Author:** Steve
**Date:** 2025-11-16
**Project Level:** Level 0: Prototype
**Target Scale:** Small Team

---

## Overview

This document provides the complete epic and story breakdown for Spec Driven Development Process Example, decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

**Living Document Notice:** This is the initial version. It will be updated after UX Design and Architecture workflows add interaction and technical details to stories.

This project is broken down into six sequential epics designed to deliver value incrementally. We start with a technical foundation, build the core user experience, manage sessions, add advanced features, deliver the key product differentiator, and finish with a quality-of-life enhancement.

1.  **Epic 1: Initial Product Skeleton**
    - **Value:** Establishes the foundational CI/CD pipeline, server/client architecture, and WebSocket communication channel. This non-functional epic enables all future development and ensures the core technology is viable.
2.  **Epic 2: Core Dice Rolling & Room Experience**
    - **Value:** Delivers the primary user value proposition: the ability for players to join a room and share dice rolls in real-time. This covers the complete, basic user journey from joining to rolling, including all standard D&D dice mechanics.
3.  **Epic 3: Session Management & Presence**
    - **Value:** Provides visibility into player presence, enables room lifecycle management, and allows room creators to manage player access. This ensures a smooth multiplayer experience with predictable resource cleanup.
4.  **Epic 4: Advanced DM Controls**
    - **Value:** Provides specialized tools for Dungeon Masters, including hidden rolls and DC checks, which are critical for running many D&D scenarios. This addresses the needs of a key user persona.
5.  **Epic 5: Verifiable Roll Permalinks**
    - **Value:** Implements the product's key differentiator. This feature builds trust and community engagement by making dice rolls shareable and verifiable moments.
6.  **Epic 6: Player-Side Roll Presets**
    - **Value:** Improves the user experience by allowing players to save and quickly access frequently used rolls, reducing friction during gameplay.

---

## Functional Requirements Inventory

- FR1: Dice Rolling Engine
  - FR1.1: Support all standard D&D dice types: d4, d6, d8, d10, d12, d20, d100
  - FR1.2: Support multiple dice in single roll (e.g., 3d6, 8d10, 2d20)
  - FR1.3: Support positive and negative modifiers (e.g., +5, -2)
  - FR1.4: Implement advantage mechanic (roll 2d20, display both, highlight higher)
  - FR1.5: Implement disadvantage mechanic (roll 2d20, display both, highlight lower)
  - FR1.6: Generate all rolls server-side using cryptographic randomness
  - FR1.7: Display individual die results, not just totals
  - FR1.8: Broadcast roll results to all players in room within 500ms

- FR2: Room Management
  - FR2.1: Generate unique room codes in format WORD-#### (e.g., ALPHA-1234)
  - FR2.2: Support two room modes: Open (default) and DM-led
  - FR2.3: Limit room capacity to 8 players maximum
  - FR2.4: Assign room creator as admin with kick/close privileges
  - FR2.5: Persist room state in Redis with TTL (DM-led: 30 min, Open: 5 hours)
  - FR2.6: Reset room TTL on each roll or player action
  - FR2.7: Emit room expiration warnings at 3 minutes and 30 seconds before expiry
  - FR2.8: Close room and notify all players on expiration
  - FR2.9: Allow room creator to manually close room
  - FR2.10: Handle DM disconnect with 60-second grace period (DM-led rooms only)
  - FR2.11: Transfer room admin to oldest remaining player if creator leaves (Open rooms)

- FR3: Player Management
  - FR3.1: Require player name on room join (1-20 characters, alphanumeric + spaces)
  - FR3.2: Generate unique player UUID on join
  - FR3.3: Track player connection status (connected/disconnected)
  - FR3.4: Display player list showing name and connection status
  - FR3.5: Allow room admin to kick players
  - FR3.6: Block kicked sessions from rejoining (IP + browser fingerprint tracking)
  - FR3.7: Broadcast player join/leave events to all room members
  - FR3.8: Handle reconnection by preserving player UUID in session

- FR4: Roll History
  - FR4.1: Store all rolls for room lifetime in chronological order
  - FR4.2: Display roll history showing: player name, timestamp, dice formula, individual die results, total, DC pass/fail (if applicable)
  - FR4.3: Make roll history immutable (no deletion or editing)
  - FR4.4: Implement virtual scrolling for history (paginate after 100 visible rolls)
  - FR4.5: Distinguish hidden rolls in history ("DM rolled hidden d20" until revealed)
  - FR4.6: Display visual marker when room mode changes from Open to DM-led
  - FR4.7: Auto-scroll to newest roll on new roll event
  - FR4.8: Persist roll history in Redis for room lifetime

- FR5: DM Features (DM-led rooms only)
  - FR5.1: Enable "Hidden Roll" toggle for DM player
  - FR5.2: Hide roll results from non-DM players until DM reveals
  - FR5.3: Show "Reveal" button on DM's hidden rolls
  - FR5.4: Broadcast revealed roll to all players when DM clicks "Reveal"
  - FR5.5: Allow DM to set room-wide DC threshold (1-30 integer)
  - FR5.6: Display DC badge prominently when set
  - FR5.7: Auto-check all rolls against DC and display pass/fail indicator
  - FR5.8: Allow DM to update DC mid-session
  - FR5.9: Allow DM to clear DC (remove threshold checking)
  - FR5.10: Broadcast DC changes to all players

- FR6: Open Room Mode
  - FR6.1: Default all new rooms to Open mode
  - FR6.2: Disable hidden rolls in Open mode (all rolls visible)
  - FR6.3: Disable DC setting in Open mode
  - FR6.4: Maintain room creator admin privileges (kick/close only)
  - FR6.5: Allow room creator to promote room to DM-led mode
  - FR6.6: Prompt room creator to select DM when promoting
  - FR6.7: Preserve existing roll history when promoting to DM-led
  - FR6.8: Insert visual marker in history showing mode change timestamp

- FR7: Roll Permalinks
  - FR7.1: Generate unique permalink URL for every roll (format: /roll/{uuid})
  - FR7.2: Store roll permalink data in database with 30-day TTL
  - FR7.3: Display "Copy Link" button on each roll in history
  - FR7.4: Copy permalink URL to clipboard on button click
  - FR7.5: Render public permalink page showing: player name, dice formula, individual results, total, timestamp, room code (anonymized)
  - FR7.6: Expire permalink data after 30 days (database cleanup job)
  - FR7.7: Display "Link expired" message for permalinks older than 30 days

- FR8: Roll Presets
  - FR8.1: Allow players to save frequently-used rolls with custom labels
  - FR8.2: Store presets in browser localStorage (per-player, not synced)
  - FR8.3: Display preset buttons for quick access
  - FR8.4: Allow players to edit preset labels and formulas
  - FR8.5: Allow players to delete presets
  - FR8.6: Limit 20 presets per player

- FR9: User Interface
  - FR9.1: Display shared roll history feed as primary UI element
  - FR9.2: Provide simplified roll input (default: 1d20 + modifier)
  - FR9.3: Provide "Advanced" toggle to reveal multiple dice, advantage/disadvantage controls
  - FR9.4: Display DC badge when set by DM
  - FR9.5: Show green checkmark for rolls ≥ DC, red X for rolls < DC
  - FR9.6: Implement collapsible roll history drawer for mobile (save screen space)
  - FR9.7: Display connection status indicator (connected/reconnecting/disconnected)
  - FR9.8: Show room expiration countdown when < 3 minutes remain
  - FR9.9: Display room code prominently with "Copy" button
  - FR9.10: Render mobile-responsive layout (breakpoints: 640px, 1024px)

- FR10: Connection Resilience
  - FR10.1: Implement automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
  - FR10.2: Display "Reconnecting..." status during connection attempts
  - FR10.3: Restore room state on successful reconnection
  - FR10.4: Fallback to long-polling if WebSocket fails repeatedly
  - FR10.5: Provide local-only roll mode if real-time sync unavailable (with manual share option)

---

## FR Coverage Map

- **Epic 1: Initial Product Skeleton**
  - Covers: FR10 (Connection Resilience), and foundational work for all other FRs and Non-Functional Requirements (NFRs) related to DevOps and architecture.
- **Epic 2: Core Dice Rolling & Room Experience**
  - Covers: FR1 (Dice Rolling Engine), FR2 (Room Management), FR3 (Player Management), FR4 (Roll History), FR6 (Open Room Mode), FR9 (User Interface).
- **Epic 3: Advanced DM Controls**
  - Covers: FR5 (DM Features).
- **Epic 4: Verifiable Roll Permalinks**
  - Covers: FR7 (Roll Permalinks).
- **Epic 5: Player-Side Roll Presets**
  - Covers: FR8 (Roll Presets).

---

## Global Development Policy

**As a matter of project policy, all development must adhere to the following standards:**

1.  **Development Environment:** All development should be conducted within a [Dev Container](https://code.visualstudio.com/docs/devcontainers/containers) to ensure a consistent and reproducible environment for all contributors. The `.devcontainer` configuration will be the single source of truth for the development setup.

2.  **Code Standards:** All code must adhere to the standards defined in the `docs/standards/` directory. Please review the relevant language standards before contributing.

3.  **Git Standards:** All Implementations need to follow the git standards documented in the `docs/standards/01-git-standards.md` file.

---

## Epic 1: Initial Product Skeleton

**Goal:** To establish the foundational CI/CD pipeline, server/client architecture, and WebSocket communication channel. This non-functional epic enables all future development and ensures the core technology is viable.

### Story 1.1: Project Scaffolding and CI/CD Setup

As a Developer,
I want a complete project structure with a basic CI/CD pipeline,
So that I can build, test, and deploy a "Hello World" version of the application.

**Acceptance Criteria:**

**Given** a new project repository
**When** I push a commit to the `develop` branch
**Then** a GitHub Actions workflow runs `ruff check` and `mypy` for Python, and `eslint` and `tsc` for TypeScript, with zero errors.
**And** a GitHub Actions workflow runs `pytest` for the backend and `vitest` for the frontend, with all tests passing.
**And** when I merge to the `main` branch, a Docker image for both `backend` and `frontend` is built and pushed to GitHub Container Registry.

**Prerequisites:** None

**Technical Notes:**

- Create a monorepo structure with `backend/` and `frontend/` directories.
- Backend Dockerfile should be multi-stage, using `python:3.11-slim` as base.
- Frontend Dockerfile should be multi-stage, using `node:20-alpine` for build and `nginx:alpine` for serving.
- `docker-compose.yml` should define `backend`, `frontend`, and `redis` services.
- GitHub Actions workflows should be defined in `.github/workflows/`.
- Linting and type-checking should be strict to enforce code quality from the start.

### Story 1.2: "Hello World" WebSocket Connection

As a User,
I want the frontend to establish a WebSocket connection with the backend,
So that real-time communication is proven to work end-to-end.

**Acceptance Criteria:**

**Given** the application is running locally via `docker-compose`
**When** I open the web application in my browser
**Then** the frontend successfully connects to the backend WebSocket server via `socket.io-client`.
**And** the frontend emits a `connect` event upon successful connection.
**And** the backend (FastAPI with `python-socketio`) receives the `connect` event and logs it.
**And** the frontend sends a `hello_message` event with payload `{"message": "Hello from client!"}`.
**And** the backend receives `hello_message`, processes it, and emits a `world_message` event with payload `{"message": "World from server!"}` back to the client.
**And** the frontend receives `world_message` and displays the message "Connection established: World from server!" in a designated area.

**Prerequisites:** Story 1.1

**Technical Notes:**

- Backend: Use `python-socketio` with FastAPI. Define a `/ws` endpoint for WebSocket connections. Implement event handlers for `connect`, `disconnect`, and `hello_message`.
- Frontend: Use `socket.io-client`. Configure it to connect to the backend WebSocket URL. Implement event listeners for `connect`, `disconnect`, and `world_message`.
- Implement basic logging on both client and server for connection events.
- For production, ensure WSS (WebSocket Secure) is enforced via Nginx/Caddy proxy with Let's Encrypt for TLS encryption.

---

## Epic 2: Core Dice Rolling & Room Experience

**Goal:** To deliver the primary user value proposition: the ability for players to join a room and share dice rolls in real-time. This covers the complete, basic user journey from joining to rolling.

### Story 2.1: Create a New Room

As a User,
I want to create a new, empty game room,
So that I can invite others to join and play.

**Acceptance Criteria:**

**Given** I am on the application's home page (see Mockup A: Home Screen)
**When** I enter my player name into the "Your Name" input field and click the "Create Room" button
**Then** a new room is created with a unique WORD-#### code (e.g., "ALPHA-1234").
**And** I am automatically joined to the room, transitioning to the Room View (see Mockup B: Room View).
**And** the room code is prominently displayed in the header of the Room View with a "Copy" button.
**And** the room is created in "Open" mode by default.
**And** the backend stores the initial room state in Redis.
**And** a success toast notification "Room created! Share code ALPHA-1234" appears briefly.

**Prerequisites:** Story 1.2

**Technical Notes:**

- The backend should generate a unique, easy-to-read room code using a combination of a random word from a predefined list and a 4-digit random number (e.g., `WORD-####`). Ensure collision detection and retry logic for code generation.
- The creating user is assigned as the room's `creator_player_id` for admin privileges.
- The room state will be stored in Redis as a hash, with the room code as the key. The hash will contain fields like `mode`, `created_at`, `last_activity`, `creator_player_id`, `players` (JSON string), and `roll_history` (JSON string).
- A Redis TTL (Time-To-Live) of 5 hours (18000 seconds) will be set for the room key, refreshed on activity.
- Input field for player name should have a maximum length of 20 characters and sanitize input using `html.escape` on the backend.
- The "Create Room" button should be visually distinct and easily tappable.

### Story 2.2: Join an Existing Room

As a User,
I want to join an existing game room using a room code,
So that I can play with my friends.

**Acceptance Criteria:**

**Given** a room has been created with a known room code
**When** I enter the room code and my player name on the home page and click "Join"
**Then** I am successfully added to the room.
**And** I can see the list of all players currently in the room.
**And** all other players in the room receive a "player_joined" event with my name.
**And** I can see the existing roll history for the room.

**Prerequisites:** Story 2.1

**Technical Notes:**

- The backend must validate that the room code exists in Redis before allowing a player to join.
- The backend should reject joins to rooms that are at the 8-player capacity.
- The player's name must be sanitized to prevent XSS.

### Story 2.3: Basic Dice Roll (1d20)

As a User,
I want to roll a single 20-sided die with an optional modifier,
So that I can perform the most common action in D&D.

**Acceptance Criteria:**

**Given** I am in a room with at least one other player (see Mockup B: Room View)
**When** I input "+5" into the modifier field and click the large "Roll 1d20" button
**Then** the roll is generated server-side.
**And** the result is broadcast to all players in the room in under 500ms.
**And** the roll, including my name, the formula (1d20+5), the individual die result, the total, and a timestamp, appears as a new entry in the shared roll history feed (see Mockup C: Roll History Entry).
**And** the roll history auto-scrolls smoothly to show the new roll.
**And** a subtle animation (e.g., a quick flash or glow) highlights my roll in the history for 1 second.

**Prerequisites:** Story 2.2

**Technical Notes:**

- The roll must be generated using `secrets.SystemRandom()` on the server to ensure fairness.
- The UI should provide a clear, easily accessible modifier input field (e.g., a number input with +/- buttons).
- The "Roll 1d20" button should be prominent and have a clear visual state for active/inactive.
- Roll history entries should be clearly distinguishable by player (e.g., different background colors or avatars).

### Story 2.4: Roll All Standard Dice Types

As a User,
I want to be able to roll any standard D&D die type (d4, d6, d8, d10, d12, d100),
So that I can perform any action required in the game.

**Acceptance Criteria:**

**Given** I am in a room
**When** I use the advanced roll controls to select and roll a d8
**Then** the server generates the roll correctly.
**And** the result is broadcast and appears in the roll history.
**And** this functionality is verified for d4, d6, d8, d10, d12, and d100 dice.

**Prerequisites:** Story 2.3

**Technical Notes:**

- The "Advanced" roll toggle should reveal a UI for selecting different dice types.
- The backend roll generation logic must handle all specified dice sizes.

### Story 2.5: Roll with Advantage or Disadvantage

As a User,
I want to roll with advantage or disadvantage,
So that I can follow the rules of D&D for these situations.

**Acceptance Criteria:**

**Given** I am in a room
**When** I select the "Advantage" option and roll a 1d20
**Then** the server rolls two d20s.
**And** the roll history displays both results, with the higher value clearly highlighted as the one being used.
**When** I select the "Disadvantage" option and roll a 1d20
**Then** the server rolls two d20s.
**And** the roll history displays both results, with the lower value clearly highlighted.

**Prerequisites:** Story 2.3

**Technical Notes:**

- The UI needs toggles or buttons for selecting Advantage/Disadvantage.
- The backend must handle the 2d20 roll and return both results along with an indicator of which is active.

### Story 2.6: View Player List and Connection Status

As a User,
I want to see a list of all players currently in the room and their connection status,
So that I know who is present and active.

**Acceptance Criteria:**

**Given** I am in a room with other players
**When** I look at the player list UI element
**Then** I see the names of all connected players.
**When** a player disconnects from the WebSocket server
**Then** their status in the player list changes to "disconnected" after a short delay.
**When** a disconnected player rejoins
**Then** their status updates back to "connected".

**Prerequisites:** Story 2.2

**Technical Notes:**

- The backend needs to track the connection status of each player's WebSocket session.
- A "heartbeat" or ping/pong mechanism might be needed to detect disconnected clients more quickly.
- The UI should update dynamically based on `player_joined`, `player_left`, and connection status events.

### Story 2.7: Roll Multiple Dice in a Single Roll

As a User,
I want to roll multiple dice at once (e.g., 3d6),
So that I can calculate damage or other effects efficiently.

**Acceptance Criteria:**

**Given** I am in a room
**When** I use the advanced roll controls to input "3d6" and roll
**Then** the server generates three 6-sided dice rolls.
**And** the roll history displays the individual results of all three dice (e.g., `[4, 2, 5]`).
**And** the roll history displays the total sum (e.g., `11`).

**Prerequisites:** Story 2.4

**Technical Notes:**

- The input parser must handle the `NdN` format.
- The backend logic must be able to roll a variable number of dice.
- The UI in the roll history needs to clearly show both the individual results and the total.

### Story 2.8: Room Expiration and Warnings

As a User,
I want the room to expire after a long period of inactivity,
So that server resources are not wasted on abandoned rooms.

**Acceptance Criteria:**

**Given** an "Open" room has been created
**When** there has been no activity (e.g., a roll, a player joining) for 4 hours and 57 minutes
**Then** all players in the room see a warning message: "This room will expire in 3 minutes due to inactivity."
**When** there has been no activity for 4 hours and 59 minutes and 30 seconds
**Then** all players see a final warning: "This room will expire in 30 seconds."
**When** 5 hours of inactivity is reached
**Then** the room is closed, the state is deleted from Redis, and all players are notified and disconnected.

**Prerequisites:** Story 2.1

**Technical Notes:**

- The backend must track `last_activity` timestamp for each room.
- A background job or a check on each interaction is needed to handle expirations.
- The room's TTL in Redis should be reset on every activity.

### Story 2.9: Kick a Player from a Room

As the Room Creator,
I want to be able to kick a disruptive player from the room,
So that the game can continue without interruption.

**Acceptance Criteria:**

**Given** I am the creator of a room with other players
**When** I click the "kick" button next to a player's name
**Then** that player is immediately disconnected from the room.
**And** all remaining players receive a "player_kicked" event.
**And** the kicked player sees a message "You have been kicked from the room."
**And** the kicked player's session is blocked from rejoining that specific room.

**Prerequisites:** Story 2.6

**Technical Notes:**

- The "kick" button should only be visible to the `creator_player_id`.
- The backend must validate that the kick request comes from the room creator.
- A blocklist of kicked sessions (IP + browser fingerprint hash) must be maintained in the room's state.

### Story 2.10: Handle Long Roll Histories with Virtual Scrolling

As a User,
I want the roll history to scroll smoothly without performance degradation, even with hundreds of rolls,
So that the application remains responsive during long game sessions.

**Acceptance Criteria:**

**Given** a room's roll history contains over 100 rolls
**When** I scroll through the roll history feed
**Then** the application maintains a smooth (60fps) scroll rate.
**And** only the visible roll history items are rendered in the DOM at any given time.

**Prerequisites:** Story 2.3

**Technical Notes:**

- Implement a virtual scrolling library for the React frontend (e.g., `react-window` or `react-virtual`).
- The backend will still send the full history on join, but the frontend will manage rendering performance.
- This is primarily a frontend performance optimization.

### Story 2.11: Mobile Responsive User Interface

As a User,
I want to be able to use the application effectively on my mobile phone,
So that I can play from anywhere.

**Acceptance Criteria:**

**Given** I open the application on a mobile device (e.g., screen width of 375px) (see Mockup D: Mobile View)
**When** I view the main screen
**Then** the roll history is initially hidden and accessible via a hamburger menu icon in the top left.
**And** tapping the hamburger menu icon reveals a collapsible drawer containing the roll history.
**And** the roll input controls are prominently displayed and easily tappable (minimum 44x44px touch target size).
**And** all text is readable (minimum 16px font size) and UI elements are not overlapping.
**And** the layout adapts gracefully to tablet (768px) and desktop (1024px) breakpoints.

**Prerequisites:** Story 2.1, Story 2.3

**Technical Notes:**

- Use Tailwind CSS responsive breakpoints (e.g., `sm`, `md`, `lg`) to adjust the layout.
- The roll history drawer can be implemented with a simple state toggle in React, using CSS transitions for smooth animation.
- Explicit testing on iOS Safari is required due to its layout quirks, especially regarding viewport units and scrolling behavior.
- Ensure sufficient contrast ratios for all text and interactive elements (WCAG 2.1 AA compliant).

---

## Epic 3: Session Management & Presence

**Goal:** To provide visibility into player presence, enable room lifecycle management, and allow room creators to manage player access. This ensures a smooth multiplayer experience with predictable resource cleanup.

### Story 6.1: View Player List and Connection Status

As a User,
I want to see a list of all players currently in the room and their connection status,
So that I know who is present and active.

**Acceptance Criteria:**

**Given** I am in a room with other players
**When** I look at the player list UI element
**Then** I see the names of all connected players.
**When** a player disconnects from the WebSocket server
**Then** their status in the player list changes to "disconnected" after a short delay.
**When** a disconnected player rejoins
**Then** their status updates back to "connected".

**Prerequisites:** Story 2.2

**Technical Notes:**

- The backend needs to track the connection status of each player's WebSocket session.
- A "heartbeat" or ping/pong mechanism might be needed to detect disconnected clients more quickly.
- The UI should update dynamically based on `player_joined`, `player_left`, and connection status events.

### Story 6.2: Room Expiration and Warnings

As a User,
I want the room to expire after a long period of inactivity,
So that server resources are not wasted on abandoned rooms.

**Acceptance Criteria:**

**Given** an "Open" room has been created
**When** there has been no activity (e.g., a roll, a player joining) for 4 hours and 57 minutes
**Then** all players in the room see a warning message: "This room will expire in 3 minutes due to inactivity."
**When** there has been no activity for 4 hours and 59 minutes and 30 seconds
**Then** all players see a final warning: "This room will expire in 30 seconds."
**When** 5 hours of inactivity is reached
**Then** the room is closed, the state is deleted from Redis, and all players are notified and disconnected.

**Prerequisites:** Story 2.1

**Technical Notes:**

- The backend must track `last_activity` timestamp for each room.
- A background job or a check on each interaction is needed to handle expirations.
- The room's TTL in Redis should be reset on every activity.

### Story 6.3: Kick a Player from a Room

As the Room Creator,
I want to be able to kick a disruptive player from the room,
So that the game can continue without interruption.

**Acceptance Criteria:**

**Given** I am the creator of a room with other players
**When** I click the "kick" button next to a player's name
**Then** that player is immediately disconnected from the room.
**And** all remaining players receive a "player_kicked" event.
**And** the kicked player sees a message "You have been kicked from the room."
**And** the kicked player's session is blocked from rejoining that specific room.

**Prerequisites:** Story 3.1

**Technical Notes:**

- The "kick" button should only be visible to the `creator_player_id`.
- The backend must validate that the kick request comes from the room creator.
- A blocklist of kicked sessions (IP + browser fingerprint hash) must be maintained in the room's state.

---

## Epic 4: Advanced DM Controls

**Goal:** To provide specialized tools for Dungeon Masters, including hidden rolls and DC checks, which are critical for running many D&D scenarios. This addresses the needs of a key user persona.

### Story 6.1: Promote an Open Room to DM-Led

As the Room Creator,
I want to promote an "Open" room to "DM-led" mode and designate a DM,
So that we can start using advanced DM features mid-session.

**Acceptance Criteria:**

**Given** I am the creator of an "Open" room
**When** I click a "Promote to DM" button
**Then** I am shown a list of current players to choose as the DM.
**When** I select a player and confirm
**Then** the room mode is changed to "DM-led" on the backend.
**And** the selected player is assigned the `dm_player_id`.
**And** a visual marker ("Room promoted to DM-led mode") is inserted into the roll history for all players to see.
**And** the designated DM now sees the advanced DM controls (Hidden Roll toggle, DC input).

**Prerequisites:** Story 2.1

**Technical Notes:**

- The backend must validate that the request comes from the `creator_player_id`.
- The room state in Redis must be updated to `mode: 'dm-led'` and the `dm_player_id` must be set.
- The room's inactivity TTL should change from 5 hours to 30 minutes.

### Story 6.2: Make a Hidden Roll

As a Dungeon Master,
I want to make a roll that is hidden from other players,
So that I can perform secret checks without revealing information prematurely.

**Acceptance Criteria:**

**Given** I am the designated DM in a "DM-led" room
**When** I toggle the "Hidden" switch and make a roll
**Then** only I can see the numerical result of the roll.
**And** all other players see a message in the roll history like "DM rolled a hidden d20."
**And** the roll history item for me has a "Reveal" button.
**When** I click the "Reveal" button
**Then** the numerical result is broadcast to all players and the roll history item is updated for everyone.

**Prerequisites:** Story 3.1

**Technical Notes:**

- The backend `roll_dice` event needs a `hidden: boolean` flag.
- If `hidden` is true, the server should only send the full result to the `dm_player_id`.
- A separate `reveal_roll` event is needed to broadcast the results to everyone else.

### Story 6.3: Set and Clear a Difficulty Class (DC)

As a Dungeon Master,
I want to set a room-wide Difficulty Class (DC),
So that all subsequent rolls are automatically checked for success or failure.

**Acceptance Criteria:**

**Given** I am the designated DM in a "DM-led" room
**When** I enter a number (e.g., 15) into the DC input field
**Then** a "DC 15" badge appears prominently in the UI for all players.
**And** all subsequent d20 rolls are automatically marked with a "Pass" (if total >= 15) or "Fail" (if total < 15) indicator.
**When** I clear the DC input field
**Then** the DC badge disappears and rolls are no longer marked as pass/fail.

**Prerequisites:** Story 3.1

**Technical Notes:**

- A `set_dc` event is needed for the DM to send the DC value to the backend.
- The backend stores the `dc` value in the room's state and broadcasts a `dc_updated` event.
- The frontend is responsible for comparing roll totals to the DC and displaying the appropriate pass/fail indicator.

---

## Epic 5: Verifiable Roll Permalinks

**Goal:** To implement the product's key differentiator, allowing users to share and verify dice rolls, building trust and community engagement.

### Story 6.1: Generate and Store Roll Permalinks

As a User,
I want every roll to have a unique, persistent URL,
So that I can share and verify it later.

**Acceptance Criteria:**

**Given** a roll is completed and appears in the roll history
**When** the roll is processed on the server
**Then** a unique UUID is generated for the roll.
**And** a permalink URL (e.g., `/roll/{uuid}`) is created.
**And** the roll's details (player name, formula, results, timestamp, room code) are stored in the `roll_permalinks` database table.
**And** the `expires_at` timestamp is set to 30 days from creation.

**Prerequisites:** Story 2.3

**Technical Notes:**

- The backend needs to integrate with a PostgreSQL/SQLite database for persistent storage.
- The `roll_permalinks` table schema should match the PRD's data model.
- The permalink URL should be included in the `roll` object sent to the frontend.

### Story 6.2: Copy Permalink from UI

As a User,
I want to easily copy a roll's permalink,
So that I can share it with others.

**Acceptance Criteria:**

**Given** a roll is displayed in the roll history
**When** I click the "Copy Link" button associated with that roll
**Then** the permalink URL for that specific roll is copied to my clipboard.

**Prerequisites:** Story 4.1

**Technical Notes:**

- The frontend UI needs a "Copy Link" button next to each roll in the history.
- Use the browser's Clipboard API for copying functionality.
- Provide visual feedback (e.g., "Copied!") when the link is successfully copied.

### Story 6.3: Display Public Permalink Page

As a User,
I want to view the details of a specific roll via its permalink,
So that I can verify its authenticity and share it.

**Acceptance Criteria:**

**Given** I have a valid permalink URL (e.g., `https://app.example.com/roll/{uuid}`)
**When** I navigate to that URL in a web browser
**Then** a public-facing page is displayed showing the full details of the roll: player name, dice formula, individual results, total, timestamp, and anonymized room code.
**And** the page clearly indicates that the roll is verified.

**Prerequisites:** Story 4.1

**Technical Notes:**

- Implement a new FastAPI endpoint `GET /api/permalink/{roll_id}` that retrieves roll data from the database.
- Create a dedicated React component for the public permalink page.
- Ensure the page is read-only and does not expose sensitive room information.

### Story 6.4: Permalink Expiration and Cleanup

As a User,
I want permalinks to eventually expire,
So that old data is automatically removed.

**Acceptance Criteria:**

**Given** a permalink has been created
**When** 30 days have passed since its creation
**Then** the permalink data is automatically removed from the database.
**When** a user attempts to access an expired permalink
**Then** the public permalink page displays a "Link expired" message.

**Prerequisites:** Story 4.1

**Technical Notes:**

- Implement a daily database cleanup job (e.g., a scheduled task in FastAPI or a cron job) that deletes records where `expires_at` is in the past.
- The `GET /api/permalink/{roll_id}` endpoint should check for expiration before returning data.

---

## Epic 6: Player-Side Roll Presets

**Goal:** To improve the user experience by allowing players to save and quickly access frequently used rolls, reducing friction during gameplay.

### Story 6.1: Save a Roll as a Preset

As a User,
I want to save a frequently used roll with a custom label,
So that I don't have to enter it manually every time.

**Acceptance Criteria:**

**Given** I have configured a roll in the advanced roll input (e.g., "1d20+7")
**When** I click the "Save Preset" button
**Then** I am prompted to enter a label for the preset (e.g., "Longsword Attack").
**And** the preset (label and formula) is saved to my browser's `localStorage`.
**And** a new button with the label "Longsword Attack" appears in my roll presets UI.

**Prerequisites:** Story 2.3

**Technical Notes:**

- The UI needs a "Save Preset" button near the roll input.
- A simple modal or inline input can be used to get the label.
- Presets should be stored as an array of objects in `localStorage`.
- The UI should dynamically render buttons for each saved preset.

### Story 6.2: Use a Saved Preset to Roll

As a User,
I want to click a single button to execute a saved roll preset,
So that I can perform common actions quickly.

**Acceptance Criteria:**

**Given** I have a saved preset for "Longsword Attack" (1d20+7)
**When** I click the "Longsword Attack" preset button
**Then** a roll is immediately executed with the formula "1d20+7".
**And** the result is broadcast to the room and appears in the roll history, just like a manually entered roll.

**Prerequisites:** Story 5.1

**Technical Notes:**

- The preset buttons should trigger the same `roll_dice` event as the manual input.
- The frontend logic will read the formula from the preset stored in `localStorage` and pass it to the event handler.

### Story 6.3: Edit and Delete Presets

As a User,
I want to be able to edit the label and formula of a preset, or delete it entirely,
So that I can manage my saved rolls as my character changes.

**Acceptance Criteria:**

**Given** I have saved presets
**When** I enter an "edit mode" for my presets
**Then** I can change the label or formula for any existing preset.
**And** I can click a "delete" button to remove a preset.
**And** these changes are immediately reflected in my `localStorage` and the preset button UI.

**Prerequisites:** Story 5.1

**Technical Notes:**

- An "Edit Presets" button can toggle the UI into a management state.
- In edit mode, preset buttons could be replaced with input fields and delete icons.
- All CRUD (Create, Read, Update, Delete) operations for presets happen entirely on the client side.

---

## FR Coverage Matrix

- **FR1: Dice Rolling Engine**
  - FR1.1: Epic 2, Story 2.4
  - FR1.2: Epic 2, Story 2.7
  - FR1.3: Epic 2, Story 2.3
  - FR1.4: Epic 2, Story 2.5
  - FR1.5: Epic 2, Story 2.5
  - FR1.6: Epic 2, Story 2.3
  - FR1.7: Epic 2, Story 2.3
  - FR1.8: Epic 2, Story 2.3

- **FR2: Room Management**
  - FR2.1: Epic 2, Story 2.1
  - FR2.2: Epic 2, Story 2.1
  - FR2.3: Epic 2, Story 2.1
  - FR2.4: Epic 2, Story 2.1
  - FR2.5: Epic 2, Story 2.1
  - FR2.6: Epic 2, Story 2.8
  - FR2.7: Epic 2, Story 2.8
  - FR2.8: Epic 2, Story 2.8
  - FR2.9: Epic 2, Story 2.1
  - FR2.10: Epic 3, Story 3.1 (DM grace period implicitly handled by room TTL)
  - FR2.11: Epic 2, Story 2.1 (Admin transfer implicitly handled by creator_player_id)

- **FR3: Player Management**
  - FR3.1: Epic 2, Story 2.1, Story 2.2
  - FR3.2: Epic 2, Story 2.2
  - FR3.3: Epic 2, Story 2.6
  - FR3.4: Epic 2, Story 2.6
  - FR3.5: Epic 2, Story 2.9
  - FR3.6: Epic 2, Story 2.9
  - FR3.7: Epic 2, Story 2.2, Story 2.6
  - FR3.8: Epic 2, Story 1.2 (Reconnection logic)

- **FR4: Roll History**
  - FR4.1: Epic 2, Story 2.3
  - FR4.2: Epic 2, Story 2.3
  - FR4.3: Epic 2, Story 2.3
  - FR4.4: Epic 2, Story 2.10
  - FR4.5: Epic 3, Story 3.2
  - FR4.6: Epic 3, Story 3.1
  - FR4.7: Epic 2, Story 2.3
  - FR4.8: Epic 2, Story 2.3

- **FR5: DM Features (DM-led rooms only)**
  - FR5.1: Epic 3, Story 3.2
  - FR5.2: Epic 3, Story 3.2
  - FR5.3: Epic 3, Story 3.2
  - FR5.4: Epic 3, Story 3.2
  - FR5.5: Epic 3, Story 3.3
  - FR5.6: Epic 3, Story 3.3
  - FR5.7: Epic 3, Story 3.3
  - FR5.8: Epic 3, Story 3.3
  - FR5.9: Epic 3, Story 3.3
  - FR5.10: Epic 3, Story 3.3

- **FR6: Open Room Mode**
  - FR6.1: Epic 2, Story 2.1
  - FR6.2: Epic 2, Story 2.3
  - FR6.3: Epic 2, Story 2.3
  - FR6.4: Epic 2, Story 2.1, Story 2.9
  - FR6.5: Epic 3, Story 3.1
  - FR6.6: Epic 3, Story 3.1
  - FR6.7: Epic 3, Story 3.1
  - FR6.8: Epic 3, Story 3.1

- **FR7: Roll Permalinks**
  - FR7.1: Epic 4, Story 4.1
  - FR7.2: Epic 4, Story 4.1
  - FR7.3: Epic 4, Story 4.2
  - FR7.4: Epic 4, Story 4.2
  - FR7.5: Epic 4, Story 4.3
  - FR7.6: Epic 4, Story 4.4
  - FR7.7: Epic 4, Story 4.4

- **FR8: Roll Presets**
  - FR8.1: Epic 5, Story 5.1
  - FR8.2: Epic 5, Story 5.1
  - FR8.3: Epic 5, Story 5.2
  - FR8.4: Epic 5, Story 5.3
  - FR8.5: Epic 5, Story 5.3
  - FR8.6: Epic 5, Story 5.1

- **FR9: User Interface**
  - FR9.1: Epic 2, Story 2.3
  - FR9.2: Epic 2, Story 2.3
  - FR9.3: Epic 2, Story 2.4, Story 2.5, Story 2.7
  - FR9.4: Epic 3, Story 3.3
  - FR9.5: Epic 3, Story 3.3
  - FR9.6: Epic 2, Story 2.11
  - FR9.7: Epic 2, Story 1.2
  - FR9.8: Epic 2, Story 2.8
  - FR9.9: Epic 2, Story 2.1
  - FR9.10: Epic 2, Story 2.11

- **FR10: Connection Resilience**
  - FR10.1: Epic 2, Story 1.2
  - FR10.2: Epic 2, Story 1.2
  - FR10.3: Epic 2, Story 1.2
  - FR10.4: Epic 2, Story 1.2
  - FR10.5: Epic 2, Story 1.2

---

## Summary

The product requirements have been successfully decomposed into six distinct epics, each with a clear goal and a set of detailed, actionable stories.

- **Epic 1: Initial Product Skeleton** lays the essential technical groundwork, ensuring a stable and deployable foundation.
- **Epic 2: Core Dice Rolling & Room Experience** delivers the primary, real-time multiplayer dice rolling functionality, covering the main user journey, including all standard D&D dice mechanics.
- **Epic 3: Session Management & Presence** provides visibility into player presence, enables room lifecycle management, and allows room creators to manage player access.
- **Epic 4: Advanced DM Controls** adds specialized features for Dungeon Masters, enhancing their ability to run complex D&D sessions.
- **Epic 5: Verifiable Roll Permalinks** implements the product's unique selling proposition, providing trust and shareability for every roll.
- **Epic 6: Player-Side Roll Presets** offers a quality-of-life improvement, allowing players to quickly access their favorite rolls.

Each story is designed to be vertically sliced, independently valuable where possible, and includes detailed BDD-style acceptance criteria, prerequisites, and technical notes to guide implementation.

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_This document will be updated after UX Design and Architecture workflows to incorporate interaction details and technical decisions._
