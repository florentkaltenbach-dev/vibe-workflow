import { initializeBoard, getPremiumSquareType } from './board';

describe('initializeBoard', () => {
  it('should create 15x15 grid of null values', () => {
    const board = initializeBoard();

    expect(board).toHaveLength(15);
    expect(board[0]).toHaveLength(15);
    expect(board.every((row) => row.every((cell) => cell === null))).toBe(true);
  });
});

describe('getPremiumSquareType', () => {
  it('should identify triple word squares', () => {
    expect(getPremiumSquareType(0, 0)).toBe('TRIPLE_WORD');
    expect(getPremiumSquareType(0, 7)).toBe('TRIPLE_WORD');
    expect(getPremiumSquareType(14, 14)).toBe('TRIPLE_WORD');
  });

  it('should identify double word squares', () => {
    expect(getPremiumSquareType(1, 1)).toBe('DOUBLE_WORD');
    expect(getPremiumSquareType(7, 7)).toBe('DOUBLE_WORD'); // Center
    expect(getPremiumSquareType(13, 13)).toBe('DOUBLE_WORD');
  });

  it('should identify triple letter squares', () => {
    expect(getPremiumSquareType(1, 5)).toBe('TRIPLE_LETTER');
    expect(getPremiumSquareType(5, 1)).toBe('TRIPLE_LETTER');
  });

  it('should identify double letter squares', () => {
    expect(getPremiumSquareType(0, 3)).toBe('DOUBLE_LETTER');
    expect(getPremiumSquareType(3, 0)).toBe('DOUBLE_LETTER');
  });

  it('should identify normal squares', () => {
    expect(getPremiumSquareType(5, 5)).toBe('NORMAL');
    expect(getPremiumSquareType(8, 8)).toBe('NORMAL');
  });
});
