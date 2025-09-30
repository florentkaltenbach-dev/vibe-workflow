import { Board, BoardSquare, PremiumSquareType } from '../types';

export function initializeBoard(): Board {
  const board: Board = [];
  for (let i = 0; i < 15; i++) {
    board[i] = new Array(15).fill(null);
  }
  return board;
}

export function getPremiumSquareType(row: number, col: number): PremiumSquareType {
  // Triple Word Score
  const tripleWord = [
    [0, 0], [0, 7], [0, 14],
    [7, 0], [7, 14],
    [14, 0], [14, 7], [14, 14],
  ];
  if (tripleWord.some(([r, c]) => r === row && c === col)) {
    return 'TRIPLE_WORD';
  }

  // Double Word Score (including center)
  const doubleWord = [
    [1, 1], [2, 2], [3, 3], [4, 4],
    [1, 13], [2, 12], [3, 11], [4, 10],
    [13, 1], [12, 2], [11, 3], [10, 4],
    [13, 13], [12, 12], [11, 11], [10, 10],
    [7, 7], // Center
  ];
  if (doubleWord.some(([r, c]) => r === row && c === col)) {
    return 'DOUBLE_WORD';
  }

  // Triple Letter Score
  const tripleLetter = [
    [1, 5], [1, 9],
    [5, 1], [5, 5], [5, 9], [5, 13],
    [9, 1], [9, 5], [9, 9], [9, 13],
    [13, 5], [13, 9],
  ];
  if (tripleLetter.some(([r, c]) => r === row && c === col)) {
    return 'TRIPLE_LETTER';
  }

  // Double Letter Score
  const doubleLetter = [
    [0, 3], [0, 11],
    [2, 6], [2, 8],
    [3, 0], [3, 7], [3, 14],
    [6, 2], [6, 6], [6, 8], [6, 12],
    [7, 3], [7, 11],
    [8, 2], [8, 6], [8, 8], [8, 12],
    [11, 0], [11, 7], [11, 14],
    [12, 6], [12, 8],
    [14, 3], [14, 11],
  ];
  if (doubleLetter.some(([r, c]) => r === row && c === col)) {
    return 'DOUBLE_LETTER';
  }

  return 'NORMAL';
}
