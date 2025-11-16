# D&D Dice Roller - Architecture Document

**Author:** Steve
**Date:** 2025-11-15
**Version:** 1.0
**Status:** Approved for Implementation

---

## Executive Summary

This architecture document defines the technical design for the D&D Dice Roller, a real-time multiplayer web application. The system enables gaming groups to share dice rolls synchronously with complete trust and transparency through ephemeral game rooms, DM features, and permanent roll permalinks.

**Architecture Philosophy:** Leverage modern starter templates and proven patterns to minimize custom infrastructure while maintaining flexibility for the unique real-time multiplayer requirements.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architectural Decisions](#architectural-decisions)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Data Architecture](#data-architecture)
6. [API Design](#api-design)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Observability & Monitoring](#observability--monitoring)
10. [Testing Strategy](#testing-strategy)
11. [Implementation Roadmap](#implementation-roadmap)

---

## System Overview

### Core Capabilities

1. **Real-Time Dice Rolling** - Cryptographically secure server-side roll generation with sub-500ms synchronization
2. **Ephemeral Rooms** - WORD-#### coded rooms with dual modes (Open/DM-led), auto-expiring based on activity
3. **Roll Permalinks** - 30-day persistent shareable URLs for every roll (killer feature)
4. **DM Features** - Hidden rolls, DC threshold checking, room promotion
5. **Connection Resilience** - Automatic reconnection, grace periods, fallback modes

### Scale & Performance Targets

- **Concurrent Users:** 400+ players (50 rooms × 8 players)
- **Latency:** < 500ms roll synchronization (p95)
- **Uptime:** 99% during game sessions (Friday nights 7-10pm PST)
- **Load Time:** < 2s on 3G connection
- **History Capacity:** 500+ rolls per room with smooth scrolling

---

## Architectural Decisions

All architectural decisions are documented as individual ADRs:

- **[ADR-001: Project Initialization via Full-Stack Template](./architecture/adrs/001-project-initialization-template.md)**  
  Use `fastapi/full-stack-fastapi-template` as foundation with modifications for Socket.io, Valkey, and Tailwind CSS.

- **[ADR-002: WebSocket Architecture Pattern](./architecture/adrs/002-websocket-architecture.md)**  
  Socket.io with native room concept for all real-time features.

- **[ADR-003: State Storage Strategy](./architecture/adrs/003-state-storage-strategy.md)**  
  Valkey (Redis fork) with single-hash-per-room pattern.

- **[ADR-004: Permalink Storage Schema](./architecture/adrs/004-permalink-storage-schema.md)**  
  SQLite with rich context schema for MVP permalinks (30-day retention).

- **[ADR-005: Roll Generation Security](./architecture/adrs/005-roll-generation-security.md)**  
  Server-side roll generation via Socket.io events using cryptographic randomness.

- **[ADR-006: Frontend State Management](./architecture/adrs/006-frontend-state-management.md)**  
  Zustand for global state management with Socket.io integration.

- **[ADR-007: Styling System](./architecture/adrs/007-styling-system.md)**  
  Tailwind CSS + Headless UI (replacing Chakra UI from template).

- **[ADR-008: Deployment & CI/CD Strategy](./architecture/adrs/008-deployment-cicd-strategy.md)**  
  GitHub Actions with GHCR for Docker images, zero-downtime deployments to VPS.

- **[ADR-009: Observability & Monitoring](./architecture/adrs/009-observability-monitoring.md)**  
  Structured JSON logging + Sentry error tracking for frontend and backend.

- **[ADR-010: Testing Strategy](./architecture/adrs/010-testing-strategy.md)**  
  TDD for walking skeleton (Week 1), 80% backend coverage, E2E tests for critical paths.

---

## Technology Stack

### Backend Stack

| Component       | Technology      | Version | Purpose                               |
| --------------- | --------------- | ------- | ------------------------------------- |
| **Runtime**     | Python          | 3.11+   | Backend language                      |
| **Framework**   | FastAPI         | 0.104+  | REST API + WebSocket server           |
| **WebSocket**   | python-socketio | 5.10+   | Real-time bidirectional communication |
| **Validation**  | Pydantic        | 2.5+    | Request/response validation           |
| **ORM**         | SQLModel        | 0.0.14+ | Database models (SQLAlchemy wrapper)  |
| **Database**    | SQLite          | 3.40+   | Permalink storage (MVP)               |
| **Cache/State** | Valkey          | 8.0+    | Room state (Redis fork)               |
| **Testing**     | Pytest          | 7.4+    | Unit + integration tests              |
| **ASGI Server** | Uvicorn         | 0.24+   | Production server                     |

### Frontend Stack

| Component       | Technology       | Version | Purpose                        |
| --------------- | ---------------- | ------- | ------------------------------ |
| **Runtime**     | Node.js          | 20 LTS  | Build environment              |
| **Framework**   | React            | 18.2+   | UI library                     |
| **Language**    | TypeScript       | 5.3+    | Type safety                    |
| **Build Tool**  | Vite             | 5.0+    | Dev server + bundler           |
| **State**       | Zustand          | 4.4+    | Global state management        |
| **WebSocket**   | socket.io-client | 4.6+    | Real-time client               |
| **Styling**     | Tailwind CSS     | 3.4+    | Utility-first CSS              |
| **Components**  | Headless UI      | 1.7+    | Accessible unstyled components |
| **Testing**     | Vitest           | 1.0+    | Unit tests                     |
| **E2E Testing** | Playwright       | 1.40+   | End-to-end tests               |

### Infrastructure Stack

| Component            | Technology          | Version | Purpose                         |
| -------------------- | ------------------- | ------- | ------------------------------- |
| **Containerization** | Docker              | 24+     | Application packaging           |
| **Orchestration**    | Docker Compose      | 2.23+   | Multi-container management      |
| **CI/CD**            | GitHub Actions      | Latest  | Automated pipeline              |
| **Registry**         | GHCR                | Latest  | Docker image storage            |
| **Web Server**       | Nginx               | 1.25+   | Reverse proxy + SSL termination |
| **SSL**              | Let's Encrypt       | Latest  | HTTPS certificates (Certbot)    |
| **VPS**              | DigitalOcean/Linode | -       | Production hosting              |

### Observability Stack

| Component          | Technology  | Version   | Purpose                   |
| ------------------ | ----------- | --------- | ------------------------- |
| **Logging**        | structlog   | 23.2+     | Structured JSON logs      |
| **Error Tracking** | Sentry      | Latest    | Frontend + backend errors |
| **Monitoring**     | UptimeRobot | Free tier | Uptime monitoring         |

---

## System Architecture

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite + TypeScript + Tailwind)                  │  │
│  │  - Zustand (State Management)                              │  │
│  │  - Socket.io-client (Real-time)                            │  │
│  │  - PWA (Service Worker)                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                         NGINX LAYER                               │
│  - SSL Termination (Let's Encrypt)                               │
│  - Static Asset Serving                                          │
│  - Reverse Proxy to Backend                                      │
└───────────────────────────┬──────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        │ HTTP/REST                             │ WebSocket (Socket.io)
        │                                       │
┌───────▼────────────────────────┐   ┌─────────▼──────────────────┐
│   FastAPI REST API             │   │  Socket.io Server          │
│   - Health checks              │   │  - Room management         │
│   - Permalink retrieval        │   │  - Roll generation         │
│   - Version info               │   │  - Player events           │
└───────┬────────────────────────┘   └─────────┬──────────────────┘
        │                                       │
        │                                       │
        └───────────────────┬───────────────────┘
                            │
        ┌───────────────────┴────────────────────┐
        │                                        │
┌───────▼──────────────┐            ┌───────────▼──────────────┐
│   Valkey (Redis)     │            │   SQLite Database        │
│   - Room state       │            │   - Roll permalinks      │
│   - Player sessions  │            │   (30-day retention)     │
│   - Roll history     │            │                          │
│   (Ephemeral + AOF)  │            │                          │
└──────────────────────┘            └──────────────────────────┘
```

### Component Interaction Flow

#### Flow 1: Create Room

```
1. User clicks "Create Room" in React app
2. Client emits Socket.io "create_room" event
3. Backend generates WORD-#### room code
4. Backend creates Room object in Valkey with TTL
5. Backend joins Socket.io room (native Socket.io concept)
6. Backend emits "room_created" to client
7. Client stores room state in Zustand
8. UI updates to show room code
```

#### Flow 2: Roll Dice

```
1. User configures roll (1d20+5) and clicks "Roll"
2. Client emits "roll_dice" event with {dice, modifier, hidden}
3. Backend validates player is in room and not kicked
4. Backend generates roll using secrets.SystemRandom()
5. Backend creates Roll object with timestamp + sequence
6. Backend updates Valkey room state (append to roll_history)
7. Backend creates permalink in SQLite (async task)
8. Backend broadcasts "roll_result" to Socket.io room
9. All clients receive roll, update Zustand store
10. UI animates new roll in history feed
11. Client resets room TTL timer in Valkey
```

#### Flow 3: Reconnection After Disconnect

```
1. Client detects Socket.io disconnect event
2. Socket.io-client begins exponential backoff reconnection
3. UI shows "Reconnecting..." status
4. Client reconnects with same session cookie (player_id preserved)
5. Backend validates session, retrieves room from Valkey
6. Backend rejoins client to Socket.io room
7. Backend emits full room state to reconnected client
8. Client updates Zustand with current room state
9. UI updates to "Connected" status
10. If DM and within 60s grace period, room continues normally
```

---

## Data Architecture

### Valkey Room State Schema

```typescript
interface Room {
  room_code: string; // WORD-#### format (e.g., "ALPHA-1234")
  mode: "open" | "dm-led"; // Room mode
  created_at: number; // Unix timestamp (ms)
  last_activity: number; // Unix timestamp (ms)
  ttl: number; // Seconds (1800 for DM-led, 18000 for Open)
  creator_player_id: string; // UUID (room admin)
  dm_player_id?: string; // UUID (only in DM-led mode)
  dc?: number; // Current DC threshold (1-30)
  players: Player[]; // Array of connected players
  roll_history: Roll[]; // Immutable roll log
  kicked_sessions: string[]; // Hashed session IDs (IP+fingerprint)
  mode_change_history: ModeChange[]; // Track Open → DM-led transitions
}

interface Player {
  player_id: string; // UUID
  name: string; // 1-20 characters
  connected: boolean; // Real-time connection status
  joined_at: number; // Unix timestamp (ms)
  session_hash: string; // SHA256(IP + User-Agent) for kick tracking
  last_seen: number; // Unix timestamp (ms)
}

interface Roll {
  roll_id: string; // UUID
  player_id: string; // UUID
  player_name: string; // Snapshot at roll time
  timestamp: number; // Unix timestamp (ms)
  sequence: number; // Deterministic ordering within room
  dice_formula: string; // Display string "3d6+5"
  dice_type: number; // Die sides (4, 6, 8, 10, 12, 20, 100)
  dice_count: number; // Number of dice rolled
  modifier: number; // Added/subtracted from total
  advantage: "none" | "advantage" | "disadvantage";
  individual_results: number[]; // Raw die results [4, 2, 6]
  total: number; // Final result (sum + modifier)
  hidden: boolean; // DM hidden roll flag
  revealed: boolean; // Hidden roll revelation status
  dc_check?: {
    // Optional DC evaluation
    dc: number;
    passed: boolean;
  };
  permalink: string; // URL path "/roll/{roll_id}"
}

interface ModeChange {
  timestamp: number; // Unix timestamp (ms)
  from_mode: "open";
  to_mode: "dm-led";
  dm_player_id: string; // Newly designated DM
  initiated_by: string; // player_id of room creator
}
```

**Valkey Key Pattern:**

```
Key: room:{ROOM_CODE}
Value: JSON.stringify(Room)
TTL: room.ttl seconds
```

**Example Valkey Storage:**

```json
{
  "room_code": "ALPHA-1234",
  "mode": "dm-led",
  "created_at": 1700000000000,
  "last_activity": 1700001800000,
  "ttl": 1800,
  "creator_player_id": "uuid-alice",
  "dm_player_id": "uuid-alice",
  "dc": 15,
  "players": [
    {
      "player_id": "uuid-alice",
      "name": "Alice",
      "connected": true,
      "joined_at": 1700000000000,
      "session_hash": "sha256-hash-1",
      "last_seen": 1700001800000
    },
    {
      "player_id": "uuid-bob",
      "name": "Bob",
      "connected": true,
      "joined_at": 1700000030000,
      "session_hash": "sha256-hash-2",
      "last_seen": 1700001795000
    }
  ],
  "roll_history": [
    {
      "roll_id": "uuid-roll-1",
      "player_id": "uuid-alice",
      "player_name": "Alice",
      "timestamp": 1700000100000,
      "sequence": 1,
      "dice_formula": "1d20+5",
      "dice_type": 20,
      "dice_count": 1,
      "modifier": 5,
      "advantage": "none",
      "individual_results": [18],
      "total": 23,
      "hidden": false,
      "revealed": false,
      "dc_check": { "dc": 15, "passed": true },
      "permalink": "/roll/uuid-roll-1"
    }
  ],
  "kicked_sessions": [],
  "mode_change_history": []
}
```

### SQLite Permalink Schema

**Database File:** `/data/permalinks.db`

```sql
CREATE TABLE roll_permalinks (
  roll_id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  room_mode TEXT NOT NULL CHECK (room_mode IN ('open', 'dm-led')),
  player_name TEXT NOT NULL,
  dice_formula TEXT NOT NULL,
  dice_type INTEGER NOT NULL,
  dice_count INTEGER NOT NULL,
  modifier INTEGER NOT NULL,
  advantage TEXT NOT NULL CHECK (advantage IN ('none', 'advantage', 'disadvantage')),
  individual_results TEXT NOT NULL,      -- JSON array
  total INTEGER NOT NULL,
  dc_check TEXT,                         -- JSON object or NULL
  timestamp INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX idx_expires_at ON roll_permalinks(expires_at);
CREATE INDEX idx_created_at ON roll_permalinks(created_at);
CREATE INDEX idx_room_code ON roll_permalinks(room_code);
```

**Cleanup Job (Daily Cron):**

```sql
DELETE FROM roll_permalinks
WHERE datetime(expires_at) < datetime('now');
```

---

## API Design

### REST API Endpoints

#### GET /api/health

**Purpose:** Health check for uptime monitoring

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-15T19:45:33Z",
  "services": {
    "valkey": "connected",
    "database": "connected"
  }
}
```

#### GET /api/version

**Purpose:** API version information

**Response:**

```json
{
  "version": "1.0.0",
  "build": "abc123",
  "environment": "production"
}
```

#### GET /api/permalink/{roll_id}

**Purpose:** Retrieve permalink roll data (public, no auth)

**Response:**

```json
{
  "roll_id": "uuid-roll-1",
  "room_code": "ALPH****", // Anonymized
  "room_mode": "dm-led",
  "player_name": "Alice",
  "dice_formula": "1d20+5",
  "advantage": "none",
  "individual_results": [18],
  "total": 23,
  "dc_check": { "dc": 15, "passed": true },
  "timestamp": 1700000100000,
  "created_at": "2025-11-15T19:45:00Z",
  "expires_at": "2025-12-15T19:45:00Z"
}
```

**Error Response (404):**

```json
{
  "error": "Permalink not found or expired",
  "roll_id": "uuid-roll-1"
}
```

---

### Socket.io Events API

#### Client → Server Events

##### create_room

**Payload:**

```typescript
{
  mode: 'open' | 'dm-led',
  player_name: string  // 1-20 chars
}
```

**Response (via callback):**

```typescript
{
  room_code: string,      // "ALPHA-1234"
  player_id: string,      // UUID
  player_session: string  // Session token
}
```

**Error Response:**

```typescript
{
  error: string,
  code: 'RATE_LIMIT' | 'INVALID_NAME' | 'SERVER_ERROR'
}
```

---

##### join_room

**Payload:**

```typescript
{
  room_code: string,      // "ALPHA-1234"
  player_name: string     // 1-20 chars
}
```

**Response (via callback):**

```typescript
{
  player_id: string,
  room_state: Room        // Full room object
}
```

**Error Codes:**

- `ROOM_NOT_FOUND`
- `ROOM_FULL` (8 players max)
- `KICKED` (session previously kicked)
- `INVALID_NAME`

---

##### roll_dice

**Payload:**

```typescript
{
  dice: string,           // "1d20", "3d6", etc.
  modifier: number,       // -10 to +20
  hidden: boolean,        // DM only
  advantage: 'none' | 'advantage' | 'disadvantage'
}
```

**Response:** None (broadcasts to room)

**Error Codes:**

- `NOT_IN_ROOM`
- `INVALID_DICE_FORMAT`
- `HIDDEN_NOT_ALLOWED` (non-DM in DM-led room)
- `RATE_LIMIT` (10 rolls per 10 seconds)

---

##### reveal_roll

**Payload:**

```typescript
{
  roll_id: string; // UUID of hidden roll
}
```

**Response:** None (broadcasts to room)

**Error Codes:**

- `NOT_DM`
- `ROLL_NOT_FOUND`
- `ROLL_NOT_HIDDEN`

---

##### set_dc

**Payload:**

```typescript
{
  dc: number | null; // 1-30 or null to clear
}
```

**Response:** None (broadcasts to room)

**Error Codes:**

- `NOT_DM`
- `INVALID_DC` (out of range)

---

##### promote_to_dm

**Payload:**

```typescript
{
  new_dm_player_id: string; // UUID
}
```

**Response:** None (broadcasts to room)

**Error Codes:**

- `NOT_ROOM_CREATOR`
- `PLAYER_NOT_FOUND`
- `ALREADY_DM_LED`

---

##### kick_player

**Payload:**

```typescript
{
  player_id: string; // UUID to kick
}
```

**Response:** None (broadcasts to room)

**Error Codes:**

- `NOT_ADMIN`
- `CANNOT_KICK_SELF`
- `PLAYER_NOT_FOUND`

---

#### Server → Client Events

##### room_created

**Payload:**

```typescript
{
  room_code: string,
  room_state: Room
}
```

---

##### player_joined

**Payload:**

```typescript
{
  player: Player;
}
```

---

##### player_left

**Payload:**

```typescript
{
  player_id: string,
  reason: 'disconnect' | 'kicked' | 'room_closed'
}
```

---

##### roll_result

**Payload:**

```typescript
{
  roll: Roll;
}
```

**Note:** If `roll.hidden === true` and recipient is not DM, `individual_results` and `total` are omitted.

---

##### roll_revealed

**Payload:**

```typescript
{
  roll_id: string,
  individual_results: number[],
  total: number
}
```

---

##### dc_updated

**Payload:**

```typescript
{
  dc: number | null;
}
```

---

##### room_mode_changed

**Payload:**

```typescript
{
  mode: 'dm-led',
  dm_player_id: string,
  timestamp: number
}
```

---

##### room_expiring

**Payload:**

```typescript
{
  seconds_remaining: number; // 180 or 30
}
```

---

##### room_closed

**Payload:**

```typescript
{
  reason: "expired" | "creator_closed" | "server_shutdown";
}
```

---

##### player_kicked

**Payload:**

```typescript
{
  player_id: string;
}
```

---

##### error

**Payload:**

```typescript
{
  message: string,
  code: string,
  context?: object
}
```

---

## Security Architecture

### Threat Model

| Threat                     | Risk Level | Mitigation                                            |
| -------------------------- | ---------- | ----------------------------------------------------- |
| **Roll Manipulation**      | High       | Server-side generation only, cryptographic randomness |
| **Room Spam**              | Medium     | Rate limiting (1 room per IP per 5 min), CAPTCHA      |
| **Kicked Player Re-Entry** | Medium     | Session-based kick tracking (IP+fingerprint hash)     |
| **WebSocket DoS**          | Low        | Connection limits, rate limiting on events            |
| **XSS via Player Names**   | Medium     | Input sanitization, output escaping                   |
| **Permalink Scraping**     | Low        | Public by design, rate limit GET requests             |
| **MITM Attacks**           | High       | HTTPS/WSS required, HSTS headers                      |

### Security Implementation

#### 1. Roll Integrity

```python
# backend/app/core/dice.py
import secrets

def generate_roll(dice_type: int, count: int, modifier: int) -> dict:
    """Cryptographically secure roll generation."""
    rng = secrets.SystemRandom()
    results = [rng.randint(1, dice_type) for _ in range(count)]
    total = sum(results) + modifier

    return {
        "individual_results": results,
        "total": total,
        "timestamp": time.time_ns(),  # Nanosecond precision for uniqueness
    }
```

#### 2. Rate Limiting

```python
# backend/app/middleware/rate_limit.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@limiter.limit("1/5minutes")
async def create_room_endpoint():
    pass

# Socket.io rate limiting
from collections import defaultdict
import time

roll_rate_limit = defaultdict(list)  # player_id -> [timestamps]

def check_roll_rate_limit(player_id: str) -> bool:
    now = time.time()
    recent = [t for t in roll_rate_limit[player_id] if now - t < 10]
    roll_rate_limit[player_id] = recent

    if len(recent) >= 10:
        return False  # Rate limit exceeded

    roll_rate_limit[player_id].append(now)
    return True
```

#### 3. Input Validation

```python
# backend/app/schemas.py
from pydantic import BaseModel, Field, validator
import re

class CreateRoomRequest(BaseModel):
    mode: Literal['open', 'dm-led']
    player_name: str = Field(min_length=1, max_length=20)

    @validator('player_name')
    def validate_player_name(cls, v):
        # Alphanumeric + spaces only
        if not re.match(r'^[a-zA-Z0-9 ]+$', v):
            raise ValueError('Invalid characters in player name')
        return v.strip()

class RollDiceRequest(BaseModel):
    dice: str = Field(regex=r'^\d+d(4|6|8|10|12|20|100)$')
    modifier: int = Field(ge=-10, le=20)
    hidden: bool = False
    advantage: Literal['none', 'advantage', 'disadvantage'] = 'none'
```

#### 4. Session Security

```python
# backend/app/core/security.py
from fastapi import Cookie
from hashlib import sha256

def generate_session_hash(request: Request) -> str:
    """Create kick-tracking session hash."""
    ip = request.client.host
    user_agent = request.headers.get('user-agent', '')
    return sha256(f"{ip}:{user_agent}".encode()).hexdigest()

def is_session_kicked(room: Room, session_hash: str) -> bool:
    return session_hash in room.kicked_sessions
```

#### 5. XSS Prevention

```typescript
// frontend/src/utils/sanitize.ts
import DOMPurify from "dompurify";

export function sanitizePlayerName(name: string): string {
  return DOMPurify.sanitize(name, {
    ALLOWED_TAGS: [], // Strip all HTML
    ALLOWED_ATTR: [],
  });
}
```

#### 6. HTTPS/WSS Enforcement

```nginx
# nginx/nginx.conf
server {
    listen 80;
    server_name dice.example.com;
    return 301 https://$server_name$request_uri;  # Redirect HTTP to HTTPS
}

server {
    listen 443 ssl http2;
    server_name dice.example.com;

    ssl_certificate /etc/letsencrypt/live/dice.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dice.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # CSP
    add_header Content-Security-Policy "default-src 'self'; connect-src 'self' wss://dice.example.com" always;
}
```

---

## Deployment Architecture

### Docker Compose Structure

```yaml
# docker-compose.yml
version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    image: ghcr.io/sfines/dnd-dice-roller-backend:latest
    environment:
      - DATABASE_URL=sqlite:////data/permalinks.db
      - VALKEY_URL=redis://valkey:6379
      - SENTRY_DSN=${SENTRY_DSN}
      - ENVIRONMENT=production
    volumes:
      - ./data:/data
    depends_on:
      - valkey
    networks:
      - app-network
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first # Zero-downtime

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: ghcr.io/sfines/dnd-dice-roller-frontend:latest
    environment:
      - VITE_API_URL=https://dice.example.com
      - VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
    networks:
      - app-network

  valkey:
    image: valkey/valkey:8.0-alpine
    command: valkey-server --appendonly yes --appendfsync everysec
    volumes:
      - valkey-data:/data
    networks:
      - app-network
    deploy:
      resources:
        limits:
          memory: 512M

  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/letsencrypt:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
    depends_on:
      - backend
      - frontend
    networks:
      - app-network

volumes:
  valkey-data:
  data:

networks:
  app-network:
    driver: bridge
```

### Production VPS Setup

**Server Specs (DigitalOcean $20/month):**

- 4 GB RAM
- 2 vCPUs
- 80 GB SSD
- Ubuntu 22.04 LTS

**Installation Script:**

```bash
#!/bin/bash
# setup-vps.sh

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get update
apt-get install -y docker-compose-plugin

# Install Certbot
apt-get install -y certbot

# Create app directory
mkdir -p /opt/dnd-dice-roller
cd /opt/dnd-dice-roller

# Clone repo (deploy key)
git clone git@github.com:sfines/dnd-dice-roller.git .

# Generate SSL certificate
certbot certonly --standalone -d dice.example.com --non-interactive --agree-tos -m steve@example.com

# Create .env file
cat > .env <<EOF
SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_DSN=your-frontend-sentry-dsn
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
EOF

# Initial deploy
docker-compose pull
docker-compose up -d

# Setup auto-renewal
echo "0 3 * * * certbot renew --quiet && docker-compose restart nginx" | crontab -
```

### Deployment Workflow

**GitHub Actions Deployment:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to GHCR
        run: echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin

      - name: Build and Push Images
        run: |
          docker-compose build
          docker tag dnd-dice-roller-backend ghcr.io/sfines/dnd-dice-roller-backend:${{ github.sha }}
          docker tag dnd-dice-roller-backend ghcr.io/sfines/dnd-dice-roller-backend:latest
          docker tag dnd-dice-roller-frontend ghcr.io/sfines/dnd-dice-roller-frontend:${{ github.sha }}
          docker tag dnd-dice-roller-frontend ghcr.io/sfines/dnd-dice-roller-frontend:latest
          docker push ghcr.io/sfines/dnd-dice-roller-backend:${{ github.sha }}
          docker push ghcr.io/sfines/dnd-dice-roller-backend:latest
          docker push ghcr.io/sfines/dnd-dice-roller-frontend:${{ github.sha }}
          docker push ghcr.io/sfines/dnd-dice-roller-frontend:latest

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/dnd-dice-roller
            git pull origin main
            docker-compose pull
            docker-compose up -d
            docker system prune -af

      - name: Health Check
        run: |
          sleep 10
          curl -f https://dice.example.com/api/health || exit 1

      - name: Notify Sentry
        run: |
          curl -X POST https://sentry.io/api/0/organizations/your-org/releases/ \
            -H "Authorization: Bearer ${{ secrets.SENTRY_AUTH_TOKEN }}" \
            -d '{"version": "${{ github.sha }}", "projects": ["dnd-dice-roller"]}'
```

---

## Observability & Monitoring

### Structured Logging Format

```json
{
  "timestamp": "2025-11-15T19:45:33.123Z",
  "level": "info",
  "event": "roll_generated",
  "room_code": "ALPHA-1234",
  "player_id": "uuid-123",
  "dice": "1d20+5",
  "result": 23,
  "latency_ms": 45,
  "trace_id": "abc123"
}
```

### Key Metrics Dashboard

**Operational Metrics:**

- Rooms created per hour
- Active rooms (current)
- Players online (current)
- Rolls per minute
- Permalink shares per day

**Performance Metrics:**

- Roll generation latency (p50, p95, p99)
- WebSocket connection time
- Valkey response time
- Database query time

**Error Metrics:**

- WebSocket disconnect rate
- Roll generation failures
- Rate limit hits
- 5xx error rate

**Business Metrics:**

- New vs returning players
- Average session length
- Rolls per session
- Permalink click-through rate

### Sentry Configuration

**Alert Rules:**

- Error rate > 1% (immediate)
- Latency p95 > 1s (warning)
- WebSocket disconnect rate > 10% (immediate)
- Memory usage > 80% (warning)

---

## Testing Strategy

### Test Coverage Requirements

| Test Type               | Coverage Target            | Tools                    | When                    |
| ----------------------- | -------------------------- | ------------------------ | ----------------------- |
| **Backend Unit**        | 80%                        | Pytest                   | Every commit            |
| **Backend Integration** | Critical paths             | Pytest + WebSocket       | Every commit            |
| **Frontend Unit**       | 60%                        | Vitest + Testing Library | Every commit            |
| **E2E**                 | Walking skeleton + 3 flows | Playwright               | Week 1, then continuous |
| **Load**                | 50 concurrent rooms        | Locust                   | Week 8                  |
| **Security**            | OWASP Top 10               | Manual + Bandit          | Week 9                  |

### Critical E2E Test Paths

1. **Walking Skeleton** (Week 1)

   - Create room → Join room → Roll dice → View result

2. **DM Features** (Week 6)

   - Create DM-led room → Hidden roll → Reveal → Set DC → DC check

3. **Room Promotion** (Week 6)

   - Create Open room → Multiple rolls → Promote to DM-led → Verify history marker

4. **Reconnection** (Week 7)
   - Join room → Disconnect network → Reconnect → Verify state restored

---

## Implementation Roadmap

### Week 1: Walking Skeleton + E2E Foundation

- Initialize project from template
- Remove auth system
- Add Valkey service
- Add python-socketio
- Implement basic create/join/roll flow
- **E2E test:** Complete flow passing
- **Deliverable:** Create → Join → Roll → View (no DM features)

### Week 2-3: Backend Core

- Room lifecycle management
- All dice types + modifiers
- Advantage/disadvantage
- Roll history persistence (Valkey)
- Reconnection logic
- Rate limiting
- Session tracking

### Week 4-6: Frontend Development

- Replace Chakra with Tailwind
- Roll input UI (simple + advanced)
- Roll history feed
- DM features (hidden rolls, DC)
- Room promotion UI
- Roll presets (localStorage)
- Mobile responsive layout
- Permalink copy button

### Week 7: Edge Cases & Integration

- Race condition handling (sequence numbers)
- DM disconnect grace period
- Kick session tracking
- Room expiration warnings
- Permalink generation (SQLite)
- E2E test suite completion

### Week 8-9: Testing & Polish

- iOS Safari testing
- Load testing (50 rooms)
- Permalink public page
- Sentry integration
- Performance optimization
- Security audit

### Week 10: Buffer & Production

- CI/CD pipeline finalization
- VPS production deployment
- Documentation
- Final testing with D&D group

---

## Conclusion

This architecture provides a solid foundation for the D&D Dice Roller MVP while maintaining flexibility for future growth. Key decisions prioritize:

1. **Simplicity:** Leverage proven templates and patterns
2. **Reliability:** TDD from Day 1, comprehensive observability
3. **Performance:** Optimized for real-time requirements (<500ms latency)
4. **Security:** Server-side roll generation, proper rate limiting
5. **Maintainability:** Structured logging, clear data models, type safety

The architecture supports the 8-10 week timeline while ensuring production-grade quality for Steve's D&D group beta test in Week 8.

---

**Next Steps:**

1. Review and approve architecture decisions
2. Initialize project from template (Week 1, Story 1)
3. Begin walking skeleton implementation
4. Set up E2E test framework

**Document Status:** ✅ Ready for Implementation
