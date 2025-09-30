// Shared type definitions

export interface Tile {
  letter: string;  // 'A'-'Z' or '_' for blank
  points: number;  // 0-10
  isBlank: boolean;
}

export interface Placement {
  row: number;     // 0-14
  col: number;     // 0-14
  tile: Tile;
}

export type BoardSquare = Tile | null;
export type Board = BoardSquare[][];

export interface Player {
  id: string;
  name: string;
  tiles: Tile[];
  score: number;
  connected: boolean;
  isHost: boolean;
}

export type GamePhase = 'lobby' | 'playing' | 'ended';

export interface GameState {
  phase: GamePhase;
  board: Board;
  players: Player[];
  currentPlayerIndex: number;
  tileBag: Tile[];
  consecutivePasses: number;
  turnHistory: Play[];
}

export interface Play {
  playerId: string;
  words: string[];
  score: number;
  placements: Placement[];
  timestamp: Date;
}

export type PremiumSquareType =
  | 'TRIPLE_WORD'
  | 'DOUBLE_WORD'
  | 'TRIPLE_LETTER'
  | 'DOUBLE_LETTER'
  | 'NORMAL';

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string; invalidWords?: string[] };

export interface SubmitWordResult {
  success: true;
  score: number;
  words: string[];
  newTiles: Tile[];
  gameEnded?: boolean;
  endReason?: string;
}

export interface GameEndResult {
  reason: 'allTilesPlayed' | 'consecutivePasses' | 'allPlayersDisconnected';
  finalScores: Array<{
    playerId: string;
    playerName: string;
    score: number;
    remainingTilePoints: number;
  }>;
  winner: {
    playerId: string;
    playerName: string;
    score: number;
  };
}
