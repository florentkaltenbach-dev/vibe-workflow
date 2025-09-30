import { GameEngine } from './game-engine';
import { GameState } from '../types';
import { initializeBoard } from './board';

describe('GameEngine.startGame', () => {
  it('should initialize game state correctly', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'lobby',
      board: [],
      players: [
        { id: '1', name: 'Alice', tiles: [], score: 0, connected: true, isHost: true },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const result = gameEngine.startGame(gameState);

    expect(result.success).toBe(true);
    expect(gameState.phase).toBe('playing');
    expect(gameState.board).toHaveLength(15);
    expect(gameState.tileBag.length).toBeLessThanOrEqual(86); // 100 - (2 players × 7 tiles)
    expect(gameState.players[0].tiles).toHaveLength(7);
    expect(gameState.players[1].tiles).toHaveLength(7);
  });

  it('should reject start with fewer than 2 players', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'lobby',
      board: [],
      players: [{ id: '1', name: 'Alice', tiles: [], score: 0, connected: true, isHost: true }],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const result = gameEngine.startGame(gameState);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Need at least 2 players');
    }
  });

  it('should reject if game already started', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        { id: '1', name: 'Alice', tiles: [], score: 0, connected: true, isHost: true },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const result = gameEngine.startGame(gameState);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Game already started');
    }
  });

  it('should shuffle players randomly', () => {
    const gameEngine = new GameEngine();
    const players1 = [
      { id: '1', name: 'Alice', tiles: [], score: 0, connected: true, isHost: true },
      { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      { id: '3', name: 'Charlie', tiles: [], score: 0, connected: true, isHost: false },
      { id: '4', name: 'Dave', tiles: [], score: 0, connected: true, isHost: false },
    ];

    const gameState: GameState = {
      phase: 'lobby',
      board: [],
      players: players1,
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const originalOrder = players1.map((p) => p.id).join(',');
    gameEngine.startGame(gameState);
    const newOrder = gameState.players.map((p) => p.id).join(',');

    // Very unlikely to have same order after shuffle with 4 players
    // (though this test could theoretically fail randomly)
    expect(newOrder).not.toBe(originalOrder);
  });
});

describe('GameEngine.submitWord', () => {
  it('should accept and score valid word', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [
            { letter: 'C', points: 3, isBlank: false },
            { letter: 'A', points: 1, isBlank: false },
            { letter: 'T', points: 1, isBlank: false },
          ],
          score: 0,
          connected: true,
          isHost: true,
        },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const placements = [
      { row: 7, col: 7, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 7, col: 8, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 7, col: 9, tile: { letter: 'T', points: 1, isBlank: false } },
    ];

    const dictionary = new Set(['CAT']);

    const result = gameEngine.submitWord(gameState, '1', placements, dictionary);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.score).toBeGreaterThan(0);
      expect(result.words).toContain('CAT');
    }
  });

  it('should reject when not player turn', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [{ letter: 'C', points: 3, isBlank: false }],
          score: 0,
          connected: true,
          isHost: true,
        },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const placements = [{ row: 7, col: 7, tile: { letter: 'C', points: 3, isBlank: false } }];
    const dictionary = new Set(['C']);

    const result = gameEngine.submitWord(gameState, '2', placements, dictionary);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not your turn');
    }
  });

  it('should reject when player does not have tile', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [{ letter: 'A', points: 1, isBlank: false }],
          score: 0,
          connected: true,
          isHost: true,
        },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const placements = [{ row: 7, col: 7, tile: { letter: 'Z', points: 10, isBlank: false } }];
    const dictionary = new Set(['Z']);

    const result = gameEngine.submitWord(gameState, '1', placements, dictionary);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("You don't have that tile");
    }
  });

  it('should reject invalid words', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [
            { letter: 'X', points: 8, isBlank: false },
            { letter: 'Y', points: 4, isBlank: false },
            { letter: 'Z', points: 10, isBlank: false },
          ],
          score: 0,
          connected: true,
          isHost: true,
        },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const placements = [
      { row: 7, col: 7, tile: { letter: 'X', points: 8, isBlank: false } },
      { row: 7, col: 8, tile: { letter: 'Y', points: 4, isBlank: false } },
      { row: 7, col: 9, tile: { letter: 'Z', points: 10, isBlank: false } },
    ];

    const dictionary = new Set(['CAT', 'DOG']); // Does not contain XYZ

    const result = gameEngine.submitWord(gameState, '1', placements, dictionary);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid word(s)');
      expect(result.invalidWords).toContain('XYZ');
    }
  });

  it('should draw new tiles after valid play', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [
            { letter: 'C', points: 3, isBlank: false },
            { letter: 'A', points: 1, isBlank: false },
            { letter: 'T', points: 1, isBlank: false },
          ],
          score: 0,
          connected: true,
          isHost: true,
        },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [
        { letter: 'E', points: 1, isBlank: false },
        { letter: 'F', points: 4, isBlank: false },
        { letter: 'G', points: 2, isBlank: false },
      ],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const placements = [
      { row: 7, col: 7, tile: { letter: 'C', points: 3, isBlank: false } },
      { row: 7, col: 8, tile: { letter: 'A', points: 1, isBlank: false } },
      { row: 7, col: 9, tile: { letter: 'T', points: 1, isBlank: false } },
    ];

    const dictionary = new Set(['CAT']);

    const result = gameEngine.submitWord(gameState, '1', placements, dictionary);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newTiles.length).toBe(3);
      expect(gameState.players[0].tiles.length).toBe(3); // Drew 3 tiles
    }
  });

  it('should advance turn after valid play', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [{ letter: 'C', points: 3, isBlank: false }],
          score: 0,
          connected: true,
          isHost: true,
        },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const placements = [{ row: 7, col: 7, tile: { letter: 'C', points: 3, isBlank: false } }];
    const dictionary = new Set(['C']);

    gameEngine.submitWord(gameState, '1', placements, dictionary);

    expect(gameState.currentPlayerIndex).toBe(1);
  });

  it('should reset consecutive passes after valid play', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [{ letter: 'C', points: 3, isBlank: false }],
          score: 0,
          connected: true,
          isHost: true,
        },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 3,
      turnHistory: [],
    };

    const placements = [{ row: 7, col: 7, tile: { letter: 'C', points: 3, isBlank: false } }];
    const dictionary = new Set(['C']);

    gameEngine.submitWord(gameState, '1', placements, dictionary);

    expect(gameState.consecutivePasses).toBe(0);
  });
});

