# ADR-005: Roll Generation Security

**Status:** Approved
**Date:** 2025-11-15
**Verification Date:** 2025-11-15
**Decision Maker:** Steve

## Context

Trust is paramount. Players must believe rolls are fair and unmanipulable.

## Decision

All rolls generated server-side via Socket.io events using cryptographic randomness.

## Flow

```
1. Client emits "roll_dice" event {dice: "1d20", modifier: 5, hidden: false}
2. Server validates request (player in room, not kicked)
3. Server generates roll using secrets.SystemRandom()
4. Server saves roll to Valkey room state
5. Server broadcasts "roll_result" to all room members
6. Server saves permalink to SQLite (async, non-blocking)
```

## Random Number Generation

```python
import secrets

def roll_die(sides: int) -> int:
    """Cryptographically secure die roll."""
    return secrets.SystemRandom().randint(1, sides)
```

## Why secrets.SystemRandom()

- OS-level entropy source (/dev/urandom)
- Cryptographically secure
- Not reproducible even if code is known
- Standard library (no dependencies)

## Client Validation (Defense in Depth)

- Client validates inputs before sending (UX)
- Server re-validates (security)
- Server is source of truth

## Consequences

- **Positive:** Mathematically provable fairness
- **Positive:** Permalinks provide audit trail
- **Negative:** Slight latency vs client-side (acceptable: <50ms)
- **Positive:** Prevents client-side manipulation entirely
