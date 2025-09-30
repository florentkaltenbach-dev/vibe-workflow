import { Board, Placement, ValidationResult } from '../types';
// Security: Import tile letter validation
// Addresses DEBT-001: Prevents malicious tile letters (XSS via tiles)
// Threat Model: T1.3 - Malicious Tile Letters
import { validateTileLetter } from '../security/input-sanitization';

export function validatePlacement(
  placements: Placement[],
  board: Board,
  isFirstMove: boolean
): ValidationResult {
  if (placements.length === 0) {
    return { valid: false, error: 'No tiles placed' };
  }

  // Check all positions valid
  for (const placement of placements) {
    if (placement.row < 0 || placement.row > 14) {
      return { valid: false, error: 'Invalid row' };
    }
    if (placement.col < 0 || placement.col > 14) {
      return { valid: false, error: 'Invalid column' };
    }
    if (board[placement.row][placement.col] !== null) {
      return { valid: false, error: 'Square already occupied' };
    }

    // Security: Validate tile letter to prevent XSS
    // Addresses DEBT-001, Threat Model: T1.3
    // Prevents injection like {letter: '<script>alert(1)</script>'}
    const letterValidation = validateTileLetter(placement.tile.letter);
    if (!letterValidation.valid) {
      return { valid: false, error: `Invalid tile letter: ${letterValidation.error}` };
    }
  }

  // Check tiles form a line
  const allSameRow = placements.every((p) => p.row === placements[0].row);
  const allSameCol = placements.every((p) => p.col === placements[0].col);

  if (!allSameRow && !allSameCol) {
    return { valid: false, error: 'Tiles must form a single line' };
  }

  // Check no gaps
  if (allSameRow) {
    const row = placements[0].row;
    const cols = placements.map((p) => p.col).sort((a, b) => a - b);
    for (let i = 0; i < cols.length - 1; i++) {
      for (let col = cols[i] + 1; col < cols[i + 1]; col++) {
        if (board[row][col] === null) {
          return { valid: false, error: 'Gap in word' };
        }
      }
    }
  } else {
    const col = placements[0].col;
    const rows = placements.map((p) => p.row).sort((a, b) => a - b);
    for (let i = 0; i < rows.length - 1; i++) {
      for (let row = rows[i] + 1; row < rows[i + 1]; row++) {
        if (board[row][col] === null) {
          return { valid: false, error: 'Gap in word' };
        }
      }
    }
  }

  // Check first move touches center
  if (isFirstMove) {
    const centerTouched = placements.some((p) => p.row === 7 && p.col === 7);
    if (!centerTouched) {
      return { valid: false, error: 'First word must touch center' };
    }
  }

  // Check subsequent moves connect to existing tiles
  if (!isFirstMove) {
    let connected = false;
    for (const placement of placements) {
      const { row, col } = placement;
      // Check adjacent squares
      if (
        (row > 0 && board[row - 1][col] !== null) ||
        (row < 14 && board[row + 1][col] !== null) ||
        (col > 0 && board[row][col - 1] !== null) ||
        (col < 14 && board[row][col + 1] !== null)
      ) {
        connected = true;
        break;
      }
    }
    if (!connected) {
      return { valid: false, error: 'Word must connect to existing tiles' };
    }
  }

  return { valid: true };
}

export function extractWords(placements: Placement[], board: Board): string[] {
  // Create board copy with new placements
  const boardCopy: Board = board.map((row) => [...row]);
  for (const placement of placements) {
    boardCopy[placement.row][placement.col] = placement.tile;
  }

  const words: string[] = [];
  const allSameRow = placements.every((p) => p.row === placements[0].row);

  // Get main word
  if (allSameRow) {
    const mainWord = extractHorizontalWord(placements[0].row, placements, boardCopy);
    words.push(mainWord);
  } else {
    const mainWord = extractVerticalWord(placements[0].col, placements, boardCopy);
    words.push(mainWord);
  }

  // Get cross words
  for (const placement of placements) {
    if (allSameRow) {
      const crossWord = extractVerticalWord(placement.col, [placement], boardCopy);
      if (crossWord.length > 1) {
        words.push(crossWord);
      }
    } else {
      const crossWord = extractHorizontalWord(placement.row, [placement], boardCopy);
      if (crossWord.length > 1) {
        words.push(crossWord);
      }
    }
  }

  return words;
}

function extractHorizontalWord(row: number, placements: Placement[], board: Board): string {
  let col = Math.min(...placements.map((p) => p.col));
  while (col > 0 && board[row][col - 1] !== null) {
    col--;
  }

  let word = '';
  while (col <= 14 && board[row][col] !== null) {
    word += board[row][col]!.letter;
    col++;
  }

  return word;
}

function extractVerticalWord(col: number, placements: Placement[], board: Board): string {
  let row = Math.min(...placements.map((p) => p.row));
  while (row > 0 && board[row - 1][col] !== null) {
    row--;
  }

  let word = '';
  while (row <= 14 && board[row][col] !== null) {
    word += board[row][col]!.letter;
    row++;
  }

  return word;
}

export function validateWords(words: string[], dictionary: Set<string>): ValidationResult {
  const invalidWords: string[] = [];

  for (const word of words) {
    if (!dictionary.has(word.toUpperCase())) {
      invalidWords.push(word);
    }
  }

  if (invalidWords.length > 0) {
    return { valid: false, error: 'Invalid word(s)', invalidWords };
  }

  return { valid: true };
}
