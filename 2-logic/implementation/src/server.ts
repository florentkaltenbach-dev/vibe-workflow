import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as path from 'path';
import { GameState, Player, Placement } from './types';
import { GameEngine } from './game-engine/game-engine';
import { Dictionary } from './dictionary';
// Security: Import input sanitization and rate limiting modules
// Addresses DEBT-001 (Input Sanitization) and DEBT-002 (Rate Limiting)
import {
  sanitizePlayerName,
  validateDictionaryWord,
  validateArraySize,
  sanitizeErrorMessage,
} from './security/input-sanitization';
import {
  SocketRateLimiter,
  HttpRateLimiter,
  ConnectionLimiter,
  createHttpRateLimitMiddleware,
} from './security/rate-limiting';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

const PORT = 3000;

// Initialize game state
const gameState: GameState = {
  phase: 'lobby',
  board: [],
  players: [],
  currentPlayerIndex: 0,
  tileBag: [],
  consecutivePasses: 0,
  turnHistory: [],
};

// Initialize game engine and dictionary
const gameEngine = new GameEngine();
const dictionary = new Dictionary();
dictionary.load('dictionary.txt');

// Security: Initialize rate limiters and connection limiter
// Addresses DEBT-002: No Rate Limiting (DoS vulnerability)
// Threat Model: T3.1 (Spam connections), T3.2 (Message flooding)
const socketRateLimiter = new SocketRateLimiter();
const httpRateLimiter = new HttpRateLimiter();
const connectionLimiter = new ConnectionLimiter();

// Security: Apply HTTP rate limiting to all API endpoints
// Addresses DEBT-002: Prevents DoS via HTTP request flooding
app.use('/api', createHttpRateLimitMiddleware(httpRateLimiter));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    gameActive: gameState.phase === 'playing',
    playerCount: gameState.players.length,
    maxPlayers: 4,
    serverVersion: '1.0.0',
  });
});

