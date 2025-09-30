# Refactoring & Improvement Opportunities

## Status Legend
- 🔴 P0 - Critical
- 🟡 P1 - High
- 🟢 P2 - Medium
- ⚪ P3 - Low
- ✅ Done
- ⏸️ Deferred

---

## Active Refactoring Opportunities

### 🟢 REFACTOR-001: Extract Board Premium Square Logic

**Location:** `src/game-engine/board.ts:getPremiumSquareType()`
**Priority:** P2 (Medium)
**Category:** Code Quality
**Date Noted:** 2025-01-15

#### Current State
Premium square positions defined as inline array literals within function.

```typescript
const tripleWord = [
  [0, 0], [0, 7], [0, 14],
  [7, 0], [7, 14],
  [14, 0], [14, 7], [14, 14],
];
```

#### Problem
- Logic is correct but could be more maintainable
- Premium positions could be shared across functions
- Hard to visualize board layout from code

#### Proposed Improvement
Extract to constants at module level:

```typescript
// board-config.ts
export const PREMIUM_SQUARES = {
  TRIPLE_WORD: new Set(['0,0', '0,7', '0,14', ...]),
  DOUBLE_WORD: new Set(['1,1', '2,2', ...]),
  // etc.
};

// board.ts
export function getPremiumSquareType(row: number, col: number) {
  const key = `${row},${col}`;
  if (PREMIUM_SQUARES.TRIPLE_WORD.has(key)) return 'TRIPLE_WORD';
  // ...
}
```

#### Benefit
- Easier to understand board layout
- Reusable configuration
- Slightly faster lookups (Set vs array search)

#### Effort Estimate
Small (1-2 hours)

#### When to Address
Opportunistic (when touching board.ts)

---

### 🟢 REFACTOR-002: Client Rendering Optimization

**Location:** `public/assets/app.js:renderBoard()`
**Priority:** P2 (Medium)
**Category:** Performance
**Date Noted:** 2025-01-15

#### Current State
Full board re-render on every update (225 cells rebuilt).

```javascript
function renderBoard() {
  // Rebuilds entire table
  let html = '<table>';
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      html += renderCell(row, col);
    }
  }
  boardContainer.innerHTML = html;
}
```

#### Problem
- Inefficient: re-renders unchanged cells
- Causes flicker
- Higher CPU usage

#### Proposed Improvement
Delta updates (already noted in performance plan):

```javascript
function updateBoard(changes) {
  changes.forEach(({row, col, tile}) => {
    const cell = getCellElement(row, col);
    updateCellContent(cell, tile);
  });
}
```

#### Benefit
- 90%+ faster updates
- Smoother UX
- Lower battery usage

#### Effort Estimate
Medium (4-6 hours)

#### Dependencies
- OPT-002: WebSocket payload changes
- Need to pass deltas instead of full board

#### When to Address
V1.1 (post-MVP)

**Cross-reference:** See `/5-performance/optimizations/OPTIMIZATION-PLAN.md` OPT-1

---

### ⚪ REFACTOR-003: Error Message Standardization

**Location:** Various (server.ts, game-engine.ts)
**Priority:** P3 (Low)
**Category:** Code Quality
**Date Noted:** 2025-01-15

#### Current State
Error messages use different formats:

```typescript
// Some places:
return { success: false, error: 'Not your turn' };

// Other places:
socket.emit('error', { message: 'Not your turn' });

// Inconsistent
```

#### Problem
- Inconsistent error handling
- Client must handle multiple formats
- Harder to test

#### Proposed Improvement
Standardized error class:

```typescript
class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
  }
}

// Usage:
throw new GameError('Not your turn', 'NOT_YOUR_TURN');
```

#### Benefit
- Consistent error handling
- Machine-readable error codes
- Easier to test and handle

#### Effort Estimate
Medium (requires updating all error paths)

#### When to Address
Opportunistic or when adding error monitoring

---

### 🟡 REFACTOR-004: Input Validation Duplication

**Location:** Multiple files (server.ts, validation.ts, client app.js)
**Priority:** P1 (High - Security related)
**Category:** Code Quality + Security
**Date Noted:** 2025-01-15

#### Current State
Validation logic duplicated across server and client:

```typescript
// Client
if (name.length < 3 || name.length > 20) { ... }

// Server
if (playerName.length < 3 || playerName.length > 20) { ... }
```

#### Problem
- DRY violation
- Easy to update one place and forget other
- Security concern if validations drift

#### Proposed Improvement
Option 1: Shared validation library
```typescript
// shared/validation.ts
export const PLAYER_NAME_MIN = 3;
export const PLAYER_NAME_MAX = 20;

export function validatePlayerName(name: string) {
  // Single source of truth
}
```

Option 2: Server-only (client uses server errors for feedback)

#### Benefit
- Single source of truth
- Consistent validation
- Easier to maintain

#### Effort Estimate
Medium (requires restructuring)

