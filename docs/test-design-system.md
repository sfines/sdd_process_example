# System-Level Test Design: D&D Dice Roller

**Date:** 2025-11-20
**Author:** Steve
**Status:** Draft
**Purpose:** Testability assessment before solutioning-gate-check (Phase 3)

---

## Executive Summary

**Scope:** System-level testability review for D&D Dice Roller architecture

**Testability Assessment:** ✅ **PASS** with minor recommendations

**Key Findings:**

- Architecture is highly testable with clear boundaries
- WebSocket real-time requirements demand specialized testing approach
- Security testability is strong (server-side rolls, proper auth)
- Performance testability well-defined with clear SLOs
- Minimal testability concerns identified (see Section 6)

**Recommendation:** **PROCEED TO SOLUTIONING-GATE-CHECK** with confidence. Architecture supports comprehensive test coverage.

---

## 1. Testability Assessment

### 1.1 Controllability: ✅ PASS

**Can we control system state for testing?**

**✅ Strengths:**

- **State Factories**: Valkey (Redis) allows direct state seeding via API
  - Create room state programmatically for any test scenario
  - Seed roll history without UI interaction
  - Set player sessions, kick lists, mode changes directly
- **Server-Side Rolls**: All dice rolls generated server-side
  - Can mock `secrets.SystemRandom()` for deterministic tests
  - Easy to test edge cases (critical hits, failures)
- **WebSocket Mocking**: Socket.io supports test mode
  - Can simulate disconnect/reconnect scenarios
  - Can inject network failures programmatically
- **Database Reset**: SQLite permalinks easily cleared between tests
  - In-memory SQLite for unit/integration tests
  - File-based SQLite for E2E (cleared via script)

**✅ Testable Scenarios:**

- Create room in any state (Open, DM-led, expired)
- Inject specific roll results for validation
- Simulate player disconnect/reconnect
- Trigger room expiration warnings on demand
- Test hidden roll reveal flows

**⚠️ Minor Concern:**

- WebSocket reconnection backoff requires time manipulation
  - **Mitigation**: Use Playwright clock mocking (`page.clock.fastForward()`)
  - Already planned in architecture

**Controllability Score:** **9/10** (Excellent)

---

### 1.2 Observability: ✅ PASS

**Can we inspect system state and validate outcomes?**

**✅ Strengths:**

- **Structured Logging**: `structlog` provides JSON logs
  - All events logged: room create, join, roll, disconnect
  - Correlation IDs for tracing player actions
  - Log levels (DEBUG, INFO, WARN, ERROR) for filtering
- **Sentry Integration**: Frontend and backend error tracking
  - Automatic error capture with context
  - Breadcrumbs for user actions before error
- **Test Results**: Clear success/failure criteria
  - Roll results deterministic (when mocked)
  - WebSocket events observable via client-side listeners
  - Room state queryable via Redis CLI or API endpoint
- **Visual Debugging**: Playwright trace viewer
  - Full video recordings of test runs
  - HAR files for network debugging
  - Screenshots on failure

**✅ Observable State:**

- Room state (players, rolls, DC, mode) via API or Redis query
- Player connection status via WebSocket events
- Roll history complete and immutable
- Permalink storage in SQLite queryable
- Frontend state via Zustand DevTools

**⚠️ Minor Concern:**

- Real-time synchronization latency hard to observe precisely
  - **Mitigation**: Log timestamps on client and server for delta calculation
  - Already planned: NFR-P1 targets < 500ms (p95)

**Observability Score:** **9/10** (Excellent)

---

### 1.3 Reliability: ✅ PASS

**Are tests isolated, deterministic, and reproducible?**

**✅ Strengths:**

- **Test Isolation**: Each test gets unique room code
  - No shared state between tests
  - Valkey can run in test mode (separate DB index)
  - SQLite in-memory for unit/integration tests
- **Deterministic Waits**: Playwright's network-first pattern
  - Intercept responses BEFORE triggering actions
  - No arbitrary `sleep()` delays
  - Auto-waiting for elements (built-in retry)
- **Parallel-Safe**: Room codes unique, no global state
  - Tests can run in parallel without collision
  - Playwright sharding supported (CI optimization)
- **Cleanup Discipline**: Factories with auto-cleanup
  - Rooms auto-expire (5 hours max)
  - SQLite reset between test runs
  - Docker Compose tear-down clears Valkey state

