# Observability & Monitoring Architecture

This document details the observability and monitoring architecture, which is responsible for providing insights into the application's health and performance.

## Architectural Decisions

- **[ADR-009: Observability & Monitoring](./../adrs/009-observability-monitoring.md)**

## Technology Stack

| Component          | Technology  | Version   | Purpose                   |
| ------------------ | ----------- | --------- | ------------------------- |
| **Logging**        | structlog   | 23.2+     | Structured JSON logs      |
| **Error Tracking** | Sentry      | Latest    | Frontend + backend errors |
| **Monitoring**     | UptimeRobot | Free tier | Uptime monitoring         |

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
