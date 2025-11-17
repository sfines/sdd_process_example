# Permalink Storage Architecture

This document details the permalink storage architecture, which is responsible for storing and retrieving permanent roll data.

## Architectural Decisions

- **[ADR-004: Permalink Storage Schema](./../adrs/004-permalink-storage-schema.md)**

## Technology Stack

| Component    | Technology | Version | Purpose                              |
| ------------ | ---------- | ------- | ------------------------------------ |
| **Database** | SQLite     | 3.40+   | Permalink storage (MVP)              |
| **ORM**      | SQLModel   | 0.0.14+ | Database models (SQLAlchemy wrapper) |

## Data Architecture

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

## API Design

### REST API Endpoints

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
