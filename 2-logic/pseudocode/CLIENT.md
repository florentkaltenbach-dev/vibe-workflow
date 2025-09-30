# Client Pseudocode

## Application Initialization

```
FUNCTION initializeApp():
  // Connect to server
  socket = io('http://localhost:3000')

  // Initialize client state
  clientState = {
    myId: NULL,
    myName: NULL,
    myTiles: [],
    board: CREATE_EMPTY_BOARD(),
    players: [],
    currentPlayerId: NULL,
    gamePhase: 'lobby',
    pendingMove: [],
    tileBagCount: 100
  }

  // Setup socket listeners
  setupSocketListeners(socket)

  // Setup UI event handlers
  setupUIHandlers()

  // Render initial view (join screen)
  renderJoinScreen()
```

---

## Socket Event Listeners

```
FUNCTION setupSocketListeners(socket):
  socket.on('connect', HANDLE onConnect)
  socket.on('lobbyUpdate', HANDLE onLobbyUpdate)
  socket.on('gameStarted', HANDLE onGameStarted)
  socket.on('yourTiles', HANDLE onYourTiles)
  socket.on('boardUpdate', HANDLE onBoardUpdate)
  socket.on('turnChange', HANDLE onTurnChange)
  socket.on('wordAccepted', HANDLE onWordAccepted)
  socket.on('wordRejected', HANDLE onWordRejected)
  socket.on('tilesExchanged', HANDLE onTilesExchanged)
  socket.on('scoreUpdate', HANDLE onScoreUpdate)
  socket.on('tileBagUpdate', HANDLE onTileBagUpdate)
  socket.on('gameEnded', HANDLE onGameEnded)
  socket.on('playerDisconnected', HANDLE onPlayerDisconnected)
  socket.on('error', HANDLE onError)

FUNCTION onConnect():
  clientState.myId = socket.id
  PRINT "Connected to server"

FUNCTION onLobbyUpdate(data):
  clientState.players = data.players
  renderLobby(data.players, data.canStart)

FUNCTION onGameStarted(data):
  clientState.gamePhase = 'playing'
  clientState.board = data.board
  clientState.currentPlayerId = data.currentPlayerId
  clientState.tileBagCount = data.tileBagCount

  HIDE lobby view
  SHOW game board view
  renderBoard()
  renderTurnIndicator()

FUNCTION onYourTiles(data):
  clientState.myTiles = data.tiles
  renderMyTiles()

FUNCTION onBoardUpdate(data):
  clientState.board = data.board
  renderBoard()

  IF data.lastPlay exists:
    highlightLastPlay(data.lastPlay.positions)

FUNCTION onTurnChange(data):
  clientState.currentPlayerId = data.currentPlayerId
  renderTurnIndicator()

  IF isMyTurn():
    ENABLE action buttons
    SHOW notification "Your turn!"
  ELSE:
    DISABLE action buttons

FUNCTION onWordAccepted(data):
  SHOW success message: "'" + data.word + "' scored " + data.score + " points!"
  clearPendingMove()

FUNCTION onWordRejected(data):
  SHOW error message: data.reason
  IF data.invalidWords exists:
    SHOW "Invalid words: " + JOIN(data.invalidWords, ", ")
  // Keep pending move so player can adjust

FUNCTION onTilesExchanged(data):
  SHOW success message: "Tiles exchanged"
  clearPendingMove()

FUNCTION onScoreUpdate(data):
  renderScoreboard(data.scores)

FUNCTION onTileBagUpdate(data):
  clientState.tileBagCount = data.count
  renderTileBagCount()

FUNCTION onGameEnded(data):
  clientState.gamePhase = 'ended'
  HIDE action buttons
  SHOW game over screen with:
    - Winner announcement
    - Final scores
    - "Play Again" button

FUNCTION onPlayerDisconnected(data):
  SHOW notification: data.playerName + " disconnected"

FUNCTION onError(data):
  SHOW error notification: data.message
```

