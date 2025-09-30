# WebSocket API Contract

## Connection

### Client → Server: Connect
```typescript
// Socket.io connection
const socket = io('http://localhost:3000');
```

**On Success:**
- Connection established
- Server assigns unique `socket.id`

**On Failure:**
- Connection timeout
- Server unavailable

---

## Events: Client → Server

### `joinGame`
Join the game lobby with a display name.

**Payload:**
```typescript
{
  playerName: string  // 3-20 characters, alphanumeric + spaces
}
```

**Validations:**
- `playerName` required
- Length: 3-20 characters
- Not already taken
- Game not full (max 4 players)

**Success Response:** `lobbyUpdate` event
**Error Response:** `error` event with reason

---

### `startGame`
Start the game (host/first player only).

**Payload:**
```typescript
{} // Empty payload
```

**Validations:**
- Caller is host (first joined player)
- Minimum 2 players in lobby
- Game not already started

**Success Response:** `gameStarted` event broadcast to all
**Error Response:** `error` event

---

### `submitWord`
Submit a word placement for validation.

**Payload:**
```typescript
{
  placements: Array<{
    row: number        // 0-14
    col: number        // 0-14
    tile: {
      letter: string   // 'A'-'Z' or '_' for blank
      points: number   // 0-10
      isBlank: boolean
    }
  }>
}
```

**Validations:**
- Is current player's turn
- All positions valid (0-14)
- Positions form valid word pattern (horizontal or vertical line)
- No gaps in placement
- Tiles exist in player's rack
- Word(s) formed are in dictionary
- First move touches center square (7,7)
- Subsequent moves connect to existing tiles

**Success Response:** `wordAccepted` event
**Error Response:** `wordRejected` event with reason

---

### `passTurn`
Pass the current turn.

**Payload:**
```typescript
{} // Empty payload
```

**Validations:**
- Is current player's turn

**Success Response:** `turnChange` event broadcast
**Error Response:** `error` event

---

### `exchangeTiles`
Exchange tiles with the bag.

**Payload:**
```typescript
{
  tileIndices: number[]  // Indices in player's rack (0-6)
}
```

**Validations:**
- Is current player's turn
- At least 7 tiles remain in bag
- Indices valid (0-6)
- Indices reference tiles that exist

**Success Response:** `tilesExchanged` event
**Error Response:** `error` event

---

### `disconnect`
Player disconnects (automatic Socket.io event).

**Payload:** None (automatic)

**Server Action:**
- Mark player as disconnected
- Broadcast `playerDisconnected` event
- If game in progress, hold player spot for reconnection

---

## Events: Server → Client

### `lobbyUpdate`
Sent when lobby state changes (player joins/leaves).

**Payload:**
```typescript
{
  players: Array<{
    id: string
    name: string
    isHost: boolean
    connected: boolean
  }>
  canStart: boolean  // true if >= 2 players
}
```

**Emitted To:** All connected clients

---

### `gameStarted`
Game has started.

**Payload:**
```typescript
{
  turnOrder: string[]    // Array of player IDs
  currentPlayerId: string
  board: Tile[][]        // 15x15 grid, null for empty squares
  tileBagCount: number   // Remaining tiles in bag
}
```

**Emitted To:** All players (broadcast)

---

### `yourTiles`
Sent to player with their private tile rack.

**Payload:**
```typescript
{
  tiles: Array<{
    letter: string
    points: number
    isBlank: boolean
  }>  // Always 7 tiles (or fewer at game end)
}
```

**Emitted To:** Individual player only

---

### `wordAccepted`
Word validated and scored successfully.

**Payload:**
```typescript
{
  playerId: string
  word: string
  score: number
  newScore: number      // Player's total score
  placements: Array<{   // Echo of submitted placements
    row: number
    col: number
    tile: Tile
  }>
}
```

**Emitted To:** Player who submitted
**Followed By:** `boardUpdate` and `turnChange` broadcasts

---

### `wordRejected`
Word validation failed.

