# Game Engine Pseudocode

## Core Data Structures

```
TILE:
  letter: string ('A'-'Z' or '_' for blank)
  points: integer (0-10)
  isBlank: boolean

BOARD:
  15x15 grid of (TILE or NULL)

PLAYER:
  id: string
  name: string
  tiles: array[7] of TILE
  score: integer
  connected: boolean

GAME_STATE:
  phase: 'lobby' | 'playing' | 'ended'
  board: BOARD
  players: array of PLAYER
  currentPlayerIndex: integer
  tileBag: array of TILE
  consecutivePasses: integer
  turnHistory: array of PLAY

PLAY:
  playerId: string
  word: string
  score: integer
  positions: array of {row, col}
  timestamp: datetime
```

---

## Tile Bag Initialization

```
FUNCTION initializeTileBag():
  CREATE empty array tileBag

  // Standard Scrabble tile distribution
  ADD 9 × 'A' (1 point)
  ADD 2 × 'B' (3 points)
  ADD 2 × 'C' (3 points)
  ADD 4 × 'D' (2 points)
  ADD 12 × 'E' (1 point)
  ADD 2 × 'F' (4 points)
  ADD 3 × 'G' (2 points)
  ADD 2 × 'H' (4 points)
  ADD 9 × 'I' (1 point)
  ADD 1 × 'J' (8 points)
  ADD 1 × 'K' (5 points)
  ADD 4 × 'L' (1 point)
  ADD 2 × 'M' (3 points)
  ADD 6 × 'N' (1 point)
  ADD 8 × 'O' (1 point)
  ADD 2 × 'P' (3 points)
  ADD 1 × 'Q' (10 points)
  ADD 6 × 'R' (1 point)
  ADD 4 × 'S' (1 point)
  ADD 6 × 'T' (1 point)
  ADD 4 × 'U' (1 point)
  ADD 2 × 'V' (4 points)
  ADD 2 × 'W' (4 points)
  ADD 1 × 'X' (8 points)
  ADD 2 × 'Y' (4 points)
  ADD 1 × 'Z' (10 points)
  ADD 2 × '_' (0 points, blank)  // 100 tiles total

  SHUFFLE tileBag randomly
  RETURN tileBag
```

---

## Board Initialization

```
FUNCTION initializeBoard():
  CREATE 15×15 grid, all cells = NULL
  RETURN board

FUNCTION getPremiumSquareType(row, col):
  // Triple Word Score (red)
  IF (row, col) IN [(0,0), (0,7), (0,14), (7,0), (7,14), (14,0), (14,7), (14,14)]:
    RETURN 'TRIPLE_WORD'

  // Double Word Score (pink)
  IF (row, col) IN [(1,1), (2,2), (3,3), (4,4), (1,13), (2,12), (3,11), (4,10),
                     (13,1), (12,2), (11,3), (10,4), (13,13), (12,12), (11,11), (10,10),
                     (7,7)]:  // Center is also double word
    RETURN 'DOUBLE_WORD'

  // Triple Letter Score (dark blue)
  IF (row, col) IN [(1,5), (1,9), (5,1), (5,5), (5,9), (5,13), (9,1), (9,5), (9,9), (9,13), (13,5), (13,9)]:
    RETURN 'TRIPLE_LETTER'

  // Double Letter Score (light blue)
  IF (row, col) IN [(0,3), (0,11), (2,6), (2,8), (3,0), (3,7), (3,14), (6,2), (6,6), (6,8), (6,12),
                     (7,3), (7,11), (8,2), (8,6), (8,8), (8,12), (11,0), (11,7), (11,14),
                     (12,6), (12,8), (14,3), (14,11)]:
    RETURN 'DOUBLE_LETTER'

  RETURN 'NORMAL'
```

---

## Player Actions

### Draw Tiles

```
FUNCTION drawTiles(player, count):
  IF tileBag is empty:
    RETURN []

  actualCount = MIN(count, length of tileBag)
  drawnTiles = TAKE first actualCount tiles from tileBag
  REMOVE those tiles from tileBag
  RETURN drawnTiles
```

