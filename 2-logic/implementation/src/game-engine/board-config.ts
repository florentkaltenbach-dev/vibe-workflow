/**
 * Board Configuration Constants
 *
 * Premium square positions for a standard 15x15 Scrabble-like board.
 * Using Sets for O(1) lookup performance.
 */

// Helper to create coordinate keys for Set lookups
const coord = (row: number, col: number): string => `${row},${col}`;

/**
 * Triple Word Score positions
 * Located at corners and edges of the board
 */
export const TRIPLE_WORD_POSITIONS = new Set([
  coord(0, 0), coord(0, 7), coord(0, 14),
  coord(7, 0), coord(7, 14),
  coord(14, 0), coord(14, 7), coord(14, 14),
]);

/**
 * Double Word Score positions
 * Located on diagonals and center square
 */
export const DOUBLE_WORD_POSITIONS = new Set([
  coord(1, 1), coord(2, 2), coord(3, 3), coord(4, 4),
  coord(1, 13), coord(2, 12), coord(3, 11), coord(4, 10),
  coord(13, 1), coord(12, 2), coord(11, 3), coord(10, 4),
  coord(13, 13), coord(12, 12), coord(11, 11), coord(10, 10),
  coord(7, 7), // Center
]);

/**
 * Triple Letter Score positions
 * Located at specific symmetric positions
 */
export const TRIPLE_LETTER_POSITIONS = new Set([
  coord(1, 5), coord(1, 9),
  coord(5, 1), coord(5, 5), coord(5, 9), coord(5, 13),
  coord(9, 1), coord(9, 5), coord(9, 9), coord(9, 13),
  coord(13, 5), coord(13, 9),
]);

/**
 * Double Letter Score positions
 * Located throughout the board
 */
export const DOUBLE_LETTER_POSITIONS = new Set([
  coord(0, 3), coord(0, 11),
  coord(2, 6), coord(2, 8),
  coord(3, 0), coord(3, 7), coord(3, 14),
  coord(6, 2), coord(6, 6), coord(6, 8), coord(6, 12),
  coord(7, 3), coord(7, 11),
  coord(8, 2), coord(8, 6), coord(8, 8), coord(8, 12),
  coord(11, 0), coord(11, 7), coord(11, 14),
  coord(12, 6), coord(12, 8),
  coord(14, 3), coord(14, 11),
]);

/**
 * Board dimensions
 */
export const BOARD_SIZE = 15;
export const BOARD_MIN_INDEX = 0;
export const BOARD_MAX_INDEX = 14;
