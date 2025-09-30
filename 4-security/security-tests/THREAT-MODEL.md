# Threat Model - Scrabble Game

## Assets

### Primary Assets
1. **Game State** - Board, tiles, scores, turn order
2. **Player Data** - Names, connections, tile racks
3. **Server Availability** - Ability to host and play games

### Secondary Assets
1. **Dictionary Data** - Word list integrity
2. **Server Resources** - CPU, memory, network bandwidth

---

## Threat Actors

### External Attackers
- **Cheaters** - Players trying to gain unfair advantage
- **Griefers** - Players trying to disrupt game for others
- **Script Kiddies** - Automated attack tools

### Insider Threats
- **Malicious Players** - Legitimate players with hostile intent

### Threat Level
- **LOW** - Local network only, no authentication, no sensitive data
- **MEDIUM** - If exposed to public internet
- **Context**: This is a local, private game with no financial or personal sensitive data

---

## Threats & Mitigations

### 1. Input Validation Attacks

#### T1.1: XSS in Player Names
**Threat**: Attacker injects JavaScript in player name
```javascript
playerName: '<script>alert("XSS")</script>'
```

**Impact**:
- Script execution in other players' browsers
- Potential session hijacking
- UI disruption

**Severity**: HIGH (if successful)

**Mitigation**:
- Validate player name: alphanumeric + spaces only
- Sanitize all displayed text
- Use textContent instead of innerHTML
- CSP headers

**Status**: ⚠️ NEEDS IMPLEMENTATION

---

#### T1.2: Injection in Dictionary Check Endpoint
**Threat**: Path traversal or command injection via word parameter
```
GET /api/dictionary/check/../../../etc/passwd
```

**Impact**:
- File system access
- Information disclosure

**Severity**: MEDIUM

**Mitigation**:
- Validate word parameter (A-Z only)
- No file system operations on user input
- Whitelist validation

**Status**: ⚠️ NEEDS VALIDATION

---

#### T1.3: Malicious Tile Letters
**Threat**: Player sends invalid tile letters
```javascript
{ letter: '<IMG SRC=x onerror=alert(1)>', points: 1 }
```

**Impact**:
- XSS on board display
- Game state corruption

**Severity**: HIGH

**Mitigation**:
- Validate tile letters server-side (A-Z or _ only)
- Reject invalid tiles before processing
- Sanitize display

**Status**: ⚠️ NEEDS IMPLEMENTATION

---

### 2. Game Logic Exploitation

#### T2.1: Cheating - Submit Tiles Not in Rack
**Threat**: Player claims to have tiles they don't own
```javascript
submitWord({
  placements: [
    { row: 7, col: 7, tile: { letter: 'Q', points: 10 } }
  ]
})
// But player doesn't have Q in rack
```

**Impact**:
- Unfair advantage
- Game integrity compromised

**Severity**: MEDIUM

**Mitigation**:
- Server validates player has tiles in rack
- Never trust client tile data

**Status**: ✅ IMPLEMENTED (needs testing)

---

#### T2.2: Cheating - Place Tiles on Occupied Squares
**Threat**: Player overwrites existing tiles

**Impact**:
- Board corruption
- Score manipulation

**Severity**: MEDIUM

**Mitigation**:
- Server validates squares are empty
- Board state is authoritative

**Status**: ✅ IMPLEMENTED (needs testing)

---

#### T2.3: Cheating - Modify Score Client-Side
**Threat**: Player modifies local score display

