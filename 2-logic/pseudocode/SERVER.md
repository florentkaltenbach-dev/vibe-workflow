# Server Pseudocode

## Server Initialization

```
FUNCTION startServer():
  // Initialize Express server
  app = CREATE Express application
  server = CREATE HTTP server with app
  io = CREATE Socket.io instance with server

  // Serve static files
  app.use('/assets', EXPRESS_STATIC('public/assets'))
  app.get('/', SERVE 'public/index.html')
  app.get('/api/status', HANDLE getServerStatus)
  app.get('/api/dictionary/check/:word', HANDLE checkWord)

  // Initialize game state
  gameState = {
    phase: 'lobby',
    board: NULL,
    players: [],
    currentPlayerIndex: 0,
    tileBag: [],
    consecutivePasses: 0,
    turnHistory: []
  }

  // Load dictionary
  dictionary = LOAD_DICTIONARY('dictionary.txt')

  // Setup WebSocket handlers
  io.on('connection', HANDLE socketConnection)

  // Start listening
  PORT = 3000
  server.listen(PORT)
  PRINT "Server running on http://localhost:" + PORT
  PRINT "Players can join at this URL"

FUNCTION loadDictionary(filename):
  words = READ file line by line
  // Convert to uppercase and store in Set for O(1) lookup
  dictionary = SET of words (all uppercase)
  RETURN dictionary
```

---

## HTTP Endpoints

### Get Server Status

```
FUNCTION getServerStatus(request, response):
  status = {
    status: 'ok',
    gameActive: gameState.phase == 'playing',
    playerCount: length of gameState.players,
    maxPlayers: 4,
    serverVersion: '1.0.0'
  }
  SEND JSON response with status
```

---

### Check Word

```
FUNCTION checkWord(request, response):
  word = request.params.word
  word = word.toUpperCase()
  valid = word IN dictionary

  result = {word, valid}
  SEND JSON response with result
```

---

## WebSocket Connection Handling

```
FUNCTION socketConnection(socket):
  PRINT "New connection: " + socket.id

  // Register event handlers
  socket.on('joinGame', HANDLE joinGame with socket)
  socket.on('startGame', HANDLE startGame with socket)
  socket.on('submitWord', HANDLE submitWord with socket)
  socket.on('passTurn', HANDLE passTurn with socket)
  socket.on('exchangeTiles', HANDLE exchangeTiles with socket)
  socket.on('disconnect', HANDLE disconnect with socket)

  // Send current lobby state if in lobby
  IF gameState.phase == 'lobby':
    EMIT 'lobbyUpdate' to socket with current player list
```

---

## WebSocket Event Handlers

### Join Game

```
FUNCTION joinGame(socket, data):
  playerName = TRIM(data.playerName)

  // Validate name
  IF playerName.length < 3 OR playerName.length > 20:
    EMIT 'error' to socket with message "Name must be 3-20 characters"
    RETURN

  // Check name not taken
  FOR EACH player IN gameState.players:
    IF player.name == playerName:
      EMIT 'error' to socket with message "Name already taken", code: 'NAME_TAKEN'
      RETURN

  // Check game not full
  IF length of gameState.players >= 4:
    EMIT 'error' to socket with message "Game is full", code: 'GAME_FULL'
    RETURN

  // Check game not already started
  IF gameState.phase != 'lobby':
    EMIT 'error' to socket with message "Game already in progress"
    RETURN

  // Add player
  player = {
    id: socket.id,
    name: playerName,
    tiles: [],
    score: 0,
    connected: TRUE,
    isHost: (length of gameState.players == 0)  // First player is host
  }
  ADD player TO gameState.players

  PRINT playerName + " joined the game"

  // Send lobby update to all players
  lobbyData = {
    players: MAP gameState.players TO {id, name, isHost, connected},
    canStart: length of gameState.players >= 2
  }
  BROADCAST 'lobbyUpdate' to all clients with lobbyData

  // Notify others
  BROADCAST 'playerJoined' to all except socket with {playerName}
```

---

### Start Game

```
FUNCTION startGame(socket, data):
  // Find requesting player
  player = FIND player IN gameState.players WHERE player.id == socket.id
  IF player is NULL:
    EMIT 'error' to socket with "You must join first"
    RETURN

  // Check is host
  IF NOT player.isHost:
    EMIT 'error' to socket with "Only host can start", code: 'NOT_HOST'
    RETURN

  // Check enough players
  IF length of gameState.players < 2:
    EMIT 'error' to socket with "Need at least 2 players", code: 'NOT_ENOUGH_PLAYERS'
    RETURN

  // Start the game (use game engine logic)
  result = GAME_ENGINE.startGame(gameState)
  IF result is error:
    EMIT 'error' to socket with result.message
    RETURN

  PRINT "Game started with " + length of gameState.players + " players"

  // Notify all players
  gameStartData = {
    turnOrder: MAP gameState.players TO player.id,
    currentPlayerId: gameState.players[0].id,
    board: gameState.board,
    tileBagCount: length of gameState.tileBag
  }
  BROADCAST 'gameStarted' to all clients with gameStartData

  // Send each player their tiles privately
  FOR EACH player IN gameState.players:
    socket = GET socket by player.id
    EMIT 'yourTiles' to socket with {tiles: player.tiles}

  // Send initial scores
  sendScoreUpdate()
```

---

### Submit Word