app.get('/api/dictionary/check/:word', (req, res) => {
  // Security: Validate and sanitize word parameter
  // Addresses DEBT-001: Prevents path traversal and injection attacks
  // Threat Model: T1.2 - Injection in Dictionary Check Endpoint
  const sanitizationResult = validateDictionaryWord(req.params.word);

  if (!sanitizationResult.valid) {
    res.status(400).json({
      error: 'Invalid word format',
      message: sanitizationResult.error,
      code: 'INVALID_INPUT',
    });
    return;
  }

  const word = sanitizationResult.sanitized!;
  const valid = dictionary.has(word);
  res.json({ word, valid });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  // Security: Get client identifier for connection limiting
  // In production, consider X-Forwarded-For if behind proxy
  const clientIP = socket.handshake.address || 'unknown';

  // Security: Check connection limits to prevent DoS
  // Addresses DEBT-002: Rate Limiting
  // Threat Model: T3.1 - Spam Connection Attempts
  if (!connectionLimiter.allowConnection(clientIP)) {
    console.warn(`Connection limit exceeded for ${clientIP}`);
    socket.emit('error', {
      message: 'Too many connections from your address',
      code: 'CONNECTION_LIMIT_EXCEEDED',
    });
    socket.disconnect(true);
    return;
  }

  connectionLimiter.addConnection(clientIP);
  console.log(`New connection: ${socket.id} from ${clientIP}`);

  // Send lobby state if in lobby
  if (gameState.phase === 'lobby') {
    emitLobbyUpdate();
  }

  socket.on('joinGame', (data: { playerName: string }) => {
    // Security: Rate limiting for joinGame events
    // Addresses DEBT-002: Prevents spam join attempts
    // Threat Model: T3.2 - Message Flooding
    if (!socketRateLimiter.checkLimit(socket.id, 'joinGame')) {
      const action = socketRateLimiter.getAction('joinGame');
      console.warn(`Rate limit exceeded for ${socket.id} on joinGame`);

      socket.emit('error', {
        message: 'Too many join attempts. Please wait.',
        code: 'RATE_LIMIT_EXCEEDED',
      });

      if (action === 'disconnect') {
        socket.disconnect(true);
      }
      return;
    }

    // Security: Sanitize and validate player name
    // Addresses DEBT-001: Prevents XSS attacks
    // Threat Model: T1.1 - XSS in Player Names
    const sanitizationResult = sanitizePlayerName(data.playerName);

    if (!sanitizationResult.valid) {
      socket.emit('error', {
        message: sanitizationResult.error,
        code: 'INVALID_NAME',
      });
      return;
    }

    const playerName = sanitizationResult.sanitized!;

    // Check name not taken
    if (gameState.players.some((p) => p.name === playerName)) {
      socket.emit('error', { message: 'Name already taken', code: 'NAME_TAKEN' });
      return;
    }

    // Check game not full
    if (gameState.players.length >= 4) {
      socket.emit('error', { message: 'Game is full', code: 'GAME_FULL' });
      return;
    }

    // Check game not started
    if (gameState.phase !== 'lobby') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    // Add player
    const player: Player = {
      id: socket.id,
      name: playerName,
      tiles: [],
      score: 0,
      connected: true,
      isHost: gameState.players.length === 0,
    };
    gameState.players.push(player);

    console.log(`${playerName} joined the game`);

    emitLobbyUpdate();
    io.emit('playerJoined', { playerName });
  });

  socket.on('startGame', () => {
    // Security: Rate limiting for startGame events
    // Addresses DEBT-002: Prevents spam start attempts
    if (!socketRateLimiter.checkLimit(socket.id, 'startGame')) {
      socket.emit('error', {
        message: 'Too many start attempts. Please wait.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }

    const player = gameState.players.find((p) => p.id === socket.id);
    if (!player) {
      socket.emit('error', { message: 'You must join first' });
      return;
    }

    if (!player.isHost) {
      socket.emit('error', { message: 'Only host can start', code: 'NOT_HOST' });
      return;
    }

    if (gameState.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players', code: 'NOT_ENOUGH_PLAYERS' });
      return;
    }

    const result = gameEngine.startGame(gameState);
    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }

    console.log(`Game started with ${gameState.players.length} players`);

    // Notify all players
    io.emit('gameStarted', {
      turnOrder: gameState.players.map((p) => p.id),
      currentPlayerId: gameState.players[0].id,
      board: gameState.board,
      tileBagCount: gameState.tileBag.length,
    });

    // Send each player their tiles
    for (const p of gameState.players) {
      io.to(p.id).emit('yourTiles', { tiles: p.tiles });
    }

    emitScoreUpdate();
  });

  socket.on('submitWord', (data: { placements: Placement[] }) => {
    // Security: Rate limiting for submitWord events
    // Addresses DEBT-002: Most critical rate limit (prevents CPU exhaustion)
    // Threat Model: T3.2 - Message Flooding (most expensive operation)
    if (!socketRateLimiter.checkLimit(socket.id, 'submitWord')) {
      socket.emit('wordRejected', {
        reason: 'Too many word submissions. Please wait.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }

    const playerId = socket.id;
    const { placements } = data;

    // Security: Validate payload size to prevent DoS
    // Addresses DEBT-002: Prevents large payload attacks
    // Threat Model: T3.3 - Large Payload Attacks
    const sizeValidation = validateArraySize(placements, 7, 'placements');
    if (!sizeValidation.valid) {
      socket.emit('wordRejected', {
        reason: sizeValidation.error,
        code: 'INVALID_PAYLOAD',
      });
      return;
    }

    if (gameState.phase !== 'playing') {
      socket.emit('error', { message: 'Game not in progress', code: 'GAME_NOT_STARTED' });
      return;
    }

    const result = gameEngine.submitWord(gameState, playerId, placements, dictionary.getWordSet());

    if (!result.success) {
      socket.emit('wordRejected', {
        reason: result.error,
        invalidWords: result.invalidWords,
      });
      return;
    }

    const player = gameState.players.find((p) => p.id === playerId)!;
    console.log(`${player.name} played '${result.words[0]}' for ${result.score} points`);

    socket.emit('wordAccepted', {
      playerId,
      word: result.words[0],
      score: result.score,
      newScore: player.score,
      placements,
    });

    io.emit('boardUpdate', {
      board: gameState.board,
      lastPlay: { positions: placements.map((p) => ({ row: p.row, col: p.col })) },
    });

    io.to(playerId).emit('yourTiles', { tiles: player.tiles });

    emitScoreUpdate();

    io.emit('tileBagUpdate', { count: gameState.tileBag.length });

    if (result.gameEnded) {
      handleGameEnd(result.endReason!);
      return;
    }

    io.emit('turnChange', {
      currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
      consecutivePasses: gameState.consecutivePasses,
    });
  });

  socket.on('passTurn', () => {
    // Security: Rate limiting for passTurn events
    // Addresses DEBT-002: Prevents spam pass attempts
    if (!socketRateLimiter.checkLimit(socket.id, 'passTurn')) {
      socket.emit('error', {
        message: 'Too many pass attempts. Please wait.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }

    const playerId = socket.id;

    if (gameState.phase !== 'playing') {
      socket.emit('error', { message: 'Game not in progress' });
      return;
    }

    const result = gameEngine.passTurn(gameState, playerId);

    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }

    const player = gameState.players.find((p) => p.id === playerId)!;
    console.log(`${player.name} passed their turn`);

    if (result.gameEnded) {
      handleGameEnd('consecutivePasses');
      return;
    }

    io.emit('turnChange', {
      currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
      consecutivePasses: gameState.consecutivePasses,
    });
  });

  socket.on('exchangeTiles', (data: { tileIndices: number[] }) => {
    // Security: Rate limiting for exchangeTiles events
    // Addresses DEBT-002: Prevents spam exchange attempts
    if (!socketRateLimiter.checkLimit(socket.id, 'exchangeTiles')) {
      socket.emit('error', {
        message: 'Too many exchange attempts. Please wait.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }

    const playerId = socket.id;
    const { tileIndices } = data;

    // Security: Validate payload size
    // Max 7 tiles in rack, so max 7 indices
    const sizeValidation = validateArraySize(tileIndices, 7, 'tile indices');
    if (!sizeValidation.valid) {
      socket.emit('error', {
        message: sizeValidation.error,
        code: 'INVALID_PAYLOAD',
      });
      return;
    }

    if (gameState.phase !== 'playing') {
      socket.emit('error', { message: 'Game not in progress' });
      return;
    }

    const result = gameEngine.exchangeTiles(gameState, playerId, tileIndices);

    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }

    const player = gameState.players.find((p) => p.id === playerId)!;
    console.log(`${player.name} exchanged ${tileIndices.length} tiles`);

    io.to(playerId).emit('tilesExchanged', { newTiles: result.newTiles });
    io.to(playerId).emit('yourTiles', { tiles: player.tiles });

    io.emit('tileBagUpdate', { count: gameState.tileBag.length });

    io.emit('turnChange', {
      currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
      consecutivePasses: gameState.consecutivePasses,
    });
  });

  socket.on('disconnect', () => {
    // Security: Clean up rate limiter state for this socket
    // Prevents memory leak from accumulating rate limit buckets
    socketRateLimiter.clearSocket(socket.id);

    // Security: Decrement connection count for this IP
    connectionLimiter.removeConnection(clientIP);

    const player = gameState.players.find((p) => p.id === socket.id);

    if (!player) {
      return;
    }

    console.log(`${player.name} disconnected`);

    if (gameState.phase === 'lobby') {
      // Remove from lobby
      gameState.players = gameState.players.filter((p) => p.id !== socket.id);

      // Reassign host
      if (player.isHost && gameState.players.length > 0) {
        gameState.players[0].isHost = true;
      }

      emitLobbyUpdate();
    } else if (gameState.phase === 'playing') {
      // Mark as disconnected
      player.connected = false;

      io.emit('playerDisconnected', {
        playerId: player.id,
        playerName: player.name,
      });

      // Advance turn if it was their turn
      if (gameState.players[gameState.currentPlayerIndex].id === player.id) {
        gameEngine.advanceTurn(gameState);

        if (gameState.phase === 'ended') {
          handleGameEnd('allPlayersDisconnected');
        } else {
          io.emit('turnChange', {
            currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
            consecutivePasses: gameState.consecutivePasses,
          });
        }
      }
    }
  });
});

// Helper functions
function emitLobbyUpdate() {
  io.emit('lobbyUpdate', {
    players: gameState.players.map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      connected: p.connected,
    })),
    canStart: gameState.players.length >= 2,
  });
}

function emitScoreUpdate() {
  const scores = gameState.players
    .map((p) => ({
      playerId: p.id,
      playerName: p.name,
      score: p.score,
    }))
    .sort((a, b) => b.score - a.score);

  io.emit('scoreUpdate', { scores });
}

function handleGameEnd(reason: string) {
  console.log(`Game ended: ${reason}`);

  const endResult = gameEngine.endGame(gameState, reason as any);

  io.emit('gameEnded', endResult);
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Players can join at this URL');
});
