# ADR-003: State Storage Strategy

**Status:** Approved
**Date:** 2025-11-15
**Decision Maker:** Steve

## Context

Active room state (players, rolls, DC) needs low-latency access and persistence across backend restarts. Need to choose storage pattern and technology.

## Decision

Use Valkey (Redis fork) with single-hash-per-room pattern.

## Valkey Choice Rationale

- Drop-in Redis replacement (protocol-compatible)
- Community-driven (no vendor lock-in)
- Same performance characteristics as Redis
- Supports all Redis data structures and commands

## Storage Pattern

```
Key: room:{ROOM_CODE}
Value: JSON-serialized Room object
TTL: 1800s (DM-led) or 18000s (Open)
```

## Why Single Hash vs Nested Keys

- Atomic updates (no partial state)
- Simpler consistency model
- Adequate performance for 50 rooms
- Easier debugging (see full state at once)

## Persistence Configuration

```
# valkey.conf
appendonly yes
appendfsync everysec
```

Ensures room state survives restarts (AOF persistence).

## Memory Estimation

- Average room: ~50KB (8 players, 100 rolls)
- 50 concurrent rooms: ~2.5MB
- Valkey overhead: ~10MB
- **Total:** < 15MB (well within limits)

## Consequences

- **Positive:** Simple, atomic, performant
- **Negative:** Entire room updates on any change (acceptable for scale)
- **Positive:** Easy migration to Redis if needed
- **Positive:** AOF persistence ensures room recovery on restart
