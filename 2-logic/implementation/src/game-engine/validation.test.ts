import { initializeBoard } from './board';
import { validatePlacement, extractWords, validateWords } from './validation';

describe('validatePlacement', () => {
  it('should reject empty placements array', () => {
    const board = initializeBoard();
    const result = validatePlacement([], board, true);

    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.error).toBe('No tiles placed');
    }
  });

  it('should reject placement with invalid row', () => {
    const board = initializeBoard();
    const placements = [{ row: -1, col: 7, tile: { letter: 'A', points: 1, isBlank: false } }];
    const result = validatePlacement(placements, board, true);

    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.error).toBe('Invalid row');
    }
  });

  it('should reject placement with invalid column', () => {
    const board = initializeBoard();
    const placements = [{ row: 7, col: 15, tile: { letter: 'A', points: 1, isBlank: false } }];
    const result = validatePlacement(placements, board, true);

    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.error).toBe('Invalid column');
    }
  });

  it('should reject placement on occupied square', () => {
    const board = initializeBoard();
    board[7][7] = { letter: 'X', points: 8, isBlank: false };

    const placements = [{ row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } }];
    const result = validatePlacement(placements, board, false);

    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.error).toBe('Square already occupied');
    }
  });

  it('should reject tiles not forming a line', () => {
    const board = initializeBoard();
    const placements = [
      { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 8, col: 8, tile: { letter: 'B', points: 3, isBlank: false } },
    ];
    const result = validatePlacement(placements, board, true);

    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.error).toBe('Tiles must form a single line');
    }
  });

  it('should reject horizontal placement with gap', () => {
    const board = initializeBoard();
    const placements = [
      { row: 7, col: 6, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 7, col: 8, tile: { letter: 'B', points: 3, isBlank: false } },
    ];
    const result = validatePlacement(placements, board, true);

    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.error).toBe('Gap in word');
    }
  });

  it('should require first move to touch center (7,7)', () => {
    const board = initializeBoard();
    const placements = [{ row: 5, col: 5, tile: { letter: 'A', points: 1, isBlank: false } }];
    const result = validatePlacement(placements, board, true);

    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.error).toBe('First word must touch center');
    }
  });

  it('should accept first move touching center', () => {
    const board = initializeBoard();
    const placements = [{ row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } }];
    const result = validatePlacement(placements, board, true);

    expect(result.valid).toBe(true);
  });

  it('should require subsequent moves to connect to existing tiles', () => {
    const board = initializeBoard();
    board[7][7] = { letter: 'X', points: 8, isBlank: false };

    const placements = [{ row: 0, col: 0, tile: { letter: 'A', points: 1, isBlank: false } }];
    const result = validatePlacement(placements, board, false);

    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.error).toBe('Word must connect to existing tiles');
    }
  });

  it('should accept valid horizontal placement', () => {
    const board = initializeBoard();
    const placements = [
      { row: 7, col: 6, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 7, col: 8, tile: { letter: 'T', points: 1, isBlank: false } },
    ];
    const result = validatePlacement(placements, board, true);

    expect(result.valid).toBe(true);
  });

  it('should accept valid vertical placement', () => {
    const board = initializeBoard();
    const placements = [
      { row: 6, col: 7, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 8, col: 7, tile: { letter: 'T', points: 1, isBlank: false } },
    ];
    const result = validatePlacement(placements, board, true);

    expect(result.valid).toBe(true);
  });

  it('should reject invalid tile letter (security check)', () => {
    const board = initializeBoard();
    const placements = [
      { row: 7, col: 7, tile: { letter: '<script>', points: 1, isBlank: false } },
    ];
    const result = validatePlacement(placements, board, true);

    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.error).toContain('Invalid tile letter');
    }
  });
});

describe('extractWords', () => {
  it('should extract main horizontal word', () => {
    const board = initializeBoard();
    const placements = [
      { row: 7, col: 7, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 7, col: 8, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 7, col: 9, tile: { letter: 'T', points: 1, isBlank: false } },
    ];

    const words = extractWords(placements, board);

    expect(words).toContain('CAT');
  });

  it('should extract main vertical word', () => {
    const board = initializeBoard();
    const placements = [
      { row: 7, col: 7, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 8, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 9, col: 7, tile: { letter: 'T', points: 1, isBlank: false } },
    ];

    const words = extractWords(placements, board);

    expect(words).toContain('CAT');
  });

  it('should extract perpendicular cross words', () => {
    const board = initializeBoard();
    // Existing word on board
    board[6][7] = { letter: 'B', points: 3, isBlank: false };
    board[8][7] = { letter: 'T', points: 1, isBlank: false };

    // New word
    const placements = [
      { row: 7, col: 6, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 7, col: 7, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 7, col: 8, tile: { letter: 'R', points: 1, isBlank: false } },
    ];

    const words = extractWords(placements, board);

    expect(words).toContain('CAR'); // Main word
    expect(words).toContain('BAT'); // Cross word
  });
});

describe('validateWords', () => {
  it('should accept all valid words', () => {
    const dictionary = new Set(['CAT', 'DOG', 'BIRD']);
    const words = ['CAT', 'DOG'];

    const result = validateWords(words, dictionary);

    expect(result.valid).toBe(true);
  });

  it('should reject invalid words', () => {
    const dictionary = new Set(['CAT', 'DOG']);
    const words = ['CAT', 'XYZ'];

    const result = validateWords(words, dictionary);

    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.error).toBe('Invalid word(s)');
      expect(result.invalidWords).toContain('XYZ');
    }
  });

  it('should validate case-insensitively', () => {
    const dictionary = new Set(['CAT']);
    const words = ['cat'];

    const result = validateWords(words, dictionary);

    expect(result.valid).toBe(true);
  });
});
