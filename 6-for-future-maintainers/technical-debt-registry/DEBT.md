# Technical Debt Registry

## Debt Summary

| Severity | Count | Total Effort |
|----------|-------|--------------|
| 🔴 Critical | 0 | - |
| 🟡 High | 3 | ~2 weeks |
| 🟢 Medium | 4 | ~2 weeks |
| ⚪ Low | 2 | ~1 week |
| **Total** | **9** | **~5 weeks** |

**Trend:** 📊 Stable (MVP baseline)

---

## Active Technical Debt

### 🟡 DEBT-001: No Input Sanitization

**Type:** Deliberate and Prudent
**Category:** Security
**Severity:** High
**Date Incurred:** 2025-01-15
**Interest Rate:** High 💸💸💸

#### What We Did
Basic length validation only. No XSS protection, no HTML entity encoding.

```typescript
// Current
if (playerName.length < 3 || playerName.length > 20) {
  return error;
}
```

#### What We Should Have Done
Full input sanitization:
```typescript
function sanitizePlayerName(name: string): string {
  // Strip HTML tags
  // Encode entities
  // Whitelist characters
  return sanitized;
}
```

#### Why We Didn't
- MVP focus on functionality
- Local network trust model
- Planned for post-MVP security hardening

#### Current Cost
- Vulnerable to XSS if player name contains `<script>` tags
- Could inject HTML into other players' browsers

#### Future Cost
- If exposed to public internet, critical vulnerability
- Each day of exposure increases risk

#### Triggers for Fixing
- 🔴 **BEFORE** any public deployment
- 🟡 Next security sprint
- 🟡 Before V1.0 release

#### Mitigation
- Keep on local network only
- Document in security warnings
- Add to threat model as HIGH priority

#### Estimated Fix Effort
Small (1-2 days)

#### Dependencies
- Security test suite (REFACTOR-004)
- Input validation library selection

**Cross-reference:**
- Threat Model: T1.1, T1.3
- Security Tests: Input Validation section
- Refactoring: REFACTOR-004

---

### 🟡 DEBT-002: No Rate Limiting

**Type:** Deliberate and Prudent
**Category:** Security / Performance
**Severity:** High
**Date Incurred:** 2025-01-15
**Interest Rate:** Medium 💸💸

#### What We Did
No rate limiting on any WebSocket events or HTTP endpoints.

```typescript
// Current
socket.on('submitWord', (data) => {
  // Process immediately, no throttling
});
```

#### What We Should Have Done
Rate limiting per client:
```typescript
const rateLimiter = new RateLimiter({
  submitWord: { limit: 10, window: 60000 }, // 10 per minute
  joinGame: { limit: 5, window: 60000 }
});
```

#### Why We Didn't
- MVP focus
- Local network = trusted environment
- Complex to implement correctly

#### Current Cost
- Vulnerable to DoS from malicious or buggy client
- Single player could spam server

#### Future Cost
- If exposed publicly, critical DoS vulnerability
- Could affect legitimate players

#### Triggers for Fixing
- 🔴 **BEFORE** public deployment
- 🟡 Before V1.0
- If DoS observed in testing

#### Mitigation
- Trust local network environment
- Monitor for abuse
- Educate users about responsible use

#### Estimated Fix Effort
Medium (3-5 days)

#### Dependencies
- Rate limiting library selection
- Testing strategy for rate limits

**Cross-reference:**
- Threat Model: T3.1, T3.2
- Security Tests: DoS section

---

### 🟡 DEBT-003: No Game Persistence

**Type:** Deliberate and Prudent
**Category:** Architecture
**Severity:** High
**Date Incurred:** 2025-01-15
**Interest Rate:** Low 💸

#### What We Did
In-memory game state only. Server restart = lost game.

```typescript
// Current
const gameState: GameState = {
  // In-memory only
};
```

#### What We Should Have Done
Persistence layer:
```typescript
interface GameRepository {
  save(game: GameState): Promise<void>;
  load(gameId: string): Promise<GameState>;
}
```

#### Why We Didn't
- MVP simplicity goal
- Database adds complexity
- Most games are short (< 2 hours)
- Server restarts rare in home use

#### Current Cost
- Game lost on crash/restart
- No save/resume feature
- No game history

#### Future Cost
- Users may want to save games
- History/statistics features need persistence
- Multi-game support needs database

#### Triggers for Fixing
- When adding save/resume feature
- When adding game history
- V2.0 milestone

#### Mitigation
- Document in user guide
- Make server restarts rare
- Keep games short

#### Estimated Fix Effort
Large (1-2 weeks including migration)

#### Dependencies
- Database selection (SQLite recommended)
- Schema design
- Migration strategy

**Cross-reference:**
- ADR-006: In-Memory State Only

---

### 🟢 DEBT-004: Full Board Broadcasting

**Type:** Deliberate and Prudent
**Category:** Performance
**Severity:** Medium
**Date Incurred:** 2025-01-15
**Interest Rate:** Low 💸

#### What We Did
Send entire 15×15 board on every update.

```typescript
io.emit('boardUpdate', {
  board: gameState.board // ~2KB payload
});
```