---

## UI Event Handlers

```
FUNCTION setupUIHandlers():
  // Join screen
  ON CLICK joinButton:
    handleJoinGame()

  // Lobby
  ON CLICK startGameButton:
    handleStartGame()

  // Game board
  ON DRAG_START tile FROM myTilesArea:
    handleTileDragStart(tile)

  ON DRAG_OVER boardSquare:
    handleTileDragOver(boardSquare)

  ON DROP tile ON boardSquare:
    handleTileDrop(tile, boardSquare)

  ON DRAG tile FROM board BACK TO rack:
    handleTileReturn(tile)

  // Action buttons
  ON CLICK submitButton:
    handleSubmitWord()

  ON CLICK passButton:
    handlePassTurn()

  ON CLICK exchangeButton:
    handleExchangeTiles()

  ON CLICK clearButton:
    handleClearMove()
```

---

## Join/Start Game Actions

```
FUNCTION handleJoinGame():
  nameInput = GET value from nameInputField
  name = TRIM(nameInput)

  IF name.length < 3 OR name.length > 20:
    SHOW error "Name must be 3-20 characters"
    RETURN

  clientState.myName = name
  socket.emit('joinGame', {playerName: name})

  SHOW loading indicator "Joining game..."

FUNCTION handleStartGame():
  socket.emit('startGame', {})
  DISABLE startGameButton
  SHOW loading indicator "Starting game..."
```

---

## Tile Placement Actions

```
FUNCTION handleTileDragStart(tile):
  // Store tile being dragged
  draggedTile = tile

FUNCTION handleTileDragOver(boardSquare):
  // Check if square is valid for placement
  IF boardSquare is empty AND NOT occupied by pending move:
    SHOW visual feedback (highlight square)
    ALLOW drop
  ELSE:
    PREVENT drop

FUNCTION handleTileDrop(tile, boardSquare):
  row = boardSquare.row
  col = boardSquare.col

  // Check if tile is blank - prompt for letter choice
  IF tile.isBlank:
    chosenLetter = PROMPT "Choose letter for blank tile" (A-Z buttons)
    IF chosenLetter is NULL:
      RETURN  // User cancelled
    tile = CLONE tile with {letter: chosenLetter}

  // Add to pending move
  placement = {row, col, tile}
  ADD placement TO clientState.pendingMove

  // Update UI
  renderPendingTile(row, col, tile)
  REMOVE tile from visual rack (but keep in clientState.myTiles)

  // Enable submit and clear buttons
  ENABLE submitButton
  ENABLE clearButton

FUNCTION handleTileReturn(placement):
  // Remove from pending move
  REMOVE placement FROM clientState.pendingMove

  // Update UI
  clearPendingTile(placement.row, placement.col)
  renderMyTiles()  // Redraw rack

  // Disable submit if no tiles placed
  IF clientState.pendingMove is empty:
    DISABLE submitButton
    DISABLE clearButton
```

---

## Game Actions

```
FUNCTION handleSubmitWord():
  IF clientState.pendingMove is empty:
    SHOW error "Place tiles first"
    RETURN

  IF NOT isMyTurn():
    SHOW error "Not your turn"
    RETURN

  // Send to server
  socket.emit('submitWord', {placements: clientState.pendingMove})

  DISABLE submitButton
  SHOW loading indicator "Validating word..."

FUNCTION handlePassTurn():
  IF NOT isMyTurn():
    SHOW error "Not your turn"
    RETURN

  confirmed = CONFIRM "Are you sure you want to pass?"
  IF NOT confirmed:
    RETURN

  socket.emit('passTurn', {})

FUNCTION handleExchangeTiles():
  IF NOT isMyTurn():
    SHOW error "Not your turn"
    RETURN

  // Show tile selection dialog
  selectedIndices = PROMPT_TILE_SELECTION_DIALOG(clientState.myTiles)

  IF selectedIndices is empty:
    RETURN  // User cancelled

  socket.emit('exchangeTiles', {tileIndices: selectedIndices})

  DISABLE exchangeButton
  SHOW loading indicator "Exchanging tiles..."

FUNCTION handleClearMove():
  // Return all pending tiles to rack
  FOR EACH placement IN clientState.pendingMove:
    clearPendingTile(placement.row, placement.col)

  clientState.pendingMove = []
  renderMyTiles()

  DISABLE submitButton
  DISABLE clearButton
```

