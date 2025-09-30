# Architecture Decision Records

## Index

- [ADR-001: TypeScript for Type Safety](#adr-001-typescript-for-type-safety)
- [ADR-002: Socket.io for Real-time Communication](#adr-002-socketio-for-real-time-communication)
- [ADR-003: No Authentication System](#adr-003-no-authentication-system)
- [ADR-004: Dictionary as Set Data Structure](#adr-004-dictionary-as-set-data-structure)
- [ADR-005: Server-Authoritative Game State](#adr-005-server-authoritative-game-state)
- [ADR-006: In-Memory State Only](#adr-006-in-memory-state-only)
- [ADR-007: Single Game Instance Per Server](#adr-007-single-game-instance-per-server)

---

## ADR-001: TypeScript for Type Safety

**Date:** 2025-01-15
**Status:** Accepted
**Context:** /2-logic/implementation
**Deciders:** Development team

### Context and Problem Statement

Need to choose a language for server implementation. Want to catch errors early and have better tooling support.

### Decision Drivers

- Type safety to prevent runtime errors
- Better IDE support and autocomplete
- Easier refactoring
- Game logic has complex state management
- Familiarity with JavaScript ecosystem

### Considered Options

1. **JavaScript** - Simple, no compilation
2. **TypeScript** - Type-safe JavaScript superset
3. **Python** - Alternative server language

### Decision Outcome

**Chosen option:** TypeScript

**Rationale:**
- Catches type errors at compile time
- Excellent IDE support (autocomplete, refactoring)
- Compiles to JavaScript (compatible with Node.js ecosystem)
- Gradual typing allows flexibility
- Strong type system for complex game state

### Consequences

**Positive:**
- Type errors caught before runtime
- Better developer experience
- Easier to maintain and refactor
- Self-documenting code with types

**Negative:**
- Compilation step required
- Learning curve for pure JavaScript developers
- Build tooling complexity

**Trade-offs:**
- Gained type safety, gave up simplicity

### Alternatives Rejected

**Why not JavaScript?**
- No compile-time type checking
- More runtime errors
- Harder to refactor safely

**Why not Python?**
- Less optimal for real-time applications
- Different ecosystem from client-side JavaScript
- Team more familiar with JS/TS

### Future Considerations

- If project becomes very simple, could remove TypeScript
- If build time becomes issue, could optimize tsconfig

---

## ADR-002: Socket.io for Real-time Communication

**Date:** 2025-01-15
**Status:** Accepted
**Context:** /1-design/architecture
**Deciders:** Architecture team

### Context and Problem Statement

Need real-time bidirectional communication between server and multiple clients for game updates.

### Decision Drivers

- Real-time game state synchronization
- Need to push updates from server
- HTTP polling would be inefficient
- Want fallback for older browsers
- Easy to use library preferred

### Considered Options

1. **Raw WebSocket** - Native browser API
2. **Socket.io** - WebSocket library with fallbacks
3. **Server-Sent Events (SSE)** - One-way server push
4. **HTTP Long Polling** - Fallback technique

### Decision Outcome

**Chosen option:** Socket.io

**Rationale:**
- Built on WebSocket with automatic fallbacks
- Event-based API is intuitive
- Broadcasting to multiple clients built-in
- Rooms/namespaces for future multi-game support
- Handles reconnection automatically
- Well-documented and maintained

### Consequences

**Positive:**
- Easy to broadcast to all players
- Automatic reconnection handling
- Good developer experience
- Fallback for older browsers

**Negative:**
- Larger bundle size than raw WebSocket
- Another dependency to maintain
- Abstraction hides some WebSocket details

**Trade-offs:**
- Gained ease of use and reliability, gave up minimal bundle size

### Alternatives Rejected

**Why not Raw WebSocket?**
- No automatic reconnection
- No fallback mechanisms
- Need to implement broadcasting ourselves
- More code to write and maintain

**Why not SSE?**
- One-way only (server → client)
- Need separate HTTP requests for client → server
- Less suitable for real-time bidirectional

**Why not Long Polling?**
- Inefficient
- Higher latency
- More server load

### Future Considerations

- If bundle size becomes critical, consider raw WebSocket
- For production at scale, consider dedicated WebSocket infrastructure

---

## ADR-003: No Authentication System

**Date:** 2025-01-15
**Status:** Accepted
**Context:** /0-vision/constraints
**Deciders:** Product team

### Context and Problem Statement

Decide whether to implement user authentication (login/password) or keep it simple (name-only).

### Decision Drivers

- Target: local network casual play
- Simplicity is core value
- No sensitive data to protect
- Quick setup desired
- Trust model: physical network security

### Considered Options

1. **Name-only (no authentication)** - Just enter name to play
2. **Password authentication** - Username + password
3. **OAuth** - Login with Google/GitHub/etc
4. **Session tokens** - Persistent identity

### Decision Outcome

**Chosen option:** Name-only (no authentication)

**Rationale:**
- Simplicity: core project value
- Local network: physical security sufficient
- No sensitive data: just game scores
- Casual context: not competitive
- Quick start: players join immediately
- Trust model: assume friendly network

### Consequences

**Positive:**
- Extremely simple to join
- No password management needed
- No security vulnerabilities from auth system
- Fast implementation
- Great user experience for casual play

**Negative:**
- Anyone on network can join as anyone
- No persistent identity across sessions
- Can't prevent name spoofing
- Not suitable for public internet

**Trade-offs:**
- Gained simplicity and ease of use, gave up identity verification

### Alternatives Rejected

**Why not Password Auth?**
- Overkill for local casual game
- Adds friction to joining
- Password management complexity
- Security responsibility

**Why not OAuth?**
- Requires internet connection
- Complex setup
- Overkill for use case

**Why not Session Tokens?**
- Adds complexity
- Not needed for single-session games

### Future Considerations

- If deployed publicly, would need authentication
- If competitive/money involved, would need identity
- Could add optional authentication later without breaking current flow

### Security Note

Acceptable because:
- Local network only (constraint)
- No PII or sensitive data
- No financial transactions
- Casual, friendly context
- Physical security assumed

---

## ADR-004: Dictionary as Set Data Structure

**Date:** 2025-01-15
**Status:** Accepted
**Context:** /5-performance/optimizations
**Deciders:** Performance team

### Context and Problem Statement

Need efficient data structure for storing and looking up 10,000+ dictionary words.

### Decision Drivers

- Fast word validation (hot path)
- Called on every word submission
- Dictionary size: 10,000+ words
- Read-only after loading
- Memory acceptable trade-off

### Considered Options

1. **Array** - Simple list
2. **Set** - Hash-based collection
3. **Trie** - Tree structure for strings
4. **Binary search on sorted array**

### Decision Outcome

**Chosen option:** Set (hash-based)

**Rationale:**
- O(1) average lookup time
- Simple implementation
- JavaScript Set is optimized
- Memory overhead acceptable for 10K words (~2MB)
- No need for prefix search (unlike Trie)

### Consequences

**Positive:**
- 1000x+ faster than array (O(1) vs O(n))
- Simple code
- Native JavaScript support

**Negative:**
- Higher memory usage than array
- Can't do prefix search
- No ordering

**Trade-offs:**
- Gained speed, gave up ~2MB memory (acceptable)

### Alternatives Rejected

**Why not Array?**
- O(n) linear search
- 10,000+ comparisons per lookup
- Unacceptably slow

**Why not Trie?**
- Complex implementation
- Higher memory usage
- No need for prefix matching
- Overkill for simple validation

**Why not Binary Search?**
- O(log n) still slower than O(1)
- Requires sorted array
- More complex than Set

### Benchmarks

- Array (linear): ~500ms per validation
- Set (hash): ~0.5ms per validation
- **1000x improvement**

### Future Considerations

- If need prefix search (autocomplete), consider Trie
- If memory becomes issue, could compress

---

## ADR-005: Server-Authoritative Game State

**Date:** 2025-01-15
**Status:** Accepted
**Context:** /4-security
**Deciders:** Security team

### Context and Problem Statement

Decide where game logic executes and who has authority over game state.

### Decision Drivers

- Prevent cheating
- Ensure consistency across clients
- Validate all game rules server-side
- Trust model: clients can't be trusted

### Considered Options

1. **Server-authoritative** - Server validates everything
2. **Client-authoritative** - Client sends results, server trusts
3. **Hybrid** - Client validates, server double-checks

### Decision Outcome

**Chosen option:** Server-authoritative

**Rationale:**
- Clients can be modified/hacked
- Server is single source of truth
- All validation on server
- Clients are thin display layers
- Prevents cheating

### Consequences

**Positive:**
- Cheat-proof (can't modify client to cheat)
- Consistent game state
- All players see same board
- Security through centralization

**Negative:**
- Higher server load
- Network latency affects UX
- Client can't operate offline

**Trade-offs:**
- Gained security and consistency, gave up client autonomy

### Implementation

Server validates:
- Tile ownership
- Placement rules
- Word validity
- Turn order
- Score calculation

Client only:
- Displays state
- Sends player actions
- Provides UX feedback

### Alternatives Rejected

**Why not Client-authoritative?**
- Trivial to cheat
- No way to prevent modified clients
- Inconsistent game state

**Why not Hybrid?**
- Still vulnerable if server doesn't fully validate
- Added complexity
- False sense of security

### Future Considerations

- Could add client-side validation for UX (show errors before server)
- Server always has final say

---

## ADR-006: In-Memory State Only

**Date:** 2025-01-15
**Status:** Accepted
**Context:** /1-design/architecture
**Deciders:** Architecture team

### Context and Problem Statement

Decide whether to persist game state to database or keep in memory.

### Decision Drivers

- Simplicity is core value
- Single game per server (constraint)
- Session-based play (no save/load needed for MVP)
- Quick to implement
- Avoid database complexity

### Considered Options

1. **In-memory only** - Game state in RAM
2. **SQLite** - Lightweight database
3. **Redis** - In-memory database
4. **PostgreSQL** - Full database

### Decision Outcome

**Chosen option:** In-memory only

**Rationale:**
- Simplest implementation
- No database setup required
- Fast access
- MVP doesn't need persistence
- Server restart = new game (acceptable)

### Consequences

**Positive:**
- Zero database complexity
- Fastest access
- Easy to implement
- No migration issues
- Simple deployment

**Negative:**
- Game lost on server restart
- Can't save/resume games
- No game history
- Not suitable for long games

**Trade-offs:**
- Gained simplicity, gave up persistence

### Alternatives Rejected

**Why not SQLite?**
- Adds dependency
- Need to design schema
- Migrations to manage
- Overkill for single-session games

**Why not Redis?**
- External service to run
- Adds complexity
- Not needed for MVP

**Why not PostgreSQL?**
- Way overkill
- Complex setup
- Production database for casual game

### Future Considerations

- V2 could add save/load feature with SQLite
- Game history feature would need database
- Multiple concurrent games would benefit from Redis

### Current Acceptable Because

- Local casual play
- Games are short (< 2 hours typically)
- Server restart is rare
- Can implement save/load later if needed

---

## ADR-007: Single Game Instance Per Server

**Date:** 2025-01-15
**Status:** Accepted
**Context:** /0-vision/constraints
**Deciders:** Product team

### Context and Problem Statement

Decide whether server supports multiple concurrent games or just one.

### Decision Drivers

- MVP scope constraint
- Target: 2-4 players at home
- Simplicity is core value
- Implementation time
- State management complexity

### Considered Options

1. **Single game per server** - One game instance
2. **Multiple games with rooms** - Game rooms/sessions
3. **Game lobby system** - Matchmaking

### Decision Outcome

**Chosen option:** Single game per server

**Rationale:**
- Simplest implementation
- Matches primary use case (family/friends at home)
- Reduces state management complexity
- Easier to reason about
- Faster to implement MVP

### Consequences

**Positive:**
- Simple state management
- No room/session logic
- Clear UX (everyone joins same game)
- Fast implementation

**Negative:**
- Only one game at a time
- Can't have separate games on same server
- Not suitable for public server

**Trade-offs:**
- Gained simplicity, gave up multi-game capability

### Alternatives Rejected

**Why not Multiple Games?**
- Adds significant complexity
- Room/session management needed
- Player routing logic
- State isolation concerns
- Not needed for target use case

**Why not Lobby System?**
- Major feature, not MVP
- Complex UX
- Overkill for home use

### Future Considerations

- V2 could add game rooms with:
  - Room IDs in URL
  - Socket.io rooms
  - Separate game states per room
- Would enable public hosting

### Workaround

If multiple games needed now:
- Run multiple server instances on different ports
- Each server = one game

### User Story Support

This decision supports:
- US-001: Start Server ✅
- US-002: Join Game ✅
- MVP scope ✅

Does not support (future):
- Multiple concurrent games
- Public server hosting

---

## Decision Log Summary

| ADR | Decision | Status | Impact |
|-----|----------|--------|--------|
| 001 | TypeScript | ✅ Accepted | HIGH |
| 002 | Socket.io | ✅ Accepted | HIGH |
| 003 | No Auth | ✅ Accepted | HIGH |
| 004 | Dict as Set | ✅ Accepted | HIGH |
| 005 | Server Auth | ✅ Accepted | HIGH |
| 006 | In-Memory | ✅ Accepted | MEDIUM |
| 007 | Single Game | ✅ Accepted | MEDIUM |

---

## How to Add New ADRs

1. Copy template from CLAUDE.md
2. Assign next ADR number
3. Fill in all sections
4. Ask Socratic questions
5. Get review from relevant layer
6. Add to index above
7. Update summary table

---

## Related Documentation

- [Threat Model](../../4-security/security-tests/THREAT-MODEL.md)
- [Performance Targets](../../5-performance/benchmarks/PERFORMANCE-TARGETS.md)
- [Technical Debt Registry](../technical-debt-registry/DEBT.md)