**✅ Reproducible Scenarios:**

- Room creation always generates unique code
- Rolls deterministic when RNG mocked
- Disconnect/reconnect flows repeatable via clock mocking
- Kick tracking isolated per room

**⚠️ Minor Concern:**

- WebSocket race conditions in multi-player scenarios
  - **Mitigation**: Use sequence numbers for deterministic ordering (already in architecture)
  - Test with artificial delays to expose races

**Reliability Score:** **9/10** (Excellent)

---

### 1.4 Overall Testability Rating

| Dimension       | Score | Status  | Notes                                      |
| --------------- | ----- | ------- | ------------------------------------------ |
| Controllability | 9/10  | ✅ PASS | Excellent state control via Valkey + mocks |
| Observability   | 9/10  | ✅ PASS | Strong logging + error tracking            |
| Reliability     | 9/10  | ✅ PASS | Isolated tests, deterministic waits        |
| **OVERALL**     | 9/10  | ✅ PASS | **Highly testable architecture**           |

**Verdict:** Architecture is production-ready from a testability perspective. Proceed to solutioning-gate-check.

---

## 2. Architecturally Significant Requirements (ASRs)

### 2.1 ASR-1: Real-Time Roll Synchronization (< 500ms p95)

**Category:** PERF  
**Probability:** 2 (Possible - depends on network + server load)  
**Impact:** 3 (Critical - breaks core UX if violated)  
**Risk Score:** **6** (HIGH PRIORITY)

**Description:**  
All dice rolls must propagate to all players in under 500ms (95th percentile). Slow sync degrades player experience and trust.

**Testability Analysis:**

- ✅ Can simulate load with k6 (50 rooms, 8 players each)
- ✅ Can measure latency via server/client timestamps
- ✅ Can inject network delays via Playwright throttling
- ⚠️ Requires realistic load testing environment (staging)

**Test Approach:**

- **Load Testing (k6):** Simulate 400 concurrent users, measure p95 latency
- **E2E Testing (Playwright):** Network throttling to simulate 3G/4G, measure sync time
- **Integration Testing:** Direct WebSocket event timing (no UI)

**Mitigation:**

- Optimize WebSocket event serialization (msgpack vs JSON)
- Redis pipelining for batch operations
- WebSocket connection pooling (if needed)

**Owner:** Backend Lead  
**Timeline:** Week 7 (Load testing phase)

---

### 2.2 ASR-2: Cryptographic Roll Generation

