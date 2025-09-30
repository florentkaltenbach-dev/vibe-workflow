# Performance Targets & Benchmarks

## Performance Philosophy

For a **local network multiplayer game**, performance should feel:
- **Instant** - Actions feel immediate
- **Smooth** - No lag or stuttering
- **Responsive** - UI updates quickly
- **Lightweight** - Doesn't consume excessive resources

---

## Performance Targets

### Server Response Times

| Operation | Target | Max Acceptable | Priority |
|-----------|--------|----------------|----------|
| Word validation | < 10ms | 50ms | HIGH |
| Score calculation | < 5ms | 20ms | HIGH |
| Placement validation | < 5ms | 20ms | HIGH |
| Tile drawing | < 1ms | 5ms | MEDIUM |
| Game state update | < 10ms | 50ms | HIGH |
| Join game | < 50ms | 200ms | MEDIUM |
| Start game | < 100ms | 500ms | LOW |

### Client Response Times

| Operation | Target | Max Acceptable | Priority |
|-----------|--------|----------------|----------|
| Render board | < 50ms | 200ms | HIGH |
| Render tile rack | < 20ms | 100ms | HIGH |
| Handle tile drag | < 16ms (60fps) | 33ms (30fps) | MEDIUM |
| Update scoreboard | < 50ms | 200ms | LOW |
| Show notification | < 50ms | 100ms | MEDIUM |

### Network Latency

| Metric | Target | Max Acceptable | Priority |
|--------|--------|----------------|----------|
| WebSocket round-trip | < 50ms | 200ms | HIGH |
| Event propagation | < 100ms | 500ms | HIGH |
| Board sync delay | < 200ms | 1000ms | MEDIUM |

### Resource Usage

| Resource | Target | Max Acceptable | Priority |
|----------|--------|----------------|----------|
| Server memory | < 100MB | 500MB | MEDIUM |
| Client memory | < 50MB | 200MB | MEDIUM |
| Server CPU (idle) | < 5% | 20% | LOW |
| Server CPU (active) | < 30% | 80% | MEDIUM |

### Scalability

| Metric | Target | Max Acceptable | Priority |
|--------|--------|----------------|----------|
| Concurrent games | 1 | 1 | LOW |
| Players per game | 4 | 4 | HIGH |
| Max tile bag operations/sec | 1000 | 100 | LOW |
| Max board operations/sec | 100 | 10 | MEDIUM |

---

## Benchmark Specifications

### Benchmark 1: Dictionary Lookup

**What:** Measure dictionary word validation speed

**Setup:**
```typescript
const dictionary = new Dictionary();
dictionary.load('dictionary.txt');
const testWords = ['HELLO', 'WORLD', 'SCRABBLE', 'XYZQWERTY'];
```

**Test:**
```typescript
const start = performance.now();
testWords.forEach(word => dictionary.has(word));
const duration = performance.now() - start;
```

**Target:** < 1ms for 4 words (< 0.25ms per word)

**Baseline:** TBD (needs measurement)

---

### Benchmark 2: Word Validation (Full Flow)

**What:** Complete word validation including dictionary check

**Test:**
```typescript
const placements = [/* CAT word */];
const start = performance.now();
const words = extractWords(placements, board);
const result = validateWords(words, dictionary);
const duration = performance.now() - start;
```

**Target:** < 10ms

**Baseline:** TBD

---

### Benchmark 3: Score Calculation

**What:** Calculate score for a word with multipliers

**Test:**
```typescript
const placements = [/* 7-tile word with multipliers */];
const start = performance.now();
const score = calculateScore(placements, board);
const duration = performance.now() - start;
```

**Target:** < 5ms

**Baseline:** TBD

---

### Benchmark 4: Board Rendering

**What:** Time to render full 15x15 board in browser

**Test:**
```typescript
performance.mark('board-render-start');
renderBoard();
performance.mark('board-render-end');
performance.measure('board-render', 'board-render-start', 'board-render-end');
```

**Target:** < 50ms

**Baseline:** TBD

---

### Benchmark 5: WebSocket Round-Trip

**What:** Client sends message, server responds

**Test:**
```typescript
const start = Date.now();
socket.emit('ping');
socket.once('pong', () => {
  const duration = Date.now() - start;
  console.log('Round-trip:', duration, 'ms');
});
```

**Target:** < 50ms (local network)

**Baseline:** TBD

---

### Benchmark 6: Complete Turn Flow

**What:** End-to-end time from submit to board update

**Test:**
```typescript
const start = performance.now();

// Client submits word
socket.emit('submitWord', { placements });

// Wait for all updates
Promise.all([
  waitForEvent('wordAccepted'),
  waitForEvent('boardUpdate'),
  waitForEvent('scoreUpdate'),
  waitForEvent('turnChange')
]).then(() => {
  const duration = performance.now() - start;
  console.log('Complete turn:', duration, 'ms');
});
```

