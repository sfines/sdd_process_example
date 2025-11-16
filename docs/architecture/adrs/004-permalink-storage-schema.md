# ADR-004: Permalink Storage Schema

**Status:** Approved
**Date:** 2025-11-15
**Decision Maker:** Steve

## Context

Permalinks are the killer feature. Need to balance storage cost, query performance, and richness of shared data.

## Decision

Use SQLite with rich context schema for MVP, designed for PostgreSQL migration.

## Schema

```sql
CREATE TABLE roll_permalinks (
  roll_id TEXT PRIMARY KEY,              -- UUID
  room_code TEXT NOT NULL,               -- ALPHA-1234
  room_mode TEXT NOT NULL,               -- 'open' or 'dm-led'
  player_name TEXT NOT NULL,             -- Max 20 chars
  dice_formula TEXT NOT NULL,            -- e.g., "3d6+5"
  dice_type INTEGER NOT NULL,            -- e.g., 6
  dice_count INTEGER NOT NULL,           -- e.g., 3
  modifier INTEGER NOT NULL,             -- e.g., 5
  advantage TEXT NOT NULL,               -- 'none', 'advantage', 'disadvantage'
  individual_results TEXT NOT NULL,      -- JSON array [4, 2, 6]
  total INTEGER NOT NULL,                -- e.g., 17
  dc_check TEXT,                         -- JSON {dc: 15, passed: true} if applicable
  timestamp INTEGER NOT NULL,            -- Unix timestamp
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL               -- ISO 8601 timestamp (30 days from created_at)
);

CREATE INDEX idx_expires_at ON roll_permalinks(expires_at);
CREATE INDEX idx_created_at ON roll_permalinks(created_at);
```

## Why Rich Context

Permalinks are shareable on social media. Rich context makes them more engaging:
- Room mode shows game style
- DC check shows stakes
- Advantage/disadvantage shows tactical choice
- All dice results show full transparency

## SQLite for MVP Rationale

- Zero configuration, single file
- Sufficient for 10K+ permalinks
- Easy backup (copy file)
- Simple migration to PostgreSQL later

## Cleanup Job

```python
# Daily cron: Delete expired permalinks
DELETE FROM roll_permalinks 
WHERE expires_at < datetime('now')
```

## Storage Estimation

- Average row: ~200 bytes
- 1000 rolls/day × 30 days = 30K rows
- 30K × 200 bytes = ~6MB
- **Conclusion:** Trivial storage footprint

## Consequences

- **Positive:** Rich, shareable permalinks enhance viral potential
- **Positive:** SQLite simplicity for MVP
- **Neutral:** Migration path to PostgreSQL when scaling (template already uses it)
- **Positive:** 30-day retention balances utility with storage costs