---

## Rendering Functions

### Join Screen

```
FUNCTION renderJoinScreen():
  SHOW HTML:
    <div id="join-screen">
      <h1>Scrabble Game</h1>
      <input id="name-input" placeholder="Enter your name" maxlength="20" />
      <button id="join-button">Join Game</button>
    </div>
```

---

### Lobby

```
FUNCTION renderLobby(players, canStart):
  isHost = players[0].id == clientState.myId

  playerListHTML = ""
  FOR EACH player IN players:
    hostBadge = player.isHost ? "(Host)" : ""
    playerListHTML += "<li>" + player.name + " " + hostBadge + "</li>"

  SHOW HTML:
    <div id="lobby">
      <h2>Game Lobby</h2>
      <h3>Players:</h3>
      <ul>{playerListHTML}</ul>

      IF isHost AND canStart:
        <button id="start-game-button">Start Game</button>
      ELSE IF isHost:
        <p>Waiting for more players... (need at least 2)</p>
      ELSE:
        <p>Waiting for host to start the game...</p>
    </div>
```

---

### Game Board

```
FUNCTION renderBoard():
  boardHTML = "<table id='game-board'>"

  FOR row FROM 0 TO 14:
    boardHTML += "<tr>"
    FOR col FROM 0 TO 14:
      square = clientState.board[row][col]
      premiumType = getPremiumSquareType(row, col)

      cssClass = "square " + premiumType.toLowerCase()

      IF square is NOT NULL:
        // Placed tile
        boardHTML += "<td class='" + cssClass + " occupied'>"
        boardHTML += renderTile(square)
        boardHTML += "</td>"
      ELSE:
        // Empty square - droppable if my turn
        boardHTML += "<td class='" + cssClass + "' "
        boardHTML += "data-row='" + row + "' data-col='" + col + "' "
        boardHTML += "ondragover='allowDrop(event)' ondrop='handleDrop(event)'>"
        boardHTML += renderPremiumLabel(premiumType)
        boardHTML += "</td>"

    boardHTML += "</tr>"

  boardHTML += "</table>"

  SET innerHTML of boardContainer TO boardHTML

FUNCTION renderTile(tile):
  letter = tile.isBlank ? tile.letter.toLowerCase() : tile.letter
  points = tile.isBlank ? "" : tile.points

  RETURN "<div class='tile'>" +
         "  <span class='letter'>" + letter + "</span>" +
         "  <span class='points'>" + points + "</span>" +
         "</div>"

FUNCTION renderPremiumLabel(premiumType):
  labels = {
    'TRIPLE_WORD': 'TW',
    'DOUBLE_WORD': 'DW',
    'TRIPLE_LETTER': 'TL',
    'DOUBLE_LETTER': 'DL',
    'NORMAL': ''
  }
  RETURN "<span class='premium-label'>" + labels[premiumType] + "</span>"

FUNCTION getPremiumSquareType(row, col):
  // Same logic as server-side
  // [Returns 'TRIPLE_WORD' | 'DOUBLE_WORD' | 'TRIPLE_LETTER' | 'DOUBLE_LETTER' | 'NORMAL']
```

---

### My Tiles (Rack)

