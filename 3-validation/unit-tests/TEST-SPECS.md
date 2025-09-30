# Unit Test Specifications

## Test Framework
- Jest for TypeScript testing
- Coverage target: 100% of public functions

---

## Tile Bag Tests

### `initializeTileBag()`

#### Should create 100 tiles total
```typescript
describe('initializeTileBag', () => {
  it('should create exactly 100 tiles', () => {
    const bag = initializeTileBag();
    expect(bag).toHaveLength(100);
  });
});
```

#### Should have correct tile distribution
```typescript
it('should have correct number of each letter', () => {
  const bag = initializeTileBag();
  const letterCounts = {};

  bag.forEach(tile => {
    letterCounts[tile.letter] = (letterCounts[tile.letter] || 0) + 1;
  });

  expect(letterCounts['A']).toBe(9);
  expect(letterCounts['E']).toBe(12);
  expect(letterCounts['Q']).toBe(1);
  expect(letterCounts['_']).toBe(2); // Blanks
});
```

#### Should have correct point values
```typescript
it('should assign correct point values', () => {
  const bag = initializeTileBag();
  const aTile = bag.find(t => t.letter === 'A' && !t.isBlank);
  const qTile = bag.find(t => t.letter === 'Q');
  const blankTile = bag.find(t => t.isBlank);

  expect(aTile.points).toBe(1);
  expect(qTile.points).toBe(10);
  expect(blankTile.points).toBe(0);
});
```

#### Should shuffle tiles randomly
```typescript
it('should shuffle tiles randomly', () => {
  const bag1 = initializeTileBag();
  const bag2 = initializeTileBag();

  // Bags should not be identical (very unlikely with random shuffle)
  const identical = bag1.every((tile, i) =>
    tile.letter === bag2[i].letter && tile.points === bag2[i].points
  );

  expect(identical).toBe(false);
});
```

### `drawTiles(tileBag, count)`

#### Should draw requested number of tiles
```typescript
describe('drawTiles', () => {
  it('should draw requested number of tiles', () => {
    const bag = initializeTileBag();
    const drawn = drawTiles(bag, 7);

    expect(drawn).toHaveLength(7);
    expect(bag).toHaveLength(93);
  });
});
```

#### Should draw fewer tiles if bag has insufficient tiles
```typescript
it('should draw only available tiles when count exceeds bag size', () => {
  const bag = [{ letter: 'A', points: 1, isBlank: false }];
  const drawn = drawTiles(bag, 7);

  expect(drawn).toHaveLength(1);
  expect(bag).toHaveLength(0);
});
```

#### Should handle empty bag
```typescript
it('should return empty array when bag is empty', () => {
  const bag = [];
  const drawn = drawTiles(bag, 7);

  expect(drawn).toHaveLength(0);
});
```

---

## Board Tests

### `initializeBoard()`

#### Should create 15x15 grid
```typescript
describe('initializeBoard', () => {
  it('should create 15x15 grid of null values', () => {
    const board = initializeBoard();

    expect(board).toHaveLength(15);
    expect(board[0]).toHaveLength(15);
    expect(board.every(row => row.every(cell => cell === null))).toBe(true);
  });
});
```

### `getPremiumSquareType(row, col)`

#### Should identify triple word squares
```typescript
describe('getPremiumSquareType', () => {
  it('should identify triple word squares', () => {
    expect(getPremiumSquareType(0, 0)).toBe('TRIPLE_WORD');
    expect(getPremiumSquareType(0, 7)).toBe('TRIPLE_WORD');
    expect(getPremiumSquareType(14, 14)).toBe('TRIPLE_WORD');
  });
});
```

#### Should identify double word squares
```typescript
it('should identify double word squares', () => {
  expect(getPremiumSquareType(1, 1)).toBe('DOUBLE_WORD');
  expect(getPremiumSquareType(7, 7)).toBe('DOUBLE_WORD'); // Center
  expect(getPremiumSquareType(13, 13)).toBe('DOUBLE_WORD');
});
```

#### Should identify triple letter squares
```typescript
it('should identify triple letter squares', () => {
  expect(getPremiumSquareType(1, 5)).toBe('TRIPLE_LETTER');
  expect(getPremiumSquareType(5, 1)).toBe('TRIPLE_LETTER');
});
```

#### Should identify double letter squares
```typescript
it('should identify double letter squares', () => {
  expect(getPremiumSquareType(0, 3)).toBe('DOUBLE_LETTER');
  expect(getPremiumSquareType(3, 0)).toBe('DOUBLE_LETTER');
});
```

#### Should identify normal squares
```typescript
it('should identify normal squares', () => {
  expect(getPremiumSquareType(5, 5)).toBe('NORMAL');
  expect(getPremiumSquareType(8, 8)).toBe('NORMAL');
});
```

