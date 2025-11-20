# Security Architecture

This document details the security architecture, which is responsible for ensuring the integrity, confidentiality, and availability of the application.

## Architectural Decisions

- **[ADR-005: Roll Generation Security](./../adrs/005-roll-generation-security.md)**

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
import DOMPurify from 'dompurify';

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