---

### Start Game

```
FUNCTION startGame(gameState):
  IF gameState.phase != 'lobby':
    RETURN error "Game already started"

  IF player count < 2:
    RETURN error "Need at least 2 players"

  gameState.phase = 'playing'
  gameState.board = initializeBoard()
  gameState.tileBag = initializeTileBag()
  gameState.consecutivePasses = 0

  // Shuffle player order randomly
  SHUFFLE gameState.players

  // Deal 7 tiles to each player
  FOR EACH player IN gameState.players:
    player.tiles = drawTiles(player, 7)
    player.score = 0

  gameState.currentPlayerIndex = 0

  RETURN success
```

---

## Word Validation

### Placement Validation

```
FUNCTION validatePlacement(placements, board, isFirstMove):
  IF placements is empty:
    RETURN error "No tiles placed"

  // Check all positions valid
  FOR EACH placement IN placements:
    IF placement.row < 0 OR placement.row > 14:
      RETURN error "Invalid row"
    IF placement.col < 0 OR placement.col > 14:
      RETURN error "Invalid column"
    IF board[placement.row][placement.col] != NULL:
      RETURN error "Square already occupied"

  // Check tiles form a line (horizontal or vertical)
  allSameRow = ALL placements have same row
  allSameCol = ALL placements have same column

  IF NOT allSameRow AND NOT allSameCol:
    RETURN error "Tiles must form a single line"

  // Check no gaps
  IF allSameRow:
    cols = EXTRACT all col values, SORT ascending
    FOR i FROM 0 TO length(cols)-2:
      FOR colIndex FROM cols[i]+1 TO cols[i+1]-1:
        IF board[placements[0].row][colIndex] == NULL:
          RETURN error "Gap in word"
  ELSE:  // allSameCol
    rows = EXTRACT all row values, SORT ascending
    FOR i FROM 0 TO length(rows)-2:
      FOR rowIndex FROM rows[i]+1 TO rows[i+1]-1:
        IF board[rowIndex][placements[0].col] == NULL:
          RETURN error "Gap in word"

  // Check first move touches center
  IF isFirstMove:
    centerTouched = FALSE
    FOR EACH placement IN placements:
      IF placement.row == 7 AND placement.col == 7:
        centerTouched = TRUE
    IF NOT centerTouched:
      RETURN error "First word must touch center"

  // Check subsequent moves connect to existing tiles
  IF NOT isFirstMove:
    connected = FALSE
    FOR EACH placement IN placements:
      // Check adjacent squares (up, down, left, right)
      IF board[placement.row-1][placement.col] != NULL OR
         board[placement.row+1][placement.col] != NULL OR
         board[placement.row][placement.col-1] != NULL OR
         board[placement.row][placement.col+1] != NULL:
        connected = TRUE
    IF NOT connected:
      RETURN error "Word must connect to existing tiles"

  RETURN valid
```

---

### Extract Words from Board

```
FUNCTION extractWords(placements, board):
  // Temporarily place tiles on board copy
  boardCopy = DEEP_COPY(board)
  FOR EACH placement IN placements:
    boardCopy[placement.row][placement.col] = placement.tile

  words = []

  // Get main word
  IF all placements same row:
    mainWord = extractHorizontalWord(placements[0].row, placements, boardCopy)
  ELSE:
    mainWord = extractVerticalWord(placements[0].col, placements, boardCopy)

  ADD mainWord TO words

  // Get perpendicular words (cross words)
  FOR EACH placement IN placements:
    IF main word is horizontal:
      crossWord = extractVerticalWord(placement.col, [placement], boardCopy)
      IF crossWord.length > 1:  // More than just the placed tile
        ADD crossWord TO words
    ELSE:
      crossWord = extractHorizontalWord(placement.row, [placement], boardCopy)
      IF crossWord.length > 1:
        ADD crossWord TO words

  RETURN words

FUNCTION extractHorizontalWord(row, placements, board):
  // Find leftmost position of word
  col = MIN(placement.col for placement in placements)
  WHILE col > 0 AND board[row][col-1] != NULL:
    col = col - 1

  // Extract word left to right
  word = ""
  WHILE col <= 14 AND board[row][col] != NULL:
    word = word + board[row][col].letter
    col = col + 1

  RETURN word

FUNCTION extractVerticalWord(col, placements, board):
  // Find topmost position of word
  row = MIN(placement.row for placement in placements)
  WHILE row > 0 AND board[row-1][col] != NULL:
    row = row - 1

  // Extract word top to bottom
  word = ""
  WHILE row <= 14 AND board[row][col] != NULL:
    word = word + board[row][col].letter
    row = row + 1

  RETURN word
```

