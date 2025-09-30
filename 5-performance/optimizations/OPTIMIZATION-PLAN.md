# Optimization Plan

## Current Status

### Already Optimized ✅

1. **Dictionary Lookup - Set Data Structure**
   - **Before:** Array with linear search O(n)
   - **After:** Set with hash lookup O(1)
   - **Impact:** 1000x+ faster
   - **Location:** `src/dictionary.ts`
   - **Status:** ✅ Implemented

2. **Premium Square Type - Pre-computed**
   - **Before:** Calculate premium type each time
   - **After:** Static position lookup
   - **Impact:** Constant time instead of computation
   - **Location:** `src/game-engine/board.ts`
   - **Status:** ✅ Implemented

3. **Tile Bag Shuffling - Fisher-Yates**
   - **Before:** N/A (new implementation)
   - **After:** Efficient in-place shuffle O(n)
   - **Impact:** Fast initialization
   - **Location:** `src/game-engine/tile-bag.ts`
   - **Status:** ✅ Implemented

---

## Proposed Optimizations

### Priority 1: High Impact, Low Complexity

#### OPT-1: Client Board Rendering - Delta Updates

**Problem:** Full board re-render on every change (225 cells)

**Current Approach:**
```javascript
function renderBoard() {
  // Renders entire 15x15 grid every time
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      renderCell(row, col);
    }
  }
}
```

**Proposed:**
```javascript
function updateBoard(changes) {
  // Only update changed cells
  changes.forEach(({row, col, tile}) => {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.innerHTML = renderTile(tile);
  });
}
```

**Benefits:**
- 90%+ faster board updates
- Smoother user experience
- Lower CPU usage

**Trade-offs:**
- More complex update logic
- Need to track changes
- Cache invalidation considerations

**Effort:** MEDIUM
**Impact:** HIGH
**Status:** 🟡 Recommended

---

#### OPT-2: WebSocket Payload Size Reduction

**Problem:** Broadcasting full board state (multiple KB)

**Current:**
```javascript
io.emit('boardUpdate', {
  board: gameState.board // Full 15x15 grid
});
```

**Proposed:**
```javascript
io.emit('boardUpdate', {
  changes: placements.map(p => ({
    row: p.row,
    col: p.col,
    tile: p.tile
  }))
});
```

**Benefits:**
- 95%+ smaller payloads
- Faster network transmission
- Lower bandwidth usage

**Trade-offs:**
- Clients must maintain state
- More complex client logic
- Need full board sync on join

**Effort:** MEDIUM
**Impact:** MEDIUM
**Status:** 🟡 Recommended

---

### Priority 2: Medium Impact, Medium Complexity

#### OPT-3: Score Calculation Caching

**Problem:** Recalculating scores for common patterns

**Proposed:**
```typescript
class ScoringCache {
  private cache = new Map<string, number>();

  getCachedScore(key: string): number | null {
    return this.cache.get(key) ?? null;
  }

  cacheScore(key: string, score: number) {
    if (this.cache.size > 1000) {
      // LRU eviction
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, score);
  }
}
```

**Benefits:**
- Faster repeated calculations
- Lower CPU usage

**Trade-offs:**
- Memory usage
- Cache key generation overhead
- Complexity

**Effort:** MEDIUM
**Impact:** LOW-MEDIUM
**Status:** ⚪ Optional

---

#### OPT-4: Client-Side Request Debouncing

**Problem:** Multiple rapid UI updates triggering renders

**Proposed:**
```javascript
let renderTimeout;
function scheduleRender() {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    renderBoard();
  }, 16); // One frame
}
```

**Benefits:**
- Smoother rendering
- Lower CPU usage
- Better frame rate

**Trade-offs:**
- Slight delay in updates
- More complex render logic

**Effort:** LOW
**Impact:** MEDIUM
**Status:** 🟡 Recommended

---

### Priority 3: Low Impact or High Complexity

#### OPT-5: Connection Pooling

**Problem:** Creating new connections repeatedly

**Assessment:** Not applicable - long-lived WebSocket connections

**Status:** ❌ Not Applicable

---

#### OPT-6: Worker Threads for Dictionary

**Problem:** Dictionary loading blocks main thread

**Proposed:**
```typescript
// Load dictionary in worker thread
const worker = new Worker('dictionary-loader.js');
worker.postMessage('load');
worker.onmessage = (e) => {
  dictionary = new Set(e.data);
};
```

**Benefits:**
- Non-blocking initialization
- Better startup performance

**Trade-offs:**
- Complexity
- Worker thread overhead
- Dictionary already loads quickly

**Effort:** HIGH
**Impact:** LOW
**Status:** ⚪ Low Priority

---

#### OPT-7: Memory Pooling for Tiles

**Problem:** Creating many tile objects

**Assessment:**
- Only 100 tiles total
- Objects are lightweight
- GC handles this well

**Status:** ❌ Not Worth It

---

#### OPT-8: Compressed State Representation

**Problem:** Board state uses significant memory