#### What We Should Have Done
Delta updates only:
```typescript
io.emit('boardUpdate', {
  changes: placements // ~200 bytes
});
```

#### Why We Didn't
- Simpler client state management
- Acceptable for 4 players on LAN
- Premature optimization

#### Current Cost
- Slightly higher bandwidth (~2KB vs 200 bytes)
- Minimal on local network

#### Future Cost
- Wouldn't scale to many players
- Wasteful on slower connections

#### Triggers for Fixing
- When optimizing for public internet
- When bandwidth becomes measurable issue
- V1.1 performance sprint

#### Mitigation
- Acceptable on LAN
- Monitor bandwidth usage

#### Estimated Fix Effort
Medium (3-4 days)

**Cross-reference:**
- Performance Plan: OPT-2
- Refactoring: REFACTOR-002

---

### 🟢 DEBT-005: No Error Recovery

**Type:** Inadvertent and Prudent
**Category:** Reliability
**Severity:** Medium
**Date Incurred:** 2025-01-15
**Interest Rate:** Medium 💸💸

#### What We Did
Basic error handling. No retry logic, no graceful degradation.

```typescript
// Current
socket.on('error', (err) => {
  console.error(err); // Just log
});
```

#### What We Should Have Done
Comprehensive error recovery:
```typescript
class ErrorRecovery {
  async retry<T>(fn: () => Promise<T>, attempts: number): Promise<T> {
    // Exponential backoff
    // Graceful degradation
  }
}
```

#### Why We Didn't
- Didn't prioritize resilience initially
- Focus on happy path for MVP
- Error scenarios identified later

#### Current Cost
- Errors sometimes confuse users
- Network glitches can break game
- No automatic recovery

#### Future Cost
- Poor user experience on unreliable networks
- Manual intervention needed

#### Triggers for Fixing
- After beta testing feedback
- When adding mobile support
- V1.1

#### Mitigation
- Document known issues
- Provide refresh workaround
- Monitor error rates

#### Estimated Fix Effort
Medium (1 week)

---

### 🟢 DEBT-006: No Reconnection Handling

**Type:** Deliberate and Prudent
**Category:** Reliability
**Severity:** Medium
**Date Incurred:** 2025-01-15
**Interest Rate:** Medium 💸💸

#### What We Did
Player disconnect = removed from game (in lobby) or marked disconnected (in game).

```typescript
socket.on('disconnect', () => {
  // Mark disconnected, no recovery
});
```

#### What We Should Have Done
Graceful reconnection:
```typescript
socket.on('disconnect', () => {
  // Hold slot for 60 seconds
  // Allow reconnect with same name
  // Resume from current state
});
```

#### Why We Didn't
- Complex state management
- MVP focused on stable connections
- Local network usually stable

#### Current Cost
- Brief disconnect = player out of game
- No way to rejoin ongoing game

#### Future Cost
- Poor mobile experience
- Frustrating on unreliable networks

#### Triggers for Fixing
- User complaints about disconnects
- Mobile support
- Public deployment

#### Mitigation
- Encourage stable connections
- Keep games short
- Document limitation

#### Estimated Fix Effort
Medium (1 week)

---

### 🟢 DEBT-007: Client State Duplication

**Type:** Inadvertent and Prudent
**Category:** Architecture
**Severity:** Medium
**Date Incurred:** 2025-01-15
**Interest Rate:** High 💸💸💸

#### What We Did
Client maintains full game state locally, duplicating server state.

```javascript
const clientState = {
  board: [], // Duplicate of server board
  players: [], // Duplicate of server players
  // etc
};
```

#### What We Should Have Done
Single source of truth with views:
- Server: authoritative state
- Client: derived views only

#### Why We Didn't
- Simpler initial implementation
- Reduces round-trips
- Standard pattern for real-time games

#### Current Cost
- State can drift if not careful
- More complex synchronization
- Potential for bugs

#### Future Cost
- Hard to debug state issues
- Refactoring difficult

#### Triggers for Fixing
- If state sync bugs occur
- Major refactoring
- Consider for V2.0

#### Mitigation
- Server is always authoritative
- Clear sync points
- Test synchronization carefully

#### Estimated Fix Effort
Large (2 weeks, risky)

**Note:** This might be acceptable architecture. Re-evaluate after production experience.

---

### ⚪ DEBT-008: No Logging Infrastructure

**Type:** Deliberate and Prudent
**Category:** Operations
**Severity:** Low
**Date Incurred:** 2025-01-15
**Interest Rate:** Low 💸

#### What We Did
Console.log only, no structured logging.

```typescript
console.log('Player joined:', playerName);
```

#### What We Should Have Done
Proper logging:
```typescript
logger.info('player_joined', { playerId, playerName, timestamp });
```

#### Why We Didn't
- Console.log sufficient for local use
- MVP doesn't need sophisticated logging
- No ops requirements yet

#### Current Cost
- Hard to debug issues retroactively
- No metrics or analytics
- Can't track patterns

#### Future Cost
- Production issues hard to diagnose
- No visibility into usage patterns

