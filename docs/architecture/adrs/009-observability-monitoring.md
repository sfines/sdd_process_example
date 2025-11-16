# ADR-009: Observability & Monitoring

**Status:** Approved
**Date:** 2025-11-15
**Decision Maker:** Steve

## Context

Real-time multiplayer app needs visibility into errors, performance, and user experience.

## Decision

Implement dual observability: Structured JSON logging + Sentry error tracking.

## Structured Logging

```python
# backend/app/core/logging.py
import structlog

logger = structlog.get_logger()

# Usage
logger.info(
    "roll_generated",
    room_code="ALPHA-1234",
    player_id="uuid-123",
    dice="1d20+5",
    result=23,
    latency_ms=45
)
```

## Log Output Format

```json
{
  "event": "roll_generated",
  "room_code": "ALPHA-1234",
  "player_id": "uuid-123",
  "dice": "1d20+5",
  "result": 23,
  "latency_ms": 45,
  "timestamp": "2025-11-15T19:45:33.123Z",
  "level": "info"
}
```

## Sentry Integration

```python
# backend/app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastAPIIntegration
from sentry_sdk.integrations.redis import RedisIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    environment=settings.ENVIRONMENT,
    traces_sample_rate=0.1,  # 10% transaction sampling
    profiles_sample_rate=0.1,
    integrations=[
        FastAPIIntegration(),
        RedisIntegration(),
    ],
)
```

## Key Metrics to Track

- **Latency:** Roll generation → broadcast time
- **Errors:** WebSocket disconnect rate, roll failures
- **Usage:** Rooms created, rolls per session, permalink shares
- **Performance:** Valkey response time, database query time

## Sentry Free Tier

- 5,000 errors/month
- 10,000 transactions/month
- Sufficient for MVP + testing

## Consequences

- **Positive:** Production-grade observability from day one
- **Positive:** Structured logs enable future log aggregation (Datadog, etc.)
- **Positive:** Sentry provides user impact visibility
- **Negative:** External dependency (acceptable: has free tier)
- **Positive:** Both backend and frontend error tracking