**Category:** SEC  
**Probability:** 1 (Unlikely - Python's `secrets` module is cryptographically secure)  
**Impact:** 3 (Critical - trust violation if compromised)  
**Risk Score:** **3** (MEDIUM PRIORITY)

**Description:**  
All rolls must be generated server-side using `secrets.SystemRandom()` to prevent client manipulation.

**Testability Analysis:**

- ✅ Easy to test: Client cannot influence roll outcome
- ✅ Can verify entropy via statistical tests (chi-squared)
- ✅ Can mock RNG for deterministic tests

**Test Approach:**

- **Unit Testing:** Mock `secrets.SystemRandom()`, verify call count and params
- **Integration Testing:** Generate 10,000 rolls, verify distribution (chi-squared test)
- **Security Testing:** Attempt client-side manipulation, verify server rejects

**Mitigation:**

- None required (Python's `secrets` is FIPS 140-2 compliant)
- Document RNG choice in security audit section

**Owner:** Security Lead  
**Timeline:** Week 2 (Backend core development)

---

### 2.3 ASR-3: Room Auto-Expiration (5 hours Open, 30 min DM-led)

**Category:** OPS  
**Probability:** 2 (Possible - depends on background job reliability)  
**Impact:** 2 (Degraded - wastes resources, confuses users)  
**Risk Score:** **4** (MEDIUM PRIORITY)

**Description:**  
Rooms must auto-expire to prevent Valkey memory exhaustion and zombie rooms.

**Testability Analysis:**

- ✅ Can mock time via Playwright clock (`page.clock.fastForward()`)
- ✅ Can verify Redis TTL directly
- ✅ Can test expiration warnings (3 min, 30 sec)

**Test Approach:**

- **Integration Testing:** Create room, fast-forward clock, verify expiration event
- **E2E Testing:** Verify users see warnings and disconnection message
- **Load Testing:** Verify no memory leaks over 8-hour soak test

**Mitigation:**

- Redis TTL + EXPIRE command (built-in)
- Background job for cleanup verification (weekly)

**Owner:** DevOps Lead  
**Timeline:** Week 3 (Backend core development)

---

### 2.4 ASR-4: DM Disconnect Grace Period (60 seconds)

**Category:** OPS  
**Probability:** 2 (Possible - network hiccups common)  
**Impact:** 2 (Degraded - disrupts game session)  
**Risk Score:** **4** (MEDIUM PRIORITY)

**Description:**  
DM-led rooms must tolerate DM disconnection for 60 seconds before terminating room.

**Testability Analysis:**

- ✅ Can simulate disconnect via Playwright (`page.context().setOffline(true)`)
- ✅ Can fast-forward clock to test grace period
- ✅ Can verify reconnection restores state

**Test Approach:**

- **E2E Testing:** Disconnect DM, wait 30s, reconnect → Verify room survives
- **E2E Testing:** Disconnect DM, wait 61s → Verify room terminates
- **Integration Testing:** Test WebSocket reconnection logic

**Mitigation:**

- Socket.io automatic reconnection (built-in)
- Grace period timer in backend (clear on reconnect)

**Owner:** Backend Lead  
**Timeline:** Week 7 (Edge cases & integration)

---

### 2.5 ASR-5: Permalink 30-Day Retention

**Category:** DATA  
**Probability:** 1 (Unlikely - SQLite is reliable)  
**Impact:** 2 (Degraded - broken links, user disappointment)  
**Risk Score:** **2** (LOW PRIORITY)

**Description:**  
Roll permalinks must persist for 30 days, then expire gracefully with user-friendly message.

**Testability Analysis:**

- ✅ Can mock database timestamps for expiration testing
- ✅ Can verify cleanup job runs correctly
- ✅ Can test expired permalink page renders correctly

**Test Approach:**

- **Unit Testing:** Test cleanup job logic (filter old records)
- **Integration Testing:** Create permalink, mock expiration, verify deletion
- **E2E Testing:** Access expired permalink, verify "Link expired" message

**Mitigation:**

- Daily cron job for cleanup (standard pattern)
- SQLite `created_at` timestamp indexed for fast queries

**Owner:** Backend Lead  
**Timeline:** Week 7 (Edge cases & integration)

---

## 3. Test Levels Strategy

Based on architecture (real-time WebSocket app with React frontend, FastAPI backend, Valkey state, SQLite permalinks):

### 3.1 Recommended Test Split

**Target Distribution:**

- **Unit:** 50% (business logic, dice rolling, state management)
- **Integration:** 30% (WebSocket flows, API contracts, Valkey interactions)
- **E2E:** 20% (critical user journeys, visual validation)

**Rationale:**

- Real-time architecture requires heavy integration testing (WebSocket flows)
- Business logic (dice rolling, room state) benefits from fast unit tests
- UI is relatively simple → Lower E2E percentage
- Critical paths (create/join/roll) must be E2E validated

### 3.2 Test Level Assignment by Component

| Component           | Unit | Integration | E2E | Rationale                                   |
| ------------------- | ---- | ----------- | --- | ------------------------------------------- |
| Dice Rolling Logic  | 80%  | 10%         | 10% | Pure functions, easy to unit test           |
| Room Lifecycle      | 40%  | 50%         | 10% | State management needs integration coverage |
| WebSocket Events    | 20%  | 70%         | 10% | Real-time flows require integration tests   |
| Player Management   | 50%  | 40%         | 10% | Mix of logic + state, balanced coverage     |
| Roll History        | 60%  | 30%         | 10% | Rendering logic + Valkey persistence        |
| DM Features         | 40%  | 40%         | 20% | Complex flows, critical UX → More E2E       |
| Permalinks          | 50%  | 40%         | 10% | SQLite logic + API validation               |
| Frontend Components | 70%  | 20%         | 10% | Vitest + Testing Library for UI components  |

### 3.3 Test Environment Requirements

**Local Development:**

- Docker Compose (backend, frontend, Valkey, SQLite in-memory)
- Playwright for E2E (headed mode for debugging)
- Pytest for backend unit/integration
- Vitest for frontend unit tests

**CI Pipeline:**

- GitHub Actions with matrix strategy (Node 24, Python 3.13)
- Valkey service container
- SQLite file-based (cleared between runs)
- Playwright sharding (4 workers for parallel E2E)

**Staging:**

- VPS with production-like environment
- k6 load testing (50 rooms, 400 users)
- Sentry error tracking enabled
- Let's Encrypt SSL for WSS testing

---

## 4. NFR Testing Approach

### 4.1 Security Testing

**Tools:** Playwright (E2E), Bandit (SAST), OWASP ZAP (DAST)

**Test Scenarios:**

| Scenario                       | Test Level  | Priority | Tool       |
| ------------------------------ | ----------- | -------- | ---------- |
| Server-side roll generation    | Integration | P0       | Pytest     |
| Client cannot manipulate rolls | E2E         | P0       | Playwright |
| Rate limiting (room creation)  | Integration | P1       | Pytest     |
| Rate limiting (roll spam)      | Integration | P1       | Pytest     |
| XSS prevention (player names)  | E2E         | P1       | Playwright |
| SQL injection (room codes)     | Integration | P1       | Pytest     |
| Session security (HttpOnly)    | E2E         | P1       | Playwright |
| WSS enforcement (TLS)          | E2E         | P2       | Playwright |
| Input sanitization (modifiers) | Unit        | P1       | Pytest     |
| CAPTCHA on room creation       | E2E         | P2       | Playwright |

**Pass Criteria:**

- ✅ PASS: All P0/P1 security tests green
- ⚠️ CONCERNS: P2 failures with documented waivers
- ❌ FAIL: Any P0 security test fails (blocks release)

---

### 4.2 Performance Testing

**Tools:** k6 (load testing), Playwright (network throttling), Locust (optional)

**Test Scenarios:**

| Scenario                       | Tool       | Threshold     | Priority | Environment |
| ------------------------------ | ---------- | ------------- | -------- | ----------- |
| Roll sync latency (p95)        | k6         | < 500ms       | P0       | Staging     |
| Concurrent rooms (50+)         | k6         | No errors     | P0       | Staging     |
| Concurrent players (400+)      | k6         | No errors     | P0       | Staging     |
| Room expiration (5 hours)      | k6         | Memory stable | P1       | Staging     |
| Virtual scrolling (500+ rolls) | Playwright | 60fps         | P1       | Local       |
| Initial load (3G)              | Playwright | < 2s          | P1       | Local       |
| Reconnection time              | Playwright | < 3s          | P1       | Local       |
| Valkey memory usage            | k6         | < 500MB       | P2       | Staging     |

**Pass Criteria:**

- ✅ PASS: All P0/P1 thresholds met with profiling evidence
- ⚠️ CONCERNS: P1 threshold within 10% of limit (e.g., p95 = 480ms)
- ❌ FAIL: Any P0 threshold breached

**k6 Test Example:**

```javascript
// tests/nfr/performance.k6.js
export const options = {
  stages: [
    { duration: '2m', target: 50 }, // Ramp to 50 concurrent rooms
    { duration: '5m', target: 50 }, // Sustain load
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // Roll sync < 500ms (p95)
    errors: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  // Create room, join, roll, verify latency
}
```

---

### 4.3 Reliability Testing

**Tools:** Playwright (chaos engineering), Pytest (error handling)

**Test Scenarios:**

| Scenario                           | Test Level  | Priority | Tool       |
| ---------------------------------- | ----------- | -------- | ---------- |
| WebSocket reconnection (auto)      | E2E         | P0       | Playwright |
| DM disconnect grace period (60s)   | E2E         | P0       | Playwright |
| Room expiration warnings (3m, 30s) | E2E         | P1       | Playwright |
| Kicked player blocked from rejoin  | Integration | P1       | Pytest     |
| Race condition handling (sequence) | Integration | P1       | Pytest     |
| Valkey restart (AOF recovery)      | Integration | P2       | Pytest     |
| SQLite corruption recovery         | Integration | P2       | Pytest     |

**Pass Criteria:**

- ✅ PASS: All P0 reliability tests green
- ⚠️ CONCERNS: P1 failures with documented recovery paths
- ❌ FAIL: Any P0 reliability test fails

---

### 4.4 Maintainability Testing

**Metrics:** Coverage, code duplication, observability

**Targets:**

| Metric                     | Target | Tool               | Priority |
| -------------------------- | ------ | ------------------ | -------- |
| Backend unit coverage      | ≥80%   | pytest-cov         | P0       |
| Frontend unit coverage     | ≥60%   | vitest --coverage  | P1       |
| E2E critical path coverage | 100%   | Playwright reports | P0       |
| Code duplication           | <5%    | jscpd, radon       | P2       |
| Structured logging         | 100%   | structlog audit    | P1       |
| Error tracking enabled     | 100%   | Sentry integration | P1       |

**Pass Criteria:**

- ✅ PASS: Backend ≥80%, frontend ≥60%, E2E critical paths 100%
- ⚠️ CONCERNS: Coverage within 5% of target
- ❌ FAIL: Backend <70% or E2E gaps in critical paths

---

## 5. Test Environment Requirements

### 5.1 Infrastructure Needs

| Environment | Purpose            | Components                               | Cost     |
| ----------- | ------------------ | ---------------------------------------- | -------- |
| **Local**   | Development + Unit | Docker Compose, Valkey, SQLite in-memory | Free     |
| **CI**      | Automated testing  | GitHub Actions, Valkey container, SQLite | Free     |
| **Staging** | Load + Integration | VPS (DigitalOcean), Valkey, PostgreSQL   | $20/mo   |
| **Prod**    | Beta testing       | Google CloudRun, managed Valkey          | Variable |

### 5.2 Tool Requirements

**Backend:**

- Python 3.13+, pytest, pytest-cov, pytest-asyncio
- python-socketio, FastAPI test client
- Bandit (SAST), safety (dependency scanning)

**Frontend:**

- Node 24 LTS, Vitest, Testing Library
- Playwright (E2E), eslint, prettier
- Tailwind CSS (no runtime JS)

**Load Testing:**

- k6 (OSS), Locust (optional backup)

**Observability:**

- structlog (JSON logs), Sentry (error tracking)
- UptimeRobot (free uptime monitoring)

---

## 6. Testability Concerns

### 6.1 WebSocket Real-Time Testing Complexity

**Risk Category:** TECH  
**Probability:** 2 (Possible - WebSocket testing is tricky)  
**Impact:** 2 (Degraded - flaky tests slow development)  
**Risk Score:** **4** (MEDIUM)

**Concern:**  
WebSocket tests can be flaky due to timing issues, race conditions, and network variability.

**Mitigation:**

1. **Network-First Pattern:** Intercept responses BEFORE triggering actions
   - `const promise = page.waitForResponse('**/api/roll'); await page.click('button'); await promise;`
2. **Deterministic Waits:** Use Playwright's auto-waiting (no `sleep()`)
3. **Sequence Numbers:** Backend assigns sequence IDs to prevent race conditions (already in architecture)
4. **Mock Time:** Use `page.clock.fastForward()` for expiration testing

**Owner:** QA Lead  
**Timeline:** Week 1 (E2E foundation)  
**Status:** ✅ Addressed in architecture

---

### 6.2 iOS Safari Quirks

**Risk Category:** TECH  
**Probability:** 2 (Possible - Safari has known layout bugs)  
**Impact:** 2 (Degraded - mobile UX impaired)  
**Risk Score:** **4** (MEDIUM)

**Concern:**  
iOS Safari has known issues with viewport units, scrolling, and touch events.

**Mitigation:**

1. **Explicit Safari Testing:** Use BrowserStack or real device testing (Week 8)
2. **Fallback Patterns:** Use `vh` sparingly, prefer `min-height: 100%`
3. **Touch Target Sizing:** Minimum 44x44px (WCAG compliant)
4. **Polyfills:** Include Safari-specific CSS hacks if needed

**Owner:** Frontend Lead  
**Timeline:** Week 8-9 (Mobile testing phase)  
**Status:** ⚠️ To be validated in testing

---

### 6.3 No Horizontal Scaling in MVP

**Risk Category:** OPS  
**Probability:** 1 (Unlikely - 50 rooms is conservative for single VPS)  
**Impact:** 2 (Degraded - limits growth)  
**Risk Score:** **2** (LOW)

**Concern:**  
Single-server architecture cannot scale beyond ~50 concurrent rooms without refactoring.

**Mitigation:**

1. **Deferred to Phase 2:** Horizontal scaling not needed for MVP (Steve's D&D group = 1 room)
2. **Load Testing Evidence:** Week 8 load tests validate 50-room capacity
3. **Future-Proof Design:** Stateless backend enables future load balancing

**Owner:** DevOps Lead  
**Timeline:** Post-MVP (if needed)  
**Status:** ✅ Documented as known limitation

---

## 7. Recommendations for Sprint 0

### 7.1 Framework Initialization (`*framework` workflow)

**When to Run:** Week 1 (before Story 1.2)

**Purpose:** Initialize Playwright + pytest test infrastructure

**Actions:**

1. Install Playwright with TypeScript config
2. Configure pytest with async support (`pytest-asyncio`)
3. Set up fixture architecture (factories, cleanup)
4. Configure Vitest for frontend unit tests
5. Add CI workflow template (runs on push to `develop`)

**Deliverables:**

- `playwright.config.ts` with baseURL, timeout, trace settings
- `pytest.ini` with async support and coverage thresholds
- `vitest.config.ts` for frontend component tests
- `.github/workflows/test.yml` for CI automation

---

### 7.2 CI Pipeline Configuration (`*ci` workflow)

**When to Run:** Week 1 (after `*framework`)

**Purpose:** Automate test execution on every push

**Actions:**

1. GitHub Actions matrix (Python 3.13, Node 24)
2. Valkey service container in CI
3. Playwright sharding (4 workers)
4. Artifact collection (traces, screenshots, coverage)
5. Burn-in loops for flaky test detection (optional)

**Deliverables:**

- CI pipeline runs on push to `develop`
- E2E tests run in parallel (4 shards)
- Coverage reports uploaded to GitHub
- Slack notifications for failures (optional)

---

### 7.3 Walking Skeleton E2E Test

**When to Run:** Story 1.2 (Week 1)

**Purpose:** Prove E2E testing infrastructure works

**Test Scenario:**

1. Start backend + frontend via Docker Compose
2. Open browser with Playwright
3. Verify homepage loads
4. Create room (enter name, click "Create Room")
5. Verify room code displayed
6. Copy room code
7. Open second browser (incognito)
8. Join room with code
9. Roll 1d20 from Player 1
10. Verify Player 2 sees roll in <500ms

**Acceptance Criteria:**

- Test passes consistently (3/3 runs)
- Execution time < 30 seconds
- No flaky failures
- Trace viewer captures full flow

---

## 8. Quality Gate Criteria

### 8.1 Solutioning Gate Check (Current Phase)

**Pass Criteria:**

- ✅ **Testability:** All 3 dimensions (controllability, observability, reliability) ≥8/10
- ✅ **ASRs Identified:** All architecturally significant requirements risk-scored
- ✅ **Test Strategy:** Test levels strategy defined (unit/integration/E2E split)
- ✅ **NFR Approach:** Security, performance, reliability, maintainability test plans defined
- ✅ **Concerns Mitigated:** All high-priority testability concerns have mitigation plans

**Result:** ✅ **PASS** - Architecture is testable, proceed to implementation

---

### 8.2 Sprint 0 Gate Check (Week 1)

**Pass Criteria:**

- ✅ Playwright + pytest + Vitest frameworks initialized
- ✅ CI pipeline runs tests on every push
- ✅ Walking skeleton E2E test passes (create → join → roll)
- ✅ Coverage thresholds enforced (80% backend, 60% frontend)
- ✅ Structured logging + Sentry integration configured

---

### 8.3 Production Readiness Gate (Week 10)

**Pass Criteria:**

- ✅ All P0 tests pass (security, performance, reliability)
- ✅ All P1 tests ≥95% pass rate
- ✅ No high-priority risks (score ≥6) unmitigated
- ✅ Load testing validates 50 rooms, 400 users
- ✅ iOS Safari testing complete
- ✅ Steve's D&D group completes 3-hour session (MVP success criteria)

---

## 9. Appendix

### 9.1 Knowledge Base References

- `nfr-criteria.md` - NFR validation approach (security, performance, reliability, maintainability)
- `test-levels-framework.md` - Test level selection guidance (E2E vs API vs Unit)
- `risk-governance.md` - Risk classification framework (6 categories, scoring, gate decisions)
- `probability-impact.md` - Risk scoring methodology (probability × impact matrix)

### 9.2 Related Documents

- PRD: `docs/PRD.md`
- Architecture: `docs/architecture.md`
- Epics: `docs/epics.md`
- Workflow Status: `docs/bmm-workflow-status.yaml`

---

**Generated by**: BMad TEA Agent - Test Architect Module  
**Workflow**: `.bmad/bmm/testarch/test-design` (System-Level Mode)  
**Version**: 4.0 (BMad v6)  
**Next Step**: Run `solutioning-gate-check` workflow
