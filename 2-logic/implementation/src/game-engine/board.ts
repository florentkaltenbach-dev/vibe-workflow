import { Board, BoardSquare, PremiumSquareType } from '../types';
import {
  BOARD_SIZE,
  TRIPLE_WORD_POSITIONS,
  DOUBLE_WORD_POSITIONS,
  TRIPLE_LETTER_POSITIONS,
  DOUBLE_LETTER_POSITIONS,
} from './board-config';

export function initializeBoard(): Board {
  const board: Board = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    board[i] = new Array(BOARD_SIZE).fill(null);
  }
  return board;
}

export function getPremiumSquareType(row: number, col: number): PremiumSquareType {
  const key = `${row},${col}`;

  if (TRIPLE_WORD_POSITIONS.has(key)) {
    return 'TRIPLE_WORD';
  }

  if (DOUBLE_WORD_POSITIONS.has(key)) {
    return 'DOUBLE_WORD';
  }

  if (TRIPLE_LETTER_POSITIONS.has(key)) {
    return 'TRIPLE_LETTER';
  }

  if (DOUBLE_LETTER_POSITIONS.has(key)) {
    return 'DOUBLE_LETTER';
  }

  return 'NORMAL';
}
