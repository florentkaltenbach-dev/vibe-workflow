import { GameState, Placement, SubmitWordResult, GameEndResult, Tile } from '../types';
import { initializeBoard } from './board';
import { initializeTileBag, drawTiles } from './tile-bag';
import { validatePlacement, extractWords, validateWords } from './validation';
import { calculateScore } from './scoring';

export class GameEngine {
  startGame(gameState: GameState): { success: true } | { success: false; error: string } {
    if (gameState.phase !== 'lobby') {
      return { success: false, error: 'Game already started' };
    }

    if (gameState.players.length < 2) {
      return { success: false, error: 'Need at least 2 players' };
    }

    gameState.phase = 'playing';
    gameState.board = initializeBoard();
    gameState.tileBag = initializeTileBag();
    gameState.consecutivePasses = 0;
    gameState.turnHistory = [];

    // Shuffle players
    for (let i = gameState.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameState.players[i], gameState.players[j]] = [gameState.players[j], gameState.players[i]];
    }

    // Deal tiles
    for (const player of gameState.players) {
      player.tiles = drawTiles(gameState.tileBag, 7);
      player.score = 0;
    }

    gameState.currentPlayerIndex = 0;

    return { success: true };
  }

  submitWord(
    gameState: GameState,
    playerId: string,
    placements: Placement[],
    dictionary: Set<string>
  ): SubmitWordResult | { success: false; error: string; invalidWords?: string[] } {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate player has tiles
    for (const placement of placements) {
      const hasTile = currentPlayer.tiles.some(
        (t) => t.letter === placement.tile.letter && t.isBlank === placement.tile.isBlank
      );
      if (!hasTile) {
        return { success: false, error: "You don't have that tile" };
      }
    }

    // Validate placement
    const isFirstMove = gameState.board.every((row) => row.every((sq) => sq === null));
    const placementValidation = validatePlacement(placements, gameState.board, isFirstMove);
    if (!placementValidation.valid) {
      return { success: false, error: placementValidation.error };
    }

    // Extract and validate words
    const words = extractWords(placements, gameState.board);
    const wordValidation = validateWords(words, dictionary);
    if (!wordValidation.valid) {
      return {
        success: false,
        error: wordValidation.error,
        invalidWords: wordValidation.invalidWords,
      };
    }

    // Calculate score
    const score = calculateScore(placements, gameState.board);

    // Apply changes
    for (const placement of placements) {
      gameState.board[placement.row][placement.col] = placement.tile;
      const tileIndex = currentPlayer.tiles.findIndex(
        (t) => t.letter === placement.tile.letter && t.isBlank === placement.tile.isBlank
      );
      currentPlayer.tiles.splice(tileIndex, 1);
    }

    currentPlayer.score += score;

    // Draw new tiles
    const newTiles = drawTiles(gameState.tileBag, 7 - currentPlayer.tiles.length);
    currentPlayer.tiles.push(...newTiles);

    // Record play
    gameState.turnHistory.push({
      playerId,
      words,
      score,
      placements,
      timestamp: new Date(),
    });

    // Reset passes
    gameState.consecutivePasses = 0;

    // Check game end
    if (currentPlayer.tiles.length === 0 && gameState.tileBag.length === 0) {
      const endResult = this.endGame(gameState, 'allTilesPlayed');
      return {
        success: true,
        score,
        words,
        newTiles,
        gameEnded: true,
        endReason: endResult.reason,
      };
    }

    // Advance turn
    this.advanceTurn(gameState);

    return { success: true, score, words, newTiles };
  }

  passTurn(
    gameState: GameState,
    playerId: string
  ): { success: true; gameEnded?: boolean } | { success: false; error: string } {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    gameState.consecutivePasses++;

    if (gameState.consecutivePasses >= 6) {
      this.endGame(gameState, 'consecutivePasses');
      return { success: true, gameEnded: true };
    }

    this.advanceTurn(gameState);
    return { success: true };
  }

  exchangeTiles(
    gameState: GameState,
    playerId: string,
    tileIndices: number[]
  ): { success: true; newTiles: Tile[] } | { success: false; error: string } {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (currentPlayer.id !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    if (gameState.tileBag.length < 7) {
      return { success: false, error: 'Not enough tiles in bag to exchange' };
    }

    // Remove tiles from player
    const tilesToExchange: Tile[] = [];
    for (const index of tileIndices.sort((a, b) => b - a)) {
      if (index < 0 || index >= currentPlayer.tiles.length) {
        return { success: false, error: 'Invalid tile index' };
      }
      tilesToExchange.push(currentPlayer.tiles.splice(index, 1)[0]);
    }

    // Add back to bag and shuffle
    gameState.tileBag.push(...tilesToExchange);
    for (let i = gameState.tileBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameState.tileBag[i], gameState.tileBag[j]] = [gameState.tileBag[j], gameState.tileBag[i]];
    }

    // Draw new tiles
    const newTiles = drawTiles(gameState.tileBag, tilesToExchange.length);
    currentPlayer.tiles.push(...newTiles);

    gameState.consecutivePasses = 0;
    this.advanceTurn(gameState);

    return { success: true, newTiles: currentPlayer.tiles };
  }

  advanceTurn(gameState: GameState): void {
    const playerCount = gameState.players.length;
    let attempts = 0;

    do {
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % playerCount;
      attempts++;
    } while (
      !gameState.players[gameState.currentPlayerIndex].connected &&
      attempts < playerCount
    );

    // All players disconnected
    if (attempts >= playerCount) {
      this.endGame(gameState, 'allPlayersDisconnected');
    }
  }

  endGame(
    gameState: GameState,
    reason: 'allTilesPlayed' | 'consecutivePasses' | 'allPlayersDisconnected'
  ): GameEndResult {
    gameState.phase = 'ended';

    // Subtract remaining tile values
    for (const player of gameState.players) {
      const remainingPoints = player.tiles.reduce((sum, tile) => sum + tile.points, 0);
      player.score -= remainingPoints;
    }

    // Find winner
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    const finalScores = sortedPlayers.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      score: player.score,
      remainingTilePoints: player.tiles.reduce((sum, tile) => sum + tile.points, 0),
    }));

    return {
      reason,
      finalScores,
      winner: {
        playerId: winner.id,
        playerName: winner.name,
        score: winner.score,
      },
    };
  }
}
