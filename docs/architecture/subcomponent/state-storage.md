# State Storage Architecture

This document details the state storage architecture, which is responsible for managing the real-time state of the application.

## Architectural Decisions

- **[ADR-003: State Storage Strategy](./../adrs/003-state-storage-strategy.md)**

## Technology Stack

| Component       | Technology | Version | Purpose                 |
| --------------- | ---------- | ------- | ----------------------- |
| **Cache/State** | Valkey     | 8.0+    | Room state (Redis fork) |

## Data Architecture

### Valkey Room State Schema

```typescript
interface Room {
  room_code: string; // WORD-#### format (e.g., "ALPHA-1234")
  mode: 'open' | 'dm-led'; // Room mode
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
  advantage: 'none' | 'advantage' | 'disadvantage';
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
  from_mode: 'open';
  to_mode: 'dm-led';
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

See the [JSON Schema](./json-schema.md) for detailed data structures.