```
FUNCTION renderMyTiles():
  rackHTML = "<div id='tile-rack'>"

  FOR EACH tile IN clientState.myTiles:
    // Check if tile is in pending move
    IF tile NOT IN pendingMove:
      rackHTML += "<div class='tile draggable' draggable='true' "
      rackHTML += "ondragstart='handleTileDragStart(event)'>"
      rackHTML += renderTile(tile)
      rackHTML += "</div>"

  rackHTML += "</div>"

  SET innerHTML of tileRackContainer TO rackHTML
```

---

### Turn Indicator

```
FUNCTION renderTurnIndicator():
  currentPlayer = FIND player WHERE player.id == clientState.currentPlayerId

  IF isMyTurn():
    message = "Your turn!"
    cssClass = "my-turn"
  ELSE:
    message = currentPlayer.name + "'s turn"
    cssClass = "other-turn"

  SET innerHTML of turnIndicator TO:
    "<div class='" + cssClass + "'>" + message + "</div>"
```

---

### Scoreboard

```
FUNCTION renderScoreboard(scores):
  scoreHTML = "<table id='scoreboard'>"
  scoreHTML += "<tr><th>Player</th><th>Score</th></tr>"

  FOR EACH score IN scores:
    isMe = score.playerId == clientState.myId
    cssClass = isMe ? "my-score" : ""

    scoreHTML += "<tr class='" + cssClass + "'>"
    scoreHTML += "  <td>" + score.playerName + "</td>"
    scoreHTML += "  <td>" + score.score + "</td>"
    scoreHTML += "</tr>"

  scoreHTML += "</table>"

  SET innerHTML of scoreboardContainer TO scoreHTML
```

---

### Tile Bag Count

```
FUNCTION renderTileBagCount():
  SET innerHTML of tileBagDisplay TO:
    "Tiles remaining: " + clientState.tileBagCount
```

---

### Game Over Screen

```
FUNCTION renderGameOver(endData):
  reasonText = {
    'allTilesPlayed': "All tiles have been played!",
    'consecutivePasses': "All players passed - game over!",
    'allPlayersDisconnected': "All players disconnected"
  }

  gameOverHTML = "<div id='game-over'>"
  gameOverHTML += "<h1>" + reasonText[endData.reason] + "</h1>"
  gameOverHTML += "<h2>Winner: " + endData.winner.playerName + "</h2>"
  gameOverHTML += "<h3>Final Score: " + endData.winner.score + "</h3>"
  gameOverHTML += "<h3>Final Scores:</h3>"
  gameOverHTML += "<table>"

  FOR EACH score IN endData.finalScores:
    gameOverHTML += "<tr>"
    gameOverHTML += "  <td>" + score.playerName + "</td>"
    gameOverHTML += "  <td>" + score.score + "</td>"
    gameOverHTML += "</tr>"

  gameOverHTML += "</table>"
  gameOverHTML += "<button onclick='location.reload()'>Play Again</button>"
  gameOverHTML += "</div>"

  SHOW modal overlay with gameOverHTML
```

---

## Helper Functions

```
FUNCTION isMyTurn():
  RETURN clientState.currentPlayerId == clientState.myId

FUNCTION clearPendingMove():
  clientState.pendingMove = []
  renderBoard()
  renderMyTiles()
  DISABLE submitButton
  DISABLE clearButton

FUNCTION highlightLastPlay(positions):
  FOR EACH position IN positions:
    square = GET square element at (position.row, position.col)
    ADD CSS class 'last-play' TO square

  // Remove highlight after 3 seconds
  AFTER 3 seconds:
    REMOVE CSS class 'last-play' FROM all squares
```

---

## CSS Classes (for reference)

```
.square            - Base board square
.triple-word       - Red (triple word)
.double-word       - Pink (double word)
.triple-letter     - Dark blue (triple letter)
.double-letter     - Light blue (double letter)
.occupied          - Square with tile
.tile              - Tile component
.draggable         - Can be dragged
.my-turn           - Current player indicator
.other-turn        - Other player's turn
.last-play         - Recently played tiles (temporary highlight)
.pending           - Tiles placed but not submitted
```