**Payload:**
```typescript
{
  reason: string  // e.g., "Word not in dictionary", "Invalid placement"
  invalidWords?: string[]  // Words that failed validation
}
```

**Emitted To:** Player who submitted

---

### `boardUpdate`
Board state has changed.

**Payload:**
```typescript
{
  board: Tile[][]        // Full 15x15 grid
  lastPlay?: {           // Optional: highlight last play
    positions: Array<{ row: number, col: number }>
  }
}
```

**Emitted To:** All players (broadcast)

---

### `turnChange`
Turn has advanced to next player.

**Payload:**
```typescript
{
  currentPlayerId: string
  consecutivePasses: number  // Track toward game end (6 = game over)
}
```

**Emitted To:** All players (broadcast)

---

### `tilesExchanged`
Tiles successfully exchanged.

**Payload:**
```typescript
{
  newTiles: Tile[]  // Replacement tiles for player
}
```

**Emitted To:** Player who exchanged
**Followed By:** `turnChange` broadcast

---

### `scoreUpdate`
Scores have changed.

**Payload:**
```typescript
{
  scores: Array<{
    playerId: string
    playerName: string
    score: number
  }>
}
```

**Emitted To:** All players (broadcast)

---

### `gameEnded`
Game has ended.

**Payload:**
```typescript
{
  reason: 'allTilesPlayed' | 'consecutivePasses'
  finalScores: Array<{
    playerId: string
    playerName: string
    score: number
    remainingTilePoints?: number  // Deducted from score
  }>
  winner: {
    playerId: string
    playerName: string
    score: number
  }
}
```

**Emitted To:** All players (broadcast)

---

### `playerDisconnected`
A player has disconnected.

**Payload:**
```typescript
{
  playerId: string
  playerName: string
}
```

**Emitted To:** All remaining players (broadcast)

---

### `error`
General error message.

**Payload:**
```typescript
{
  message: string
  code?: string  // e.g., 'NAME_TAKEN', 'NOT_YOUR_TURN', 'GAME_FULL'
}
```

**Emitted To:** Client that caused error

---

## Error Codes

| Code | Meaning |
|------|---------|
| `NAME_TAKEN` | Display name already in use |
| `GAME_FULL` | Maximum 4 players reached |
| `NOT_HOST` | Only host can start game |
| `NOT_ENOUGH_PLAYERS` | Need at least 2 players |
| `NOT_YOUR_TURN` | Action attempted when not current player |
| `INVALID_PLACEMENT` | Tile placement violates rules |
| `WORD_NOT_FOUND` | Word not in dictionary |
| `INSUFFICIENT_TILES` | Cannot exchange with < 7 tiles in bag |
| `GAME_NOT_STARTED` | Action requires game to be in progress |
| `GAME_ENDED` | Action attempted after game over |

---

## State Synchronization

### On Reconnection
If player disconnects and reconnects (same name):
1. Restore player session
2. Send full game state:
   - `gameStarted` (if in progress)
   - `yourTiles`
   - `boardUpdate`
   - `scoreUpdate`
   - `turnChange`

### Connection Lost
- Client: Show "Disconnected, attempting to reconnect..."
- Server: Hold player state for 60 seconds
- After 60s: Remove player from game

---

## Data Types

### Tile
```typescript
type Tile = {
  letter: string      // 'A'-'Z' or '_' for blank
  points: number      // Point value (0-10)
  isBlank: boolean    // True if this is a blank tile
}
```

### BoardPosition
```typescript
type BoardPosition = {
  row: number    // 0-14
  col: number    // 0-14
}
```

### BoardSquare
```typescript
type BoardSquare = Tile | null  // null = empty square
```

### Premium Squares
Defined by board position, not transmitted in every message:
- Center (7,7): Star (start square)
- Double Letter: (0,3), (0,11), ... (see Scrabble board layout)
- Triple Letter: (1,5), (1,9), ...
- Double Word: (1,1), (2,2), ...
- Triple Word: (0,0), (0,7), (0,14), (7,0), (7,14), (14,0), (14,7), (14,14)

Client has static board layout configuration.