describe('GameEngine.passTurn', () => {
  it('should allow current player to pass', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        { id: '1', name: 'Alice', tiles: [], score: 0, connected: true, isHost: true },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const result = gameEngine.passTurn(gameState, '1');

    expect(result.success).toBe(true);
    expect(gameState.consecutivePasses).toBe(1);
    expect(gameState.currentPlayerIndex).toBe(1);
  });

  it('should end game after 6 consecutive passes', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        { id: '1', name: 'Alice', tiles: [], score: 0, connected: true, isHost: true },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 5,
      turnHistory: [],
    };

    const result = gameEngine.passTurn(gameState, '1');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.gameEnded).toBe(true);
      expect(gameState.phase).toBe('ended');
    }
  });

  it('should reject pass when not player turn', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        { id: '1', name: 'Alice', tiles: [], score: 0, connected: true, isHost: true },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const result = gameEngine.passTurn(gameState, '2');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not your turn');
    }
  });
});

describe('GameEngine.exchangeTiles', () => {
  it('should allow tile exchange', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [
            { letter: 'A', points: 1, isBlank: false },
            { letter: 'B', points: 3, isBlank: false },
          ],
          score: 0,
          connected: true,
          isHost: true,
        },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: Array(10).fill({ letter: 'Z', points: 10, isBlank: false }),
      consecutivePasses: 0,
      turnHistory: [],
    };

    const result = gameEngine.exchangeTiles(gameState, '1', [0]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(gameState.players[0].tiles.length).toBe(2);
      expect(gameState.currentPlayerIndex).toBe(1); // Turn advanced
    }
  });

  it('should reject exchange when bag has fewer than 7 tiles', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [{ letter: 'A', points: 1, isBlank: false }],
          score: 0,
          connected: true,
          isHost: true,
        },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: Array(6).fill({ letter: 'Z', points: 10, isBlank: false }),
      consecutivePasses: 0,
      turnHistory: [],
    };

    const result = gameEngine.exchangeTiles(gameState, '1', [0]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not enough tiles in bag to exchange');
    }
  });

  it('should reject when not player turn', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [{ letter: 'A', points: 1, isBlank: false }],
          score: 0,
          connected: true,
          isHost: true,
        },
        { id: '2', name: 'Bob', tiles: [], score: 0, connected: true, isHost: false },
      ],
      currentPlayerIndex: 0,
      tileBag: Array(10).fill({ letter: 'Z', points: 10, isBlank: false }),
      consecutivePasses: 0,
      turnHistory: [],
    };

    const result = gameEngine.exchangeTiles(gameState, '2', [0]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not your turn');
    }
  });
});

describe('GameEngine.endGame', () => {
  it('should calculate final scores with remaining tile penalties', () => {
    const gameEngine = new GameEngine();
    const gameState: GameState = {
      phase: 'playing',
      board: initializeBoard(),
      players: [
        {
          id: '1',
          name: 'Alice',
          tiles: [{ letter: 'A', points: 1, isBlank: false }],
          score: 100,
          connected: true,
          isHost: true,
        },
        {
          id: '2',
          name: 'Bob',
          tiles: [
            { letter: 'Q', points: 10, isBlank: false },
            { letter: 'Z', points: 10, isBlank: false },
          ],
          score: 90,
          connected: true,
          isHost: false,
        },
      ],
      currentPlayerIndex: 0,
      tileBag: [],
      consecutivePasses: 0,
      turnHistory: [],
    };

    const result = gameEngine.endGame(gameState, 'consecutivePasses');

    expect(result.reason).toBe('consecutivePasses');
    expect(result.finalScores[0].score).toBe(99); // 100 - 1
    expect(result.finalScores[1].score).toBe(70); // 90 - 20
    expect(result.winner.playerId).toBe('1');
    expect(gameState.phase).toBe('ended');
  });
});