```
FUNCTION submitWord(socket, data):
  playerId = socket.id
  placements = data.placements

  // Validate game state
  IF gameState.phase != 'playing':
    EMIT 'error' to socket with "Game not in progress", code: 'GAME_NOT_STARTED'
    RETURN

  // Use game engine to process
  result = GAME_ENGINE.submitWord(gameState, playerId, placements, dictionary)

  IF result is error:
    EMIT 'wordRejected' to socket with {
      reason: result.message,
      invalidWords: result.invalidWords
    }
    RETURN

  // Success
  player = FIND player WHERE player.id == playerId
  mainWord = result.words[0]

  PRINT player.name + " played '" + mainWord + "' for " + result.score + " points"

  // Send confirmation to player
  EMIT 'wordAccepted' to socket with {
    playerId,
    word: mainWord,
    score: result.score,
    newScore: player.score,
    placements
  }

  // Update board for all players
  boardData = {
    board: gameState.board,
    lastPlay: {positions: MAP placements TO {row, col}}
  }
  BROADCAST 'boardUpdate' to all clients with boardData

  // Send new tiles to player privately
  EMIT 'yourTiles' to socket with {tiles: player.tiles}

  // Update scores
  sendScoreUpdate()

  // Update tile bag count
  BROADCAST 'tileBagUpdate' to all with {count: length of gameState.tileBag}

  // Check if game ended
  IF result.gameEnded:
    handleGameEnd(result.endReason)
    RETURN

  // Advance turn
  turnData = {
    currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
    consecutivePasses: gameState.consecutivePasses
  }
  BROADCAST 'turnChange' to all clients with turnData
```

---

### Pass Turn

```
FUNCTION passTurn(socket, data):
  playerId = socket.id

  IF gameState.phase != 'playing':
    EMIT 'error' to socket with "Game not in progress"
    RETURN

  result = GAME_ENGINE.passTurn(gameState, playerId)

  IF result is error:
    EMIT 'error' to socket with result.message
    RETURN

  player = FIND player WHERE player.id == playerId
  PRINT player.name + " passed their turn"

  IF result.gameEnded:
    handleGameEnd('consecutivePasses')
    RETURN

  turnData = {
    currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
    consecutivePasses: gameState.consecutivePasses
  }
  BROADCAST 'turnChange' to all clients with turnData
```

---

### Exchange Tiles

```
FUNCTION exchangeTiles(socket, data):
  playerId = socket.id
  tileIndices = data.tileIndices

  IF gameState.phase != 'playing':
    EMIT 'error' to socket with "Game not in progress"
    RETURN

  result = GAME_ENGINE.exchangeTiles(gameState, playerId, tileIndices)

  IF result is error:
    EMIT 'error' to socket with result.message
    RETURN

  player = FIND player WHERE player.id == playerId
  PRINT player.name + " exchanged " + length of tileIndices + " tiles"

  // Send new tiles to player
  EMIT 'tilesExchanged' to socket with {newTiles: player.tiles}
  EMIT 'yourTiles' to socket with {tiles: player.tiles}

  // Update tile bag count
  BROADCAST 'tileBagUpdate' to all with {count: length of gameState.tileBag}

  // Advance turn
  turnData = {
    currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
    consecutivePasses: gameState.consecutivePasses
  }
  BROADCAST 'turnChange' to all clients with turnData
```

---

### Disconnect

```
FUNCTION disconnect(socket):
  player = FIND player WHERE player.id == socket.id

  IF player is NULL:
    RETURN  // Player never joined

  PRINT player.name + " disconnected"

  IF gameState.phase == 'lobby':
    // Remove from lobby
    REMOVE player FROM gameState.players

    // Reassign host if needed
    IF player.isHost AND length of gameState.players > 0:
      gameState.players[0].isHost = TRUE

    lobbyData = {
      players: MAP gameState.players TO {id, name, isHost, connected},
      canStart: length of gameState.players >= 2
    }
    BROADCAST 'lobbyUpdate' to all clients with lobbyData

  ELSE IF gameState.phase == 'playing':
    // Mark as disconnected but keep in game
    player.connected = FALSE

    BROADCAST 'playerDisconnected' to all with {
      playerId: player.id,
      playerName: player.name
    }

    // If it was their turn, advance
    IF gameState.players[gameState.currentPlayerIndex].id == player.id:
      advanceTurnToNextConnectedPlayer()
```

---

## Helper Functions

### Send Score Update

```
FUNCTION sendScoreUpdate():
  scores = MAP gameState.players TO {
    playerId: player.id,
    playerName: player.name,
    score: player.score
  }
  SORT scores by score DESCENDING
  BROADCAST 'scoreUpdate' to all clients with {scores}
```

---

### Handle Game End

```
FUNCTION handleGameEnd(reason):
  PRINT "Game ended: " + reason

  endResult = GAME_ENGINE.endGame(gameState, reason)

  finalScores = MAP gameState.players TO {
    playerId: player.id,
    playerName: player.name,
    score: player.score,
    remainingTilePoints: SUM of player.tiles points
  }
  SORT finalScores by score DESCENDING

  gameEndData = {
    reason,
    finalScores,
    winner: finalScores[0]
  }

  BROADCAST 'gameEnded' to all clients with gameEndData
```

---

### Advance Turn to Next Connected Player

```
FUNCTION advanceTurnToNextConnectedPlayer():
  attempts = 0
  maxAttempts = length of gameState.players

  WHILE attempts < maxAttempts:
    GAME_ENGINE.advanceTurn(gameState)
    currentPlayer = gameState.players[gameState.currentPlayerIndex]

    IF currentPlayer.connected:
      turnData = {
        currentPlayerId: currentPlayer.id,
        consecutivePasses: gameState.consecutivePasses
      }
      BROADCAST 'turnChange' to all clients with turnData
      RETURN

    attempts = attempts + 1

  // All players disconnected
  handleGameEnd('allPlayersDisconnected')
```
