# Security Test Specifications

## Test Framework
- Jest for automated tests
- Manual penetration testing procedures
- npm audit for dependency scanning

---

## Input Validation Tests

### Player Name Validation

#### Should reject XSS attempts in player name
```typescript
describe('Security: Player Name Validation', () => {
  it('should reject script tags in player name', () => {
    const maliciousNames = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      'Alice<script>alert(1)</script>',
      '"><script>alert(1)</script>',
      "'; DROP TABLE players; --"
    ];

    maliciousNames.forEach(name => {
      const result = validatePlayerName(name);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid characters');
    });
  });

  it('should reject HTML entities', () => {
    const result = validatePlayerName('Alice&lt;script&gt;');
    expect(result.valid).toBe(false);
  });

  it('should allow only alphanumeric and spaces', () => {
    const validNames = ['Alice', 'Bob Smith', 'Player 1'];
    const invalidNames = ['Alice<br>', 'Bob@Smith', 'Test!User'];

    validNames.forEach(name => {
      expect(validatePlayerName(name).valid).toBe(true);
    });

    invalidNames.forEach(name => {
      expect(validatePlayerName(name).valid).toBe(false);
    });
  });
});
```

---

### Tile Letter Validation

#### Should reject invalid tile letters
```typescript
describe('Security: Tile Letter Validation', () => {
  it('should reject non-alphabet letters', () => {
    const invalidTiles = [
      { letter: '<script>', points: 1 },
      { letter: '!@#', points: 1 },
      { letter: '1', points: 1 },
      { letter: '', points: 1 },
      { letter: 'AB', points: 1 } // Multiple chars
    ];

    invalidTiles.forEach(tile => {
      const result = validateTileLetter(tile.letter);
      expect(result.valid).toBe(false);
    });
  });

  it('should accept only A-Z and underscore (blank)', () => {
    const validLetters = ['A', 'Z', 'M', '_'];

    validLetters.forEach(letter => {
      const result = validateTileLetter(letter);
      expect(result.valid).toBe(true);
    });
  });

  it('should reject lowercase letters', () => {
    const result = validateTileLetter('a');
    expect(result.valid).toBe(false);
  });
});
```

---

### Dictionary Endpoint Validation