**Impact**:
- Visual deception (doesn't affect server)
- Confusion

**Severity**: LOW

**Mitigation**:
- Server is authoritative for scores
- Client display is read-only

**Status**: ✅ IMPLEMENTED

---

#### T2.4: Out-of-Turn Actions
**Threat**: Player submits word when not their turn

**Impact**:
- Game flow disruption
- Potential race conditions

**Severity**: MEDIUM

**Mitigation**:
- Server validates current player ID
- Reject actions from non-current players

**Status**: ✅ IMPLEMENTED (needs testing)

---

#### T2.5: Dictionary Bypass
**Threat**: Player modifies client to accept invalid words locally

**Impact**:
- None (server validates)

**Severity**: LOW

**Mitigation**:
- Server-side dictionary validation
- Client validation is UX only

**Status**: ✅ IMPLEMENTED

---

### 3. Denial of Service

#### T3.1: Spam Connection Attempts
**Threat**: Attacker opens many WebSocket connections

**Impact**:
- Server resource exhaustion
- Legitimate players can't connect

**Severity**: MEDIUM

**Mitigation**:
- Connection rate limiting
- Max connections per IP
- Connection timeout

**Status**: ⚠️ NEEDS IMPLEMENTATION

---

#### T3.2: Message Flooding
**Threat**: Player sends rapid messages (submitWord spam)

**Impact**:
- CPU exhaustion
- Game disruption

**Severity**: MEDIUM

**Mitigation**:
- Rate limiting on game actions
- Action throttling
- Disconnect abusive clients

**Status**: ⚠️ NEEDS IMPLEMENTATION

---

#### T3.3: Large Payload Attacks
**Threat**: Attacker sends huge JSON payloads

**Impact**:
- Memory exhaustion
- Server crash

**Severity**: MEDIUM

**Mitigation**:
- Payload size limits
- JSON parsing limits
- Input validation

**Status**: ⚠️ NEEDS IMPLEMENTATION

---

#### T3.4: Infinite Game Loops
**Threat**: Players collude to keep game running forever

**Impact**:
- Server resources held indefinitely

**Severity**: LOW

**Mitigation**:
- Game timeout (e.g., 2 hours)
- Automatic cleanup of stale games
- Max turn time limit

**Status**: ⚠️ FUTURE ENHANCEMENT

---

### 4. Data Exposure

#### T4.1: Opponent Tile Visibility
**Threat**: Player intercepts WebSocket to see opponent's tiles

**Impact**:
- Unfair advantage (cheating)

**Severity**: MEDIUM

**Mitigation**:
- Send tiles only to owning player
- Use player-specific Socket.io rooms
- Never broadcast all tiles

**Status**: ✅ IMPLEMENTED (needs testing)

---

#### T4.2: Game State Leakage
**Threat**: Exposed internal state in error messages

**Impact**:
- Information disclosure
- Potential for further exploits

**Severity**: LOW

**Mitigation**:
- Generic error messages to clients
- Detailed logs server-side only
- No stack traces to client

**Status**: ⚠️ NEEDS VALIDATION

---

### 5. Session/Authentication

#### T5.1: Session Hijacking
**Threat**: Attacker steals Socket.io session ID

**Impact**:
- Impersonation
- Game disruption

**Severity**: LOW (local network)

**Mitigation**:
- Use secure WebSocket (wss://) if public
- HttpOnly cookies (if using sessions)
- For local: acceptable risk

**Status**: ✅ ACCEPTABLE for local network

---

#### T5.2: Name Spoofing on Reconnect
**Threat**: Player reconnects with different name but same socket ID

**Impact**:
- Confusion
- Potential for griefing

**Severity**: LOW

**Mitigation**:
- Bind player identity to socket ID
- Reject name changes after join

**Status**: ✅ IMPLEMENTED

---

### 6. Dependency Vulnerabilities

#### T6.1: Vulnerable npm Packages
**Threat**: Dependencies with known CVEs

**Impact**:
- Various (depends on vulnerability)

**Severity**: VARIES

**Mitigation**:
- Run `npm audit` regularly
- Update dependencies
- Review security advisories

**Status**: ⚠️ NEEDS PROCESS

---

## Risk Assessment Matrix

| Threat ID | Severity | Likelihood | Risk Level | Status |
|-----------|----------|------------|------------|--------|
| T1.1 | HIGH | MEDIUM | **HIGH** | ⚠️ TODO |
| T1.2 | MEDIUM | LOW | MEDIUM | ⚠️ TODO |
| T1.3 | HIGH | MEDIUM | **HIGH** | ⚠️ TODO |
| T2.1 | MEDIUM | HIGH | **HIGH** | ✅ IMPL |
| T2.2 | MEDIUM | MEDIUM | MEDIUM | ✅ IMPL |
| T2.3 | LOW | HIGH | LOW | ✅ IMPL |
| T2.4 | MEDIUM | MEDIUM | MEDIUM | ✅ IMPL |
| T2.5 | LOW | LOW | LOW | ✅ IMPL |
| T3.1 | MEDIUM | MEDIUM | MEDIUM | ⚠️ TODO |
| T3.2 | MEDIUM | HIGH | **HIGH** | ⚠️ TODO |
| T3.3 | MEDIUM | LOW | MEDIUM | ⚠️ TODO |
| T3.4 | LOW | LOW | LOW | FUTURE |
| T4.1 | MEDIUM | MEDIUM | MEDIUM | ✅ IMPL |
| T4.2 | LOW | LOW | LOW | ⚠️ TODO |
| T5.1 | LOW | LOW | LOW | ✅ OK |
| T5.2 | LOW | LOW | LOW | ✅ IMPL |
| T6.1 | VARIES | MEDIUM | MEDIUM | ⚠️ TODO |

---

## Priority Actions

### 🔴 CRITICAL (Block Release)
None currently identified

### 🟡 HIGH (Must Fix Before Public Release)
1. **T1.1** - XSS in player names
2. **T1.3** - Malicious tile letters
3. **T3.2** - Message flooding DoS

### 🟢 MEDIUM (Should Fix)
1. **T3.1** - Connection spam
2. **T3.3** - Large payloads
3. **T1.2** - Dictionary injection
4. **T4.2** - Error message info leakage

### ⚪ LOW (Nice to Have)
1. **T3.4** - Game timeouts
2. Process for dependency audits

---

## Security Testing Requirements

### Must Test
- All HIGH risk threats
- Input validation on all endpoints
- Authorization checks (player ownership)
- DoS resilience (basic)

### Should Test
- All MEDIUM risk threats
- Dependency scanning
- Error message sanitization

### Could Test
- Advanced DoS scenarios
- Cryptographic implementations (if added)
- Physical security (out of scope)

---

## Assumptions & Constraints

### Security Assumptions
1. **Local Network**: Game runs on trusted local network
2. **No Sensitive Data**: No passwords, payment info, or PII
3. **Casual Context**: Not a competitive/money game
4. **Physical Security**: Host controls who connects

### Constraints
1. **No Authentication**: Intentionally simple (name only)
2. **No Encryption**: HTTP/WS acceptable for local network
3. **No Audit Logs**: Not required for this use case

### Risk Acceptance
- Local network attacks: **ACCEPTED**
- Cheating without financial impact: **ACCEPTED** (but mitigated)
- DoS on local network: **PARTIALLY ACCEPTED** (basic protections only)

---

## Security Review Checklist

Before release:
- [ ] All HIGH severity threats mitigated or accepted
- [ ] Input validation on all user inputs
- [ ] Authorization checks on all game actions
- [ ] No sensitive data in error messages
- [ ] XSS protections in place
- [ ] Basic rate limiting implemented
- [ ] npm audit run and reviewed
- [ ] Penetration testing completed
- [ ] Security tests passing