**Target:** < 200ms

**Baseline:** TBD

---

### Benchmark 7: Memory Usage (Server)

**What:** Server memory footprint during game

**Test:**
```typescript
const used = process.memoryUsage();
console.log({
  heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB',
  heapTotal: Math.round(used.heapTotal / 1024 / 1024) + 'MB',
  rss: Math.round(used.rss / 1024 / 1024) + 'MB'
});
```

**Target:** < 100MB heap

**Baseline:** TBD

---

### Benchmark 8: Client Memory Usage

**What:** Browser memory during gameplay

**Test:**
Use Chrome DevTools Memory Profiler

**Target:** < 50MB

**Baseline:** TBD

---

### Benchmark 9: Tile Bag Initialization

**What:** Time to create and shuffle 100 tiles

**Test:**
```typescript
const start = performance.now();
const bag = initializeTileBag();
const duration = performance.now() - start;
```

**Target:** < 1ms

**Baseline:** TBD

---

### Benchmark 10: Load Test - 4 Players

**What:** Server handles 4 concurrent players

**Test:**
```bash
# Using Artillery or similar
artillery quick --count 4 --num 10 http://localhost:3000
```

**Metrics:**
- Response time p95 < 200ms
- No errors
- CPU < 50%
- Memory stable

**Target:** Handle 4 players smoothly

**Baseline:** TBD

---

## Performance Testing Procedure

### 1. Establish Baselines

Run all benchmarks on reference hardware:
- Document hardware specs
- Run each benchmark 10 times
- Record mean, median, p95, p99
- Document baseline date

### 2. Regular Testing

Run benchmarks:
- Before each release
- After major changes
- Weekly in CI/CD

### 3. Regression Detection

Alert if:
- Any benchmark > 20% slower than baseline
- Any benchmark exceeds max acceptable
- Memory usage increases > 50%

### 4. Performance Budgets

Set budgets:
- Total server response < 100ms
- Total client render < 200ms
- Total turn flow < 500ms

### 5. Profiling

When benchmark fails:
- Profile with Node.js profiler
- Use Chrome DevTools profiler
- Identify bottlenecks
- Document findings
- Escalate to /5-performance/optimizations

---

## Benchmark Execution

### Unit Performance Tests

```bash
npm run test:performance
```

### Load Tests

```bash
npm run test:load
```

### Memory Profiling

```bash
node --inspect dist/server.js
# Chrome DevTools → Memory tab
```

### CPU Profiling

```bash
node --prof dist/server.js
node --prof-process isolate-*.log > profile.txt
```

---

## Performance Dashboard

### Metrics to Track

1. **Response Times**
   - Word validation
   - Score calculation
   - Turn flow

2. **Resource Usage**
   - Server memory
   - Client memory
   - CPU usage

3. **Network**
   - WebSocket latency
   - Event frequency

4. **User Experience**
   - Time to first render
   - Interaction latency
   - Frame rate

### Reporting

- Weekly performance report
- Regression alerts
- Trend analysis
- Bottleneck identification

---

## Performance Acceptance Criteria

### For MVP Release

- [ ] All HIGH priority targets met
- [ ] No operation exceeds max acceptable
- [ ] 4 players can play smoothly
- [ ] No memory leaks detected
- [ ] Baselines documented

### For Production Release

- [ ] All targets met (including MEDIUM priority)
- [ ] Performance tests automated
- [ ] Continuous monitoring in place
- [ ] Performance documentation complete
- [ ] Optimization opportunities documented

---

## Known Performance Considerations

### Potential Bottlenecks

1. **Dictionary Lookup**
   - Linear search vs hash set
   - File loading time
   - **Mitigation:** Use Set for O(1) lookup ✅

2. **Board Rendering**
   - 225 cells to render
   - DOM manipulation
   - **Mitigation:** Virtual DOM or efficient updates

3. **Score Calculation**
   - Multiple traversals
   - Premium square lookups
   - **Mitigation:** Cache premium squares ✅

4. **WebSocket Broadcasting**
   - N broadcasts per turn
   - JSON serialization
   - **Mitigation:** Acceptable for 4 players

### Performance vs Other Concerns

- **Security** takes priority over performance
- **Correctness** takes priority over speed
- **Usability** may trump raw performance

---

## Benchmark Results Log

### Baseline (Date: TBD)

| Benchmark | Result | Status |
|-----------|--------|--------|
| Dictionary lookup | TBD | ⏳ |
| Word validation | TBD | ⏳ |
| Score calculation | TBD | ⏳ |
| Board rendering | TBD | ⏳ |
| WebSocket RTT | TBD | ⏳ |
| Complete turn | TBD | ⏳ |
| Server memory | TBD | ⏳ |
| Client memory | TBD | ⏳ |
| Tile bag init | TBD | ⏳ |
| 4 player load | TBD | ⏳ |

*Update this table after running benchmarks*