#### Triggers for Fixing
- Production deployment
- When debugging gets painful
- Analytics needs

#### Mitigation
- Document issues when they occur
- Use console for now

#### Estimated Fix Effort
Small (2-3 days)

---

### ⚪ DEBT-009: No Tests Written Yet

**Type:** Deliberate and Prudent
**Category:** Testing
**Severity:** Low (for MVP) → High (for production)
**Date Incurred:** 2025-01-15
**Interest Rate:** High 💸💸💸

#### What We Did
Wrote test specifications but no actual test implementation.

```
/3-validation/
  unit-tests/TEST-SPECS.md ✅
  integration-tests/TEST-SCENARIOS.md ✅
  (no actual test code yet) ❌
```

#### What We Should Have Done
TDD or at least test after implementation:
```typescript
describe('GameEngine', () => {
  it('should validate word correctly', () => {
    // Actual executable test
  });
});
```

#### Why We Didn't
- Focus on getting working implementation first
- Test specs documented (unusual for debt, but we have specs!)
- Plan to implement tests post-MVP

#### Current Cost
- No automated regression detection
- Manual testing only
- Refactoring is risky

#### Future Cost
- Bugs escape to users
- Fear of changing code
- Slows development

#### Triggers for Fixing
- 🔴 **BEFORE** any public release
- 🟡 Next sprint (high priority)
- Before any major refactoring

#### Mitigation
- Manual testing thoroughly
- Test specs ready to implement
- Small, careful changes

#### Estimated Fix Effort
Large (2 weeks to implement all specs)

**Notes:**
- We have SPECS which is better than most tech debt
- This is unusual: we documented what to test before building
- Implementation is straightforward from specs

**Priority:** Should be HIGH, marking LOW temporarily for MVP demonstration.

---

## Paid Debt

### ✅ DEBT-000: Array-based Dictionary Lookup

**Status:** Paid (2025-01-15)
**Original Severity:** Critical (Performance)

#### What It Was
Dictionary using array with O(n) linear search.

#### How We Fixed It
Changed to Set with O(1) hash lookup.

#### Result
1000x+ performance improvement, no longer debt.

**See:** ADR-004 for full details

---

## Debt Metrics

### By Category
- Security: 2 items (HIGH priority)
- Performance: 1 item (MEDIUM priority)
- Architecture: 2 items (MEDIUM priority)
- Reliability: 2 items (MEDIUM priority)
- Operations: 1 item (LOW priority)
- Testing: 1 item (varies)

### By Type
- Deliberate & Prudent: 8 items ✅ (good debt)
- Inadvertent & Prudent: 1 item (learned)
- Deliberate & Reckless: 0 items ✅
- Inadvertent & Reckless: 0 items ✅

### Interest Accumulation
- High Interest: 3 items 💸💸💸
- Medium Interest: 4 items 💸💸
- Low Interest: 2 items 💸

---

## Debt Roadmap

### Sprint 1 (Post-MVP)
- 🟡 DEBT-001: Input sanitization
- 🟡 DEBT-009: Implement test suite

### Sprint 2
- 🟡 DEBT-002: Rate limiting
- 🟢 DEBT-005: Error recovery

### V1.1
- 🟢 DEBT-004: Delta updates
- 🟢 DEBT-006: Reconnection handling

### V2.0
- 🟡 DEBT-003: Game persistence
- 🟢 DEBT-007: State architecture (evaluate)

### Ongoing
- ⚪ DEBT-008: Logging (when needed)

---

## Debt Review Process

### Weekly
- Review new debt items
- Update severity/priority
- Track trends

### Monthly
- Debt paydown sprint
- Review roadmap
- Adjust priorities

### Quarterly
- Comprehensive debt audit
- Architecture review
- Strategic planning

---

## Debt Acceptance Criteria

Before accepting new debt:
- [ ] Is it deliberate? (not just bad code)
- [ ] Is it documented? (this registry)
- [ ] Is there a plan to fix it? (triggers defined)
- [ ] Are risks understood? (costs documented)
- [ ] Is it better than alternatives? (justified)

---

## Notes for Future Maintainers

### On This Debt
Most of this debt is **Deliberate and Prudent**—conscious decisions to ship MVP faster. This is good debt when:
- Documented (you're reading that now)
- Time-boxed (triggers defined)
- Manageable (mitigations in place)

### What to Watch
- DEBT-001 & DEBT-002: Security debt is HIGH INTEREST
- DEBT-009: Testing debt compounds fast
- DEBT-007: State architecture might be OK as-is

### Philosophy
Debt isn't failure. It's a tool. Use it consciously, document it honestly, pay it strategically.

**"Shipping with known debt is better than not shipping. Just write it down."**

---

## Related Documentation

- [Decision Logs](../decision-logs/DECISIONS.md) - Why we chose these approaches
- [Refactoring Notes](../refactoring-notes/IMPROVEMENTS.md) - How to improve code
- [Threat Model](/4-security/security-tests/THREAT-MODEL.md) - Security implications
- [Performance Plan](/5-performance/optimizations/OPTIMIZATION-PLAN.md) - Performance debt