#### Should reject path traversal in dictionary check
```typescript
describe('Security: Dictionary Endpoint', () => {
  it('should reject path traversal attempts', async () => {
    const maliciousPaths = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32',
      '%2e%2e%2f',
      '....//....//etc/passwd'
    ];

    for (const path of maliciousPaths) {
      const response = await request(app)
        .get(`/api/dictionary/check/${path}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    }
  });

  it('should accept only alphabetic words', async () => {
    const validWords = ['HELLO', 'WORLD', 'CAT'];
    const invalidWords = ['HELLO!', '123', 'A<B>C', ''];

    for (const word of validWords) {
      const response = await request(app)
        .get(`/api/dictionary/check/${word}`);
      expect(response.status).toBe(200);
    }

    for (const word of invalidWords) {
      const response = await request(app)
        .get(`/api/dictionary/check/${word}`);
      expect(response.status).toBe(400);
    }
  });
});
```

---

## Authorization Tests

### Tile Ownership Validation

#### Should reject submission of tiles player doesn't own
```typescript
describe('Security: Tile Ownership', () => {
  it('should reject word using tiles not in player rack', () => {
    const gameState = createTestGameState();
    const player = gameState.players[0];
    player.tiles = [
      { letter: 'A', points: 1, isBlank: false },
      { letter: 'B', points: 3, isBlank: false }
    ];

    const placements = [
      { row: 7, col: 7, tile: { letter: 'Q', points: 10, isBlank: false } }
    ];

    const result = gameEngine.submitWord(
      gameState,
      player.id,
      placements,
      dictionary
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("don't have that tile");
  });

  it('should reject using same tile twice', () => {
    const player = createTestPlayer();
    player.tiles = [{ letter: 'A', points: 1, isBlank: false }];

    const placements = [
      { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 7, col: 8, tile: { letter: 'A', points: 1, isBlank: false } }
    ];

    const result = gameEngine.submitWord(
      gameState,
      player.id,
      placements,
      dictionary
    );

    expect(result.success).toBe(false);
  });
});
```

---

### Turn Authorization

#### Should reject actions from non-current player
```typescript
describe('Security: Turn Authorization', () => {
  it('should reject word submission when not player turn', () => {
    const gameState = createTestGameState();
    gameState.currentPlayerIndex = 0;
    const player2 = gameState.players[1];

    const result = gameEngine.submitWord(
      gameState,
      player2.id,
      validPlacements,
      dictionary
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not your turn');
  });

  it('should reject pass turn when not player turn', () => {
    const gameState = createTestGameState();
    gameState.currentPlayerIndex = 0;
    const player2 = gameState.players[1];

    const result = gameEngine.passTurn(gameState, player2.id);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not your turn');
  });

  it('should reject tile exchange when not player turn', () => {
    const gameState = createTestGameState();
    gameState.currentPlayerIndex = 0;
    const player2 = gameState.players[1];

    const result = gameEngine.exchangeTiles(gameState, player2.id, [0, 1]);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Not your turn');
  });
});
```

---

## Data Exposure Tests

### Tile Privacy

#### Should not expose opponent tiles
```typescript
describe('Security: Tile Privacy', () => {
  it('should only send tiles to owning player', (done) => {
    const player1Socket = io('http://localhost:3001');
    const player2Socket = io('http://localhost:3001');

    let player1Tiles;
    let player2Tiles;

    player1Socket.emit('joinGame', { playerName: 'Player1' });
    player2Socket.emit('joinGame', { playerName: 'Player2' });

    player1Socket.emit('startGame', {});

    player1Socket.on('yourTiles', (data) => {
      player1Tiles = data.tiles;
    });

    player2Socket.on('yourTiles', (data) => {
      player2Tiles = data.tiles;
    });

    setTimeout(() => {
      // Verify tiles are different
      expect(player1Tiles).toBeDefined();
      expect(player2Tiles).toBeDefined();
      expect(player1Tiles).not.toEqual(player2Tiles);

      // Verify Player1 never receives Player2's tiles
      expect(player1Socket.listeners('yourTiles').length).toBe(1);

      player1Socket.disconnect();
      player2Socket.disconnect();
      done();
    }, 1000);
  });
});
```

---

### Error Message Sanitization

#### Should not leak internal state in errors
```typescript
describe('Security: Error Messages', () => {
  it('should not include stack traces in client errors', () => {
    const socket = createMockSocket();

    socket.emit('submitWord', { placements: 'invalid' });

    expect(socket.emittedEvents['error']).toBeDefined();
    const errorMessage = socket.emittedEvents['error'][0].message;

    expect(errorMessage).not.toContain('at Object');
    expect(errorMessage).not.toContain('node_modules');
    expect(errorMessage).not.toContain(__filename);
  });

  it('should provide generic error messages', () => {
    const socket = createMockSocket();

    socket.emit('submitWord', null);

    const error = socket.emittedEvents['error'][0];
    expect(error.message).toBe('Invalid request');
    expect(error.message).not.toContain('undefined');
    expect(error.message).not.toContain('null');
  });
});
```

---

## Denial of Service Tests

### Rate Limiting

#### Should rate limit rapid message sending
```typescript
describe('Security: Rate Limiting', () => {
  it('should throttle rapid submitWord requests', async () => {
    const socket = io('http://localhost:3001');
    await joinGame(socket, 'TestPlayer');
    await startGame(socket);

    const attempts = [];
    for (let i = 0; i < 100; i++) {
      attempts.push(
        new Promise((resolve) => {
          socket.emit('submitWord', validPlacements);
          socket.once('error', (error) => resolve(error));
          socket.once('wordRejected', (data) => resolve(data));
        })
      );
    }

    const results = await Promise.all(attempts);
    const rateLimitErrors = results.filter(r =>
      r.message?.includes('Too many requests') ||
      r.code === 'RATE_LIMIT'
    );

    expect(rateLimitErrors.length).toBeGreaterThan(0);
  });
});
```

---

### Connection Limits

#### Should limit connections per IP
```typescript
describe('Security: Connection Limits', () => {
  it('should limit max connections from single IP', async () => {
    const connections = [];

    // Attempt to open 100 connections
    for (let i = 0; i < 100; i++) {
      try {
        const socket = io('http://localhost:3001');
        connections.push(socket);
      } catch (error) {
        // Expected to fail at some point
      }
    }

    // Should not allow all 100
    expect(connections.length).toBeLessThan(100);

    connections.forEach(s => s.disconnect());
  });
});
```

---

### Payload Size Limits

#### Should reject oversized payloads
```typescript
describe('Security: Payload Size', () => {
  it('should reject huge player name', () => {
    const hugeName = 'A'.repeat(10000);
    const result = validatePlayerName(hugeName);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('too long');
  });

  it('should reject huge placement array', () => {
    const hugePlacements = Array(10000).fill({
      row: 7,
      col: 7,
      tile: { letter: 'A', points: 1, isBlank: false }
    });

    const result = gameEngine.submitWord(
      gameState,
      playerId,
      hugePlacements,
      dictionary
    );

    expect(result.success).toBe(false);
  });
});
```

---

## Penetration Testing Procedures

### Manual Test 1: XSS via Player Name

**Steps:**
1. Open browser developer console
2. Join game with name: `<img src=x onerror=alert('XSS')>`
3. Check if script executes
4. Check if name appears sanitized to other players

**Expected Result:** No script execution, sanitized display

**Status:** ⚠️ TO BE TESTED

---

### Manual Test 2: Cheating via Browser Console

**Steps:**
1. Join game and start
2. Open browser console
3. Attempt to modify client state:
   ```javascript
   clientState.myTiles = [/* fabricated tiles */];
   clientState.currentPlayerId = clientState.myId;
   ```
4. Attempt to submit word with fabricated tiles
5. Verify server rejects

**Expected Result:** Server validation prevents cheating

**Status:** ⚠️ TO BE TESTED

---

### Manual Test 3: Message Flood DoS

**Steps:**
1. Join game
2. Run script to spam submitWord:
   ```javascript
   setInterval(() => {
     socket.emit('submitWord', { placements: [] });
   }, 10);
   ```
3. Monitor server CPU/memory
4. Verify rate limiting kicks in

**Expected Result:** Rate limiting prevents DoS

**Status:** ⚠️ TO BE TESTED

---

### Manual Test 4: WebSocket Replay Attack

**Steps:**
1. Capture WebSocket traffic with browser DevTools
2. Replay captured submitWord message
3. Verify server rejects duplicate/stale submissions

**Expected Result:** Replay rejected

**Status:** ⚠️ TO BE TESTED

---

## Dependency Security

### npm audit

```bash
npm audit
npm audit --production
npm audit fix
```

**Run frequency:** Before every release, weekly in development

**Severity thresholds:**
- Critical: Block release
- High: Fix before release
- Medium: Fix in next release
- Low: Track and fix when convenient

---

## Security Test Coverage Goals

- **Input Validation**: 100% of inputs tested
- **Authorization**: 100% of protected actions tested
- **Data Exposure**: All sensitive data paths tested
- **DoS**: Basic protections tested
- **Manual Penetration**: All HIGH threats tested manually

---

## Running Security Tests

```bash
npm run test:security
npm audit
npm run test:penetration  # Manual tests with guidance
```

---

## Security Sign-Off Checklist

Before release approval:
- [ ] All HIGH severity threats tested
- [ ] Input validation tests passing
- [ ] Authorization tests passing
- [ ] Data exposure tests passing
- [ ] Basic DoS protections tested
- [ ] npm audit run (no critical/high)
- [ ] Manual penetration tests completed
- [ ] Threat model reviewed and updated
- [ ] Security issues logged and tracked