---

## Validation Tests

### `validatePlacement(placements, board, isFirstMove)`

#### Should reject empty placements
```typescript
describe('validatePlacement', () => {
  it('should reject empty placements array', () => {
    const board = initializeBoard();
    const result = validatePlacement([], board, true);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('No tiles placed');
  });
});
```

#### Should reject invalid row
```typescript
it('should reject placement with invalid row', () => {
  const board = initializeBoard();
  const placements = [
    { row: -1, col: 7, tile: { letter: 'A', points: 1, isBlank: false } }
  ];
  const result = validatePlacement(placements, board, true);

  expect(result.valid).toBe(false);
  expect(result.error).toBe('Invalid row');
});
```

#### Should reject invalid column
```typescript
it('should reject placement with invalid column', () => {
  const board = initializeBoard();
  const placements = [
    { row: 7, col: 15, tile: { letter: 'A', points: 1, isBlank: false } }
  ];
  const result = validatePlacement(placements, board, true);

  expect(result.valid).toBe(false);
  expect(result.error).toBe('Invalid column');
});
```

#### Should reject placement on occupied square
```typescript
it('should reject placement on occupied square', () => {
  const board = initializeBoard();
  board[7][7] = { letter: 'X', points: 8, isBlank: false };

  const placements = [
    { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } }
  ];
  const result = validatePlacement(placements, board, false);

  expect(result.valid).toBe(false);
  expect(result.error).toBe('Square already occupied');
});
```

#### Should reject non-linear placements
```typescript
it('should reject tiles not forming a line', () => {
  const board = initializeBoard();
  const placements = [
    { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
    { row: 8, col: 8, tile: { letter: 'B', points: 3, isBlank: false } }
  ];
  const result = validatePlacement(placements, board, true);

  expect(result.valid).toBe(false);
  expect(result.error).toBe('Tiles must form a single line');
});
```

#### Should reject placements with gaps
```typescript
it('should reject horizontal placement with gap', () => {
  const board = initializeBoard();
  const placements = [
    { row: 7, col: 6, tile: { letter: 'A', points: 1, isBlank: false } },
    { row: 7, col: 8, tile: { letter: 'B', points: 3, isBlank: false } }
  ];
  const result = validatePlacement(placements, board, true);

  expect(result.valid).toBe(false);
  expect(result.error).toBe('Gap in word');
});
```

#### Should require first move to touch center
```typescript
it('should require first move to touch center (7,7)', () => {
  const board = initializeBoard();
  const placements = [
    { row: 5, col: 5, tile: { letter: 'A', points: 1, isBlank: false } }
  ];
  const result = validatePlacement(placements, board, true);

  expect(result.valid).toBe(false);
  expect(result.error).toBe('First word must touch center');
});
```

#### Should accept first move touching center
```typescript
it('should accept first move touching center', () => {
  const board = initializeBoard();
  const placements = [
    { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } }
  ];
  const result = validatePlacement(placements, board, true);

  expect(result.valid).toBe(true);
});
```

#### Should require subsequent moves to connect
```typescript
it('should require subsequent moves to connect to existing tiles', () => {
  const board = initializeBoard();
  board[7][7] = { letter: 'X', points: 8, isBlank: false };

  const placements = [
    { row: 0, col: 0, tile: { letter: 'A', points: 1, isBlank: false } }
  ];
  const result = validatePlacement(placements, board, false);

  expect(result.valid).toBe(false);
  expect(result.error).toBe('Word must connect to existing tiles');
});
```

#### Should accept valid horizontal placement
```typescript
it('should accept valid horizontal placement', () => {
  const board = initializeBoard();
  const placements = [
    { row: 7, col: 6, tile: { letter: 'C', points: 3, isBlank: false } },
    { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
    { row: 7, col: 8, tile: { letter: 'T', points: 1, isBlank: false } }
  ];
  const result = validatePlacement(placements, board, true);

  expect(result.valid).toBe(true);
});
```

#### Should accept valid vertical placement
```typescript
it('should accept valid vertical placement', () => {
  const board = initializeBoard();
  const placements = [
    { row: 6, col: 7, tile: { letter: 'C', points: 3, isBlank: false } },
    { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
    { row: 8, col: 7, tile: { letter: 'T', points: 1, isBlank: false } }
  ];
  const result = validatePlacement(placements, board, true);

  expect(result.valid).toBe(true);
});
```

### `extractWords(placements, board)`

