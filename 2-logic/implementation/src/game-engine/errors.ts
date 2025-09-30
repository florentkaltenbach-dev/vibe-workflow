/**
 * Standardized Game Error Handling
 *
 * Provides consistent error handling across the game engine and server.
 * All game-related errors should use these error codes for consistency.
 */

/**
 * Standard error codes for game operations
 */
export enum GameErrorCode {
  // Lobby errors
  NAME_TOO_SHORT = 'NAME_TOO_SHORT',
  NAME_TOO_LONG = 'NAME_TOO_LONG',
  NAME_TAKEN = 'NAME_TAKEN',
  GAME_FULL = 'GAME_FULL',
  GAME_ALREADY_STARTED = 'GAME_ALREADY_STARTED',
  NOT_HOST = 'NOT_HOST',
  NOT_ENOUGH_PLAYERS = 'NOT_ENOUGH_PLAYERS',

  // Turn errors
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  GAME_NOT_STARTED = 'GAME_NOT_STARTED',

  // Tile errors
  MISSING_TILE = 'MISSING_TILE',
  INVALID_TILE_INDEX = 'INVALID_TILE_INDEX',
  INSUFFICIENT_TILES_IN_BAG = 'INSUFFICIENT_TILES_IN_BAG',

  // Placement errors
  INVALID_PLACEMENT = 'INVALID_PLACEMENT',
  INVALID_WORD = 'INVALID_WORD',

  // General errors
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
  MUST_JOIN_FIRST = 'MUST_JOIN_FIRST',
}

/**
 * Standard error messages mapped to error codes
 */
export const ERROR_MESSAGES: Record<GameErrorCode, string> = {
  [GameErrorCode.NAME_TOO_SHORT]: 'Name must be at least 3 characters',
  [GameErrorCode.NAME_TOO_LONG]: 'Name must be at most 20 characters',
  [GameErrorCode.NAME_TAKEN]: 'Name already taken',
  [GameErrorCode.GAME_FULL]: 'Game is full',
  [GameErrorCode.GAME_ALREADY_STARTED]: 'Game already in progress',
  [GameErrorCode.NOT_HOST]: 'Only host can start the game',
  [GameErrorCode.NOT_ENOUGH_PLAYERS]: 'Need at least 2 players',
  [GameErrorCode.NOT_YOUR_TURN]: 'Not your turn',
  [GameErrorCode.GAME_NOT_STARTED]: 'Game not in progress',
  [GameErrorCode.MISSING_TILE]: "You don't have that tile",
  [GameErrorCode.INVALID_TILE_INDEX]: 'Invalid tile index',
  [GameErrorCode.INSUFFICIENT_TILES_IN_BAG]: 'Not enough tiles in bag to exchange',
  [GameErrorCode.INVALID_PLACEMENT]: 'Invalid placement',
  [GameErrorCode.INVALID_WORD]: 'Invalid word',
  [GameErrorCode.PLAYER_NOT_FOUND]: 'Player not found',
  [GameErrorCode.MUST_JOIN_FIRST]: 'You must join first',
};

/**
 * Validation constants
 */
export const PLAYER_NAME_MIN_LENGTH = 3;
export const PLAYER_NAME_MAX_LENGTH = 20;
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;

/**
 * Standardized game error class
 */
export class GameError extends Error {
  constructor(
    public readonly code: GameErrorCode,
    message?: string,
    public readonly details?: any
  ) {
    super(message || ERROR_MESSAGES[code]);
    this.name = 'GameError';
  }
}

/**
 * Helper to create error result objects
 */
export function createErrorResult(
  code: GameErrorCode,
  details?: any
): { success: false; error: string; code: GameErrorCode; details?: any } {
  return {
    success: false,
    error: ERROR_MESSAGES[code],
    code,
    details,
  };
}

/**
 * Helper to validate player name
 */
export function validatePlayerName(name: string): { valid: true } | { valid: false; code: GameErrorCode } {
  if (name.length < PLAYER_NAME_MIN_LENGTH) {
    return { valid: false, code: GameErrorCode.NAME_TOO_SHORT };
  }
  if (name.length > PLAYER_NAME_MAX_LENGTH) {
    return { valid: false, code: GameErrorCode.NAME_TOO_LONG };
  }
  return { valid: true };
}