#### Dependencies
- May need to set up shared code between client/server

#### Risks
- Client validation is UX (fast feedback)
- Server validation is security (authoritative)
- Need both, but shouldn't duplicate logic

#### When to Address
Next sprint (high priority due to security implications)

**Cross-reference:** See `/4-security/security-tests/THREAT-MODEL.md` T1.1, T1.3

---

### ⚪ REFACTOR-005: Magic Numbers in Scoring

**Location:** `src/game-engine/scoring.ts`
**Priority:** P3 (Low)
**Category:** Code Quality
**Date Noted:** 2025-01-15

#### Current State
Magic numbers inline:

```typescript
if (placements.length === 7) {
  totalScore += 50; // Bingo bonus
}
```

#### Problem
- Magic number (50)
- Could extract to constant

#### Proposed Improvement
```typescript
const BINGO_BONUS = 50;
const BOARD_SIZE = 15;

if (placements.length === FULL_RACK_SIZE) {
  totalScore += BINGO_BONUS;
}
```

#### Benefit
- Self-documenting
- Easier to adjust for house rules

#### Effort Estimate
Small (30 minutes)

#### When to Address
Opportunistic (low priority)

---

## Completed Refactoring

### ✅ REFACTOR-000: Dictionary Array to Set

**Completed:** 2025-01-15 (during implementation)
**Location:** `src/dictionary.ts`
**Priority:** Was P0 (Critical - Performance)

#### What Was Done
Changed from array with linear search to Set with O(1) lookup.

#### Result
1000x+ performance improvement. See ADR-004 for details.

---

## Deferred Refactoring

### ⏸️ REFACTOR-006: WebSocket Message Batching

**Location:** `src/server.ts`
**Priority:** P2 (Medium)
**Category:** Performance
**Status:** Deferred to V1.1

#### Reason for Deferral
- Acceptable performance for 4 players
- Adds protocol complexity
- Can revisit if needed

**See:** `/5-performance/optimizations/OPTIMIZATION-PLAN.md` OPT-2

---

## Patterns & Observations

### Good Patterns Found

1. **Type Safety with TypeScript**
   - Prevents many bugs
   - Good developer experience
   - Keep using throughout

2. **Server-Authoritative Model**
   - Clean separation
   - Security by design
   - Maintain this pattern

3. **Interface-First Design**
   - Clear contracts
   - Easy to test
   - Continue this approach

### Anti-Patterns to Watch

1. **Client-Server Validation Duplication**
   - See REFACTOR-004
   - Need strategy for shared validation

2. **Full State Broadcasting**
   - Works but inefficient
   - Consider delta updates

3. **In-Memory Only State**
   - Fine for MVP
   - Will need persistence for V2 features

---

## Refactoring Opportunities by Component

### Game Engine
- ✅ Dictionary optimization (done)
- 🟢 Premium square extraction (REFACTOR-001)
- ⚪ Magic numbers (REFACTOR-005)

### Server
- 🟡 Input validation (REFACTOR-004)
- ⚪ Error messages (REFACTOR-003)
- ⏸️ Message batching (deferred)

### Client
- 🟢 Rendering optimization (REFACTOR-002)
- 🟡 Validation duplication (REFACTOR-004)

---

## Guidelines for Future Refactoring

### Before Refactoring
1. Ensure tests exist and pass
2. Commit current working state
3. Scope the refactoring clearly
4. Consider impact on other systems

### During Refactoring
1. Make small, incremental changes
2. Run tests after each change
3. Commit working states frequently
4. Document trade-offs

### After Refactoring
1. Verify all tests pass
2. Update documentation
3. Note in refactoring log
4. Consider performance impact

---

## Boy Scout Rule Suggestions

Small improvements anyone can make:

- ✅ Fix typos in comments
- ✅ Improve variable names
- ✅ Add missing JSDoc comments
- ✅ Extract magic numbers
- ✅ Remove dead code
- ✅ Fix formatting inconsistencies

No permission needed for these—just make it better!

---

## Future Considerations

### When Codebase Grows
- Consider modularization (separate npm packages)
- Add linting rules (ESLint)
- Set up prettier for formatting
- Add pre-commit hooks

### When Team Grows
- Establish code review checklist
- Document coding standards
- Set up CI/CD for automatic checks

### When Complexity Grows
- Consider architecture review
- Revisit layering decisions
- Evaluate framework adoption

---

## Questions for Next Refactoring Session

1. Is the client-server validation duplication acceptable?
2. Should we optimize rendering now or wait for user feedback?
3. Are magic numbers worth extracting given code clarity?
4. Do we need more abstraction layers or is simplicity better?

---

## Related Documentation

- [Decision Logs](../decision-logs/DECISIONS.md) - Why things are the way they are
- [Technical Debt](../technical-debt-registry/DEBT.md) - What we knowingly left incomplete
- [Performance Plan](/5-performance/optimizations/OPTIMIZATION-PLAN.md) - Performance-related refactoring