---

### Dictionary Validation

```
FUNCTION validateWords(words, dictionary):
  invalidWords = []

  FOR EACH word IN words:
    IF word NOT IN dictionary:
      ADD word TO invalidWords

  IF invalidWords is not empty:
    RETURN error with invalidWords
  ELSE:
    RETURN valid
```

---

## Scoring

```
FUNCTION calculateScore(placements, board):
  // Temporarily place tiles
  boardCopy = DEEP_COPY(board)
  FOR EACH placement IN placements:
    boardCopy[placement.row][placement.col] = placement.tile

  totalScore = 0
  usedAllTiles = (length of placements == 7)

  // Score main word
  IF all placements same row:
    score = scoreHorizontalWord(placements[0].row, placements, boardCopy)
  ELSE:
    score = scoreVerticalWord(placements[0].col, placements, boardCopy)
  totalScore = totalScore + score

  // Score cross words
  FOR EACH placement IN placements:
    IF main word is horizontal:
      crossScore = scoreVerticalWord(placement.col, [placement], boardCopy)
      IF crossScore > 0:
        totalScore = totalScore + crossScore
    ELSE:
      crossScore = scoreHorizontalWord(placement.row, [placement], boardCopy)
      IF crossScore > 0:
        totalScore = totalScore + crossScore

  // Bonus for using all 7 tiles (bingo)
  IF usedAllTiles:
    totalScore = totalScore + 50

  RETURN totalScore

FUNCTION scoreHorizontalWord(row, newPlacements, board):
  // Find word boundaries
  startCol = MIN(placement.col for placement in newPlacements)
  WHILE startCol > 0 AND board[row][startCol-1] != NULL:
    startCol = startCol - 1

  endCol = MAX(placement.col for placement in newPlacements)
  WHILE endCol < 14 AND board[row][endCol+1] != NULL:
    endCol = endCol + 1

  // If word is only 1 letter, return 0 (not a cross word)
  IF startCol == endCol:
    RETURN 0

  // Calculate score
  wordScore = 0
  wordMultiplier = 1
  newPlacementCols = SET of col values from newPlacements

  FOR col FROM startCol TO endCol:
    tile = board[row][col]
    tileScore = tile.points

    // Apply premium squares only for newly placed tiles
    IF col IN newPlacementCols:
      premiumType = getPremiumSquareType(row, col)
      IF premiumType == 'DOUBLE_LETTER':
        tileScore = tileScore × 2
      ELSE IF premiumType == 'TRIPLE_LETTER':
        tileScore = tileScore × 3
      ELSE IF premiumType == 'DOUBLE_WORD':
        wordMultiplier = wordMultiplier × 2
      ELSE IF premiumType == 'TRIPLE_WORD':
        wordMultiplier = wordMultiplier × 3

    wordScore = wordScore + tileScore

  RETURN wordScore × wordMultiplier

FUNCTION scoreVerticalWord(col, newPlacements, board):
  // Similar to scoreHorizontalWord but for vertical direction
  // [Implementation mirrors horizontal logic with row/col swapped]
```

---

## Submit Word

