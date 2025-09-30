import { Board, Placement } from '../types';
import { getPremiumSquareType } from './board';

export function calculateScore(placements: Placement[], board: Board): number {
  // Create board copy
  const boardCopy: Board = board.map((row) => [...row]);
  for (const placement of placements) {
    boardCopy[placement.row][placement.col] = placement.tile;
  }

  let totalScore = 0;
  const allSameRow = placements.every((p) => p.row === placements[0].row);

  // Score main word
  if (allSameRow) {
    totalScore += scoreHorizontalWord(placements[0].row, placements, boardCopy);
  } else {
    totalScore += scoreVerticalWord(placements[0].col, placements, boardCopy);
  }

  // Score cross words
  for (const placement of placements) {
    if (allSameRow) {
      const crossScore = scoreVerticalWord(placement.col, [placement], boardCopy);
      totalScore += crossScore;
    } else {
      const crossScore = scoreHorizontalWord(placement.row, [placement], boardCopy);
      totalScore += crossScore;
    }
  }

  // Bingo bonus (all 7 tiles)
  if (placements.length === 7) {
    totalScore += 50;
  }

  return totalScore;
}

function scoreHorizontalWord(row: number, newPlacements: Placement[], board: Board): number {
  let startCol = Math.min(...newPlacements.map((p) => p.col));
  while (startCol > 0 && board[row][startCol - 1] !== null) {
    startCol--;
  }

  let endCol = Math.max(...newPlacements.map((p) => p.col));
  while (endCol < 14 && board[row][endCol + 1] !== null) {
    endCol++;
  }

  // Single tile = not a word
  if (startCol === endCol) {
    return 0;
  }

  const newPlacementCols = new Set(newPlacements.map((p) => p.col));

  let wordScore = 0;
  let wordMultiplier = 1;

  for (let col = startCol; col <= endCol; col++) {
    const tile = board[row][col]!;
    let tileScore = tile.points;

    if (newPlacementCols.has(col)) {
      const premiumType = getPremiumSquareType(row, col);
      if (premiumType === 'DOUBLE_LETTER') {
        tileScore *= 2;
      } else if (premiumType === 'TRIPLE_LETTER') {
        tileScore *= 3;
      } else if (premiumType === 'DOUBLE_WORD') {
        wordMultiplier *= 2;
      } else if (premiumType === 'TRIPLE_WORD') {
        wordMultiplier *= 3;
      }
    }

    wordScore += tileScore;
  }

  return wordScore * wordMultiplier;
}

function scoreVerticalWord(col: number, newPlacements: Placement[], board: Board): number {
  let startRow = Math.min(...newPlacements.map((p) => p.row));
  while (startRow > 0 && board[startRow - 1][col] !== null) {
    startRow--;
  }

  let endRow = Math.max(...newPlacements.map((p) => p.row));
  while (endRow < 14 && board[endRow + 1][col] !== null) {
    endRow++;
  }

  // Single tile = not a word
  if (startRow === endRow) {
    return 0;
  }

  const newPlacementRows = new Set(newPlacements.map((p) => p.row));

  let wordScore = 0;
  let wordMultiplier = 1;

  for (let row = startRow; row <= endRow; row++) {
    const tile = board[row][col]!;
    let tileScore = tile.points;

    if (newPlacementRows.has(row)) {
      const premiumType = getPremiumSquareType(row, col);
      if (premiumType === 'DOUBLE_LETTER') {
        tileScore *= 2;
      } else if (premiumType === 'TRIPLE_LETTER') {
        tileScore *= 3;
      } else if (premiumType === 'DOUBLE_WORD') {
        wordMultiplier *= 2;
      } else if (premiumType === 'TRIPLE_WORD') {
        wordMultiplier *= 3;
      }
    }

    wordScore += tileScore;
  }

  return wordScore * wordMultiplier;
}
