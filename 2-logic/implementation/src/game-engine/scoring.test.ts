import { initializeBoard } from './board';
import { calculateScore } from './scoring';

describe('calculateScore', () => {
  it('should calculate basic word score without multipliers', () => {
    const board = initializeBoard();
    // Place tiles away from premium squares
    const placements = [
      { row: 0, col: 1, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 0, col: 2, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 0, col: 4, tile: { letter: 'T', points: 1, isBlank: false } },
    ];
    // Fill gap
    board[0][3] = { letter: 'R', points: 1, isBlank: false };

    const score = calculateScore(placements, board);

    expect(score).toBe(6); // C(3) + A(1) + R(1) + T(1) = 6
  });

  it('should apply double letter score', () => {
    const board = initializeBoard();
    // (0,3) is double letter
    const placements = [{ row: 0, col: 3, tile: { letter: 'A', points: 1, isBlank: false } }];

    const score = calculateScore(placements, board);

    expect(score).toBe(2); // A(1) × 2 = 2
  });

  it('should apply triple letter score', () => {
    const board = initializeBoard();
    // (1,5) is triple letter
    const placements = [{ row: 1, col: 5, tile: { letter: 'Q', points: 10, isBlank: false } }];

    const score = calculateScore(placements, board);

    expect(score).toBe(30); // Q(10) × 3 = 30
  });

  it('should apply double word score', () => {
    const board = initializeBoard();
    // (1,1) is double word
    const placements = [
      { row: 1, col: 0, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 1, col: 1, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 1, col: 2, tile: { letter: 'T', points: 1, isBlank: false } },
    ];

    const score = calculateScore(placements, board);

    expect(score).toBe(10); // (3+1+1) × 2 = 10
  });

  it('should apply triple word score', () => {
    const board = initializeBoard();
    // (0,0) is triple word
    const placements = [
      { row: 0, col: 0, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 0, col: 1, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 0, col: 2, tile: { letter: 'T', points: 1, isBlank: false } },
    ];

    const score = calculateScore(placements, board);

    expect(score).toBe(15); // (3+1+1) × 3 = 15
  });

  it('should apply bingo bonus when using all 7 tiles', () => {
    const board = initializeBoard();
    const placements = Array(7)
      .fill(null)
      .map((_, i) => ({
        row: 7,
        col: 7 + i,
        tile: { letter: 'A', points: 1, isBlank: false },
      }));

    const score = calculateScore(placements, board);

    expect(score).toBe(57); // 7 + 50 (bingo bonus)
  });

  it('should include cross word scores', () => {
    const board = initializeBoard();
    board[6][8] = { letter: 'C', points: 3, isBlank: false };
    board[8][8] = { letter: 'T', points: 1, isBlank: false };

    const placements = [
      { row: 7, col: 7, tile: { letter: 'B', points: 3, isBlank: false } },
      { row: 7, col: 8, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 7, col: 9, tile: { letter: 'T', points: 1, isBlank: false } },
    ];

    const score = calculateScore(placements, board);

    expect(score).toBeGreaterThan(5); // BAT + CAT cross word
  });

  it('should count blank tiles as zero points', () => {
    const board = initializeBoard();
    const placements = [
      { row: 7, col: 7, tile: { letter: 'A', points: 0, isBlank: true } },
      { row: 7, col: 8, tile: { letter: 'T', points: 1, isBlank: false } },
    ];

    const score = calculateScore(placements, board);

    expect(score).toBe(1); // 0 + 1
  });

  it('should not score single tile placements', () => {
    const board = initializeBoard();
    // Place a single tile with no adjacent tiles
    const placements = [{ row: 5, col: 5, tile: { letter: 'A', points: 1, isBlank: false } }];

    const score = calculateScore(placements, board);

    expect(score).toBe(0); // Single tile = no word
  });

  it('should apply letter multipliers before word multipliers', () => {
    const board = initializeBoard();
    // (0,0) is triple word, (0,3) is double letter
    const placements = [
      { row: 0, col: 0, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 0, col: 1, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 0, col: 2, tile: { letter: 'R', points: 1, isBlank: false } },
      { row: 0, col: 3, tile: { letter: 'T', points: 1, isBlank: false } },
    ];

    const score = calculateScore(placements, board);

    // C(3) + A(1) + R(1) + T(1×2) = 7, then ×3 (triple word) = 21
    expect(score).toBe(21);
  });

  it('should handle multiple word multipliers', () => {
    const board = initializeBoard();
    // (0,0) and (0,7) are both triple word
    const placements = [
      { row: 0, col: 0, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 0, col: 1, tile: { letter: 'B', points: 3, isBlank: false } },
      { row: 0, col: 2, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 0, col: 3, tile: { letter: 'D', points: 2, isBlank: false } },
      { row: 0, col: 4, tile: { letter: 'E', points: 1, isBlank: false } },
      { row: 0, col: 5, tile: { letter: 'F', points: 4, isBlank: false } },
      { row: 0, col: 6, tile: { letter: 'G', points: 2, isBlank: false } },
      { row: 0, col: 7, tile: { letter: 'H', points: 4, isBlank: false } },
    ];

    const score = calculateScore(placements, board);

    // Should multiply by both triple word squares: ×3 ×3 = ×9
    // Base: 1+3+3+2+1+4+2+4 = 20, then ×9 = 180, plus bingo (7 tiles but 8 placed) = 180
    // Actually 8 tiles, so no bingo
    expect(score).toBeGreaterThan(100); // Should be very high due to double triple
  });
});