#### Should extract main horizontal word
```typescript
describe('extractWords', () => {
  it('should extract main horizontal word', () => {
    const board = initializeBoard();
    const placements = [
      { row: 7, col: 7, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 7, col: 8, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 7, col: 9, tile: { letter: 'T', points: 1, isBlank: false } }
    ];

    const words = extractWords(placements, board);

    expect(words).toContain('CAT');
  });
});
```

#### Should extract main vertical word
```typescript
it('should extract main vertical word', () => {
  const board = initializeBoard();
  const placements = [
    { row: 7, col: 7, tile: { letter: 'C', points: 3, isBlank: false } },
    { row: 8, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
    { row: 9, col: 7, tile: { letter: 'T', points: 1, isBlank: false } }
  ];

  const words = extractWords(placements, board);

  expect(words).toContain('CAT');
});
```

#### Should extract cross words
```typescript
it('should extract perpendicular cross words', () => {
  const board = initializeBoard();
  // Existing word on board
  board[6][7] = { letter: 'B', points: 3, isBlank: false };
  board[8][7] = { letter: 'T', points: 1, isBlank: false };

  // New word
  const placements = [
    { row: 7, col: 6, tile: { letter: 'C', points: 3, isBlank: false } },
    { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
    { row: 7, col: 8, tile: { letter: 'R', points: 1, isBlank: false } }
  ];

  const words = extractWords(placements, board);

  expect(words).toContain('CAR'); // Main word
  expect(words).toContain('BAT'); // Cross word
});
```

### `validateWords(words, dictionary)`

#### Should accept valid words
```typescript
describe('validateWords', () => {
  it('should accept all valid words', () => {
    const dictionary = new Set(['CAT', 'DOG', 'BIRD']);
    const words = ['CAT', 'DOG'];

    const result = validateWords(words, dictionary);

    expect(result.valid).toBe(true);
  });
});
```

#### Should reject invalid words
```typescript
it('should reject invalid words', () => {
  const dictionary = new Set(['CAT', 'DOG']);
  const words = ['CAT', 'XYZ'];

  const result = validateWords(words, dictionary);

  expect(result.valid).toBe(false);
  expect(result.error).toBe('Invalid word(s)');
  expect(result.invalidWords).toContain('XYZ');
});
```

#### Should be case insensitive
```typescript
it('should validate case-insensitively', () => {
  const dictionary = new Set(['CAT']);
  const words = ['cat'];

  const result = validateWords(words, dictionary);

  expect(result.valid).toBe(true);
});
```

---

## Scoring Tests

### `calculateScore(placements, board)`

#### Should calculate basic word score
```typescript
describe('calculateScore', () => {
  it('should calculate basic word score without multipliers', () => {
    const board = initializeBoard();
    // Place tiles away from premium squares
    const placements = [
      { row: 0, col: 1, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 0, col: 2, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 0, col: 4, tile: { letter: 'T', points: 1, isBlank: false } }
    ];
    // Fill gap
    board[0][3] = { letter: 'R', points: 1, isBlank: false };

    const score = calculateScore(placements, board);

    expect(score).toBe(6); // C(3) + A(1) + R(1) + T(1) = 6
  });
});
```

#### Should apply double letter score
```typescript
it('should apply double letter score', () => {
  const board = initializeBoard();
  // (0,3) is double letter
  const placements = [
    { row: 0, col: 3, tile: { letter: 'A', points: 1, isBlank: false } }
  ];

  const score = calculateScore(placements, board);

  expect(score).toBe(2); // A(1) × 2 = 2
});
```

#### Should apply triple letter score
```typescript
it('should apply triple letter score', () => {
  const board = initializeBoard();
  // (1,5) is triple letter
  const placements = [
    { row: 1, col: 5, tile: { letter: 'Q', points: 10, isBlank: false } }
  ];

  const score = calculateScore(placements, board);

  expect(score).toBe(30); // Q(10) × 3 = 30
});
```

#### Should apply double word score
```typescript
it('should apply double word score', () => {
  const board = initializeBoard();
  // (1,1) is double word
  const placements = [
    { row: 1, col: 0, tile: { letter: 'C', points: 3, isBlank: false } },
    { row: 1, col: 1, tile: { letter: 'A', points: 1, isBlank: false } },
    { row: 1, col: 2, tile: { letter: 'T', points: 1, isBlank: false } }
  ];

  const score = calculateScore(placements, board);

  expect(score).toBe(10); // (3+1+1) × 2 = 10
});
```

#### Should apply triple word score
```typescript
it('should apply triple word score', () => {
  const board = initializeBoard();
  // (0,0) is triple word
  const placements = [
    { row: 0, col: 0, tile: { letter: 'C', points: 3, isBlank: false } },
    { row: 0, col: 1, tile: { letter: 'A', points: 1, isBlank: false } },
    { row: 0, col: 2, tile: { letter: 'T', points: 1, isBlank: false } }
  ];

  const score = calculateScore(placements, board);

  expect(score).toBe(15); // (3+1+1) × 3 = 15
});
```