```
FUNCTION submitWord(gameState, playerId, placements):
  // Validate it's player's turn
  currentPlayer = gameState.players[gameState.currentPlayerIndex]
  IF currentPlayer.id != playerId:
    RETURN error "Not your turn"

  // Validate player has the tiles
  FOR EACH placement IN placements:
    IF placement.tile NOT IN currentPlayer.tiles:
      RETURN error "You don't have that tile"

  // Validate placement rules
  isFirstMove = (board is empty)
  validationResult = validatePlacement(placements, gameState.board, isFirstMove)
  IF validationResult is error:
    RETURN validationResult

  // Extract and validate words
  words = extractWords(placements, gameState.board)
  dictionaryResult = validateWords(words, dictionary)
  IF dictionaryResult is error:
    RETURN dictionaryResult

  // Calculate score
  score = calculateScore(placements, gameState.board)

  // Apply changes
  FOR EACH placement IN placements:
    gameState.board[placement.row][placement.col] = placement.tile
    REMOVE placement.tile FROM currentPlayer.tiles

  currentPlayer.score = currentPlayer.score + score

  // Draw new tiles
  tilesToDraw = MIN(7 - length(currentPlayer.tiles), length(tileBag))
  newTiles = drawTiles(currentPlayer, tilesToDraw)
  ADD newTiles TO currentPlayer.tiles

  // Record play
  play = {playerId, words, score, placements, timestamp: NOW()}
  ADD play TO gameState.turnHistory

  // Reset consecutive passes
  gameState.consecutivePasses = 0

  // Check if game ends (player used all tiles and bag empty)
  IF length(currentPlayer.tiles) == 0 AND length(tileBag) == 0:
    endGame(gameState, 'allTilesPlayed')
    RETURN {success, score, newTiles, gameEnded: TRUE}

  // Advance turn
  advanceTurn(gameState)

  RETURN {success, score, newTiles}
```

---

## Other Actions

### Pass Turn

```
FUNCTION passTurn(gameState, playerId):
  currentPlayer = gameState.players[gameState.currentPlayerIndex]
  IF currentPlayer.id != playerId:
    RETURN error "Not your turn"

  gameState.consecutivePasses = gameState.consecutivePasses + 1

  // Game ends after 6 consecutive passes (all players pass twice in a row)
  IF gameState.consecutivePasses >= 6:
    endGame(gameState, 'consecutivePasses')
    RETURN {success, gameEnded: TRUE}

  advanceTurn(gameState)
  RETURN {success}
```

---

### Exchange Tiles

```
FUNCTION exchangeTiles(gameState, playerId, tileIndices):
  currentPlayer = gameState.players[gameState.currentPlayerIndex]
  IF currentPlayer.id != playerId:
    RETURN error "Not your turn"

  IF length(tileBag) < 7:
    RETURN error "Not enough tiles in bag to exchange"

  // Remove tiles from player and add to bag
  tilesToExchange = []
  FOR EACH index IN tileIndices:
    tile = currentPlayer.tiles[index]
    ADD tile TO tilesToExchange
    REMOVE tile FROM currentPlayer.tiles

  ADD tilesToExchange TO tileBag
  SHUFFLE tileBag

  // Draw new tiles
  newTiles = drawTiles(currentPlayer, length(tilesToExchange))
  ADD newTiles TO currentPlayer.tiles

  gameState.consecutivePasses = 0
  advanceTurn(gameState)

  RETURN {success, newTiles}
```

---

### Advance Turn

```
FUNCTION advanceTurn(gameState):
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) MOD (player count)

  // Skip disconnected players
  WHILE gameState.players[gameState.currentPlayerIndex].connected == FALSE:
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) MOD (player count)
```

---

### End Game

```
FUNCTION endGame(gameState, reason):
  gameState.phase = 'ended'

  // Subtract remaining tile values from each player's score
  FOR EACH player IN gameState.players:
    remainingPoints = SUM of tile.points for tile in player.tiles
    player.score = player.score - remainingPoints

  // Determine winner
  winner = player with highest score
  IF multiple players tied for highest:
    winner = first player (by turn order) among tied players

  RETURN {reason, finalScores: all player scores, winner}
```