**Current:** ~2KB per board (15×15×8 bytes)

**Proposed:** Bit-packed representation

**Assessment:**
- Memory usage already acceptable
- Adds significant complexity
- Harder to debug

**Status:** ❌ Premature Optimization

---

## Implementation Priority

### Immediate (Before MVP)
1. ✅ Dictionary as Set
2. ✅ Premium square pre-computation
3. ✅ Efficient tile shuffling

### Short Term (MVP+)
1. 🟡 OPT-1: Delta board updates (client)
2. 🟡 OPT-4: Render debouncing (client)

### Medium Term (V1.1)
1. 🟡 OPT-2: Payload size reduction
2. ⚪ OPT-3: Score caching (if benchmarks show need)

### Long Term / Optional
1. ⚪ OPT-6: Worker threads (if needed)
2. ⚪ Future optimizations as identified

---

## Optimization Guidelines

### When to Optimize

✅ **DO optimize when:**
- Benchmark shows actual problem
- User experience impacted
- Resource usage excessive
- Clear, measurable improvement

❌ **DON'T optimize when:**
- No measurement yet
- Micro-optimization
- Already fast enough
- Adds significant complexity

### Measurement Requirements

Before optimizing:
- Establish baseline benchmark
- Identify specific bottleneck
- Measure hot path frequency

After optimizing:
- Re-run benchmark
- Verify improvement
- Check for regressions elsewhere
- Update performance tests

---

## Optimization Risks

### High Risk ⚠️
- Changing core algorithms
- Modifying state management
- Altering synchronization

### Medium Risk 🟡
- Caching strategies
- Client-side optimizations
- Network protocol changes

### Low Risk ✅
- UI rendering improvements
- Debouncing/throttling
- Memory management tweaks

---

## Performance Monitoring

### Metrics to Track

1. **Server Response Time**
   - Word validation: < 10ms
   - Score calculation: < 5ms
   - Turn processing: < 50ms

2. **Client Rendering**
   - Board render: < 50ms
   - Frame rate: 60fps
   - Input lag: < 100ms

3. **Network**
   - WebSocket RTT: < 50ms
   - Payload size: < 10KB
   - Events/sec: < 100

4. **Resources**
   - Server memory: < 100MB
   - Client memory: < 50MB
   - CPU usage: < 30%

### Alerting

Trigger optimization review if:
- Any metric exceeds target by 50%
- User reports lag or slowness
- Resource usage trending upward
- Regression detected in benchmarks

---

## Optimization Decisions Log

### OPT-001: Dictionary Data Structure
- **Date:** Implementation phase
- **Decision:** Use Set instead of Array
- **Rationale:** O(1) lookup vs O(n), huge word list
- **Result:** Implemented ✅

### OPT-002: Premium Square Calculation
- **Date:** Implementation phase
- **Decision:** Pre-define positions
- **Rationale:** Constant small set, no computation needed
- **Result:** Implemented ✅

### OPT-003: Full Board Broadcasting
- **Date:** TBD
- **Decision:** Defer to V1.1
- **Rationale:** Acceptable for 4 players, adds complexity
- **Result:** Deferred 🟡

---

## Testing Optimizations

### Performance Test Suite

```typescript
describe('Performance Regressions', () => {
  it('dictionary lookup should remain < 1ms', () => {
    // Benchmark test
  });

  it('board render should remain < 50ms', () => {
    // Benchmark test
  });

  it('turn flow should remain < 200ms', () => {
    // Integration benchmark
  });
});
```

### Benchmark Before/After

```bash
# Before optimization
npm run benchmark -- --name="board-render"
> 150ms average

# Apply optimization

# After optimization
npm run benchmark -- --name="board-render"
> 45ms average (70% improvement)
```

---

## Future Optimization Opportunities

### Identified but Not Planned

1. **Server-Side Caching**
   - Cache game states for quick restore
   - Useful if adding game history

2. **Client-Side Service Worker**
   - Cache static assets
   - Offline capability

3. **Progressive Board Loading**
   - Load visible portion first
   - Useful only for very large boards

4. **WebAssembly for Dictionary**
   - Faster string operations
   - Overkill for current scale

### Monitoring for Need

- User feedback
- Analytics (if added)
- Performance benchmarks
- Resource monitoring

---

## Optimization Success Criteria

### MVP Release
- All operations meet target latencies
- No noticeable lag with 4 players
- Resource usage within limits
- Benchmarks documented

### Production Release
- Optimizations #1-4 evaluated
- Performance tests automated
- Monitoring in place
- Optimization plan updated

---

## Conclusion

**Current Status:** Well-optimized for MVP

**Key Optimizations:** Dictionary (Set), premium squares (pre-computed)

**Next Steps:**
1. Run benchmarks to establish baselines
2. Monitor real-world performance with 4 players
3. Implement client optimizations if needed (OPT-1, OPT-4)
4. Continuously measure and improve

**Philosophy:** Optimize based on data, not speculation. Maintain correctness above all.