#### Should apply bingo bonus for 7 tiles
```typescript
it('should apply bingo bonus when using all 7 tiles', () => {
  const board = initializeBoard();
  const placements = Array(7).fill(null).map((_, i) => ({
    row: 7,
    col: 7 + i,
    tile: { letter: 'A', points: 1, isBlank: false }
  }));

  const score = calculateScore(placements, board);

  expect(score).toBe(57); // 7 + 50 (bingo bonus)
});
```

#### Should calculate cross word scores
```typescript
it('should include cross word scores', () => {
  const board = initializeBoard();
  board[6][8] = { letter: 'C', points: 3, isBlank: false };
  board[8][8] = { letter: 'T', points: 1, isBlank: false };

  const placements = [
    { row: 7, col: 7, tile: { letter: 'B', points: 3, isBlank: false } },
    { row: 7, col: 8, tile: { letter: 'A', points: 1, isBlank: false } },
    { row: 7, col: 9, tile: { letter: 'T', points: 1, isBlank: false } }
  ];

  const score = calculateScore(placements, board);

  expect(score).toBeGreaterThan(5); // BAT + CAT cross word
});
```

#### Should count blank tiles as zero points
```typescript
it('should count blank tiles as zero points', () => {
  const board = initializeBoard();
  const placements = [
    { row: 7, col: 7, tile: { letter: 'A', points: 0, isBlank: true } },
    { row: 7, col: 8, tile: { letter: 'T', points: 1, isBlank: false } }
  ];

  const score = calculateScore(placements, board);

  expect(score).toBe(1); // 0 + 1
});
```

---

## Game Engine Tests

### `startGame(gameState)`

#### Should initialize game state
```typescript
describe('GameEngine.startGame', () => {
  it('should initialize game state correctly', () => {
    const gameEngine = new GameEngine();
    const gameState = {
      phase: 'lobby',
      board: [],
      players: [
        { id: '1', name: 'Alice', tiles: [], score: 0, connected: true, isHost: true },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false }
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: []
    };

    const result = gameEngine.startGame(gameState);

    expect(result.success).toBe(true);
    expect(gameState.phase).toBe('playing');
    expect(gameState.board).toHaveLength(15);
    expect(gameState.tileBag.length).toBeLessThanOrEqual(86); // 100 - (2 players × 7 tiles)
    expect(gameState.players[0].tiles).toHaveLength(7);
    expect(gameState.players[1].tiles).toHaveLength(7);
  });
});
```

#### Should require minimum 2 players
```typescript
it('should reject start with fewer than 2 players', () => {
  const gameEngine = new GameEngine();
  const gameState = {
    phase: 'lobby',
    board: [],
    players: [{ id: '1', name: 'Alice', tiles: [], score: 0, connected: true, isHost: true }],
    currentPlayerIndex: 0,
    tileBag: [],
    consecutivePasses: 0,
    turnHistory: []
  };

  const result = gameEngine.startGame(gameState);

  expect(result.success).toBe(false);
  expect(result.error).toBe('Need at least 2 players');
});
```

#### Should reject if already started
```typescript
it('should reject if game already started', () => {
  const gameEngine = new GameEngine();
  const gameState = {
    phase: 'playing',
    board: initializeBoard(),
    players: [
      { id: '1', name: 'Alice', tiles: [], score: 0, connected: true, isHost: true },
      { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false }
    ],
    currentPlayerIndex: 0,
    tileBag: [],
    consecutivePasses: 0,
    turnHistory: []
  };

  const result = gameEngine.startGame(gameState);

  expect(result.success).toBe(false);
  expect(result.error).toBe('Game already started');
});
```

### `submitWord(gameState, playerId, placements, dictionary)`

#### Should accept valid word
```typescript
describe('GameEngine.submitWord', () => {
  it('should accept and score valid word', () => {
    // Setup test requires full game state initialization
    // Test implementation omitted for brevity - follows same pattern
  });
});
```

### `passTurn(gameState, playerId)`

#### Should allow player to pass
```typescript
describe('GameEngine.passTurn', () => {
  it('should allow current player to pass', () => {
    // Test implementation
  });
});
```

#### Should end game after 6 consecutive passes
```typescript
it('should end game after 6 consecutive passes', () => {
  // Test implementation
  });
});
```

---

## Test Coverage Requirements

- **Minimum**: 90% line coverage
- **Target**: 100% function coverage
- **Critical paths**: 100% coverage (validation, scoring, game state changes)

## Running Tests

```bash
npm test
npm test -- --coverage
```
