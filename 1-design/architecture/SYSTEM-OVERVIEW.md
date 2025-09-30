# System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Game UI    │  │  Game Logic  │  │  WebSocket   │  │
│  │  (React/Vue) │  │   (Client)   │  │   Client     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
└─────────┼──────────────────┼──────────────────┼──────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    HTTP / WebSocket
                             │
┌─────────────────────────────┴───────────────────────────┐
│                      Server (Node.js)                    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   HTTP/WS    │  │ Game Engine  │  │  Dictionary  │  │
│  │   Server     │  │              │  │  Validator   │  │
│  │  (Express +  │  │ - Turn logic │  │              │  │
│  │   Socket.io) │  │ - Scoring    │  │              │  │
│  │              │  │ - Rules      │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                             │                            │
│                    ┌────────┴────────┐                   │
│                    │   Game State    │                   │
│                    │   (In-Memory)   │                   │
│                    └─────────────────┘                   │
└──────────────────────────────────────────────────────────┘
```

## Technology Stack

### Server
- **Runtime:** Node.js
- **Web Framework:** Express.js
- **Real-time Communication:** Socket.io (WebSocket + fallback)
- **Language:** TypeScript
- **Dictionary:** JSON file or text file word list

### Client
- **Framework:** React or Vue.js (TBD)
- **Language:** TypeScript
- **Styling:** CSS/SCSS (responsive)
- **Real-time:** Socket.io client

## Component Breakdown

### Server Components

#### 1. HTTP Server
- Serves static files (HTML, CSS, JS)
- Handles initial page load
- Provides REST endpoints for game info

#### 2. WebSocket Server (Socket.io)
- Real-time bidirectional communication
- Event-based architecture
- Handles:
  - Player join/leave
  - Tile placement
  - Turn submission
  - Game state updates

#### 3. Game Engine
**Responsibilities:**
- Board state management (15x15 grid)
- Tile bag management (100 tiles total)
- Turn logic and validation
- Scoring calculation
- Word validation (dictionary lookup)
- Game end conditions

**Subcomponents:**
- Board Manager
- Tile Manager
- Scoring Engine
- Rule Validator
- Dictionary Service

#### 4. Game State Manager
- In-memory storage of active game
- Player states (name, score, tiles, connected status)
- Board state
- Turn order and current player
- Game phase (lobby, playing, ended)

### Client Components

#### 1. Game UI
**Views:**
- Lobby View (join game, player list, start button)
- Game Board View (15x15 grid)
- Player Rack View (7 tiles)
- Scoreboard View
- Game Over View

**Components:**
- Board Grid
- Tile Component
- Player List
- Score Display
- Action Buttons (Submit, Pass, Exchange)

#### 2. Client Game Logic
- Local tile placement preview
- Drag-and-drop handling
- Input validation before server submission
- UI state management

#### 3. WebSocket Client
- Connection management
- Event listeners for server updates
- Emit user actions to server

## Data Flow

### Player Joins Game
```
Client                    Server
  │                         │
  │──── WebSocket Connect ──→│
  │                         │
  │──── emit('joinGame') ───→│
  │     { name: "Alice" }    │
  │                         │
  │                      [Validate]
  │                      [Add to lobby]
  │                         │
  │←── emit('lobbyUpdate')──│
  │     { players: [...] }  │
  │                         │
  │←── broadcast ───────────│
  │    'playerJoined'       │
```

### Player Submits Word
```
Client                    Server
  │                         │
  │──── emit('submitWord')──→│
  │     { positions: [],    │
  │       tiles: [] }        │
  │                         │
  │                      [Validate placement]
  │                      [Check dictionary]
  │                      [Calculate score]
  │                      [Update state]
  │                         │
  │←── emit('wordAccepted')─│
  │     { score: 24,        │
  │       newTiles: [] }    │
  │                         │
  │←── broadcast ───────────│
  │    'boardUpdate'        │
  │    'turnChange'         │
```

## State Management

### Server State
```typescript
GameState {
  phase: 'lobby' | 'playing' | 'ended'
  board: Tile[15][15]
  players: Player[]
  currentPlayerIndex: number
  tileBag: Tile[]
  consecutivePasses: number
  turnHistory: Play[]
}

Player {
  id: string
  name: string
  tiles: Tile[7]
  score: number
  connected: boolean
}

Tile {
  letter: string
  points: number
  isBlank: boolean
}
```

### Client State
```typescript
ClientGameState {
  myId: string
  myTiles: Tile[]
  board: Tile[15][15]
  players: Player[]
  currentPlayerId: string
  isMyTurn: boolean
  pendingMove: TilePlacement[]
}
```

## Communication Protocol

### WebSocket Events

**Client → Server:**
- `joinGame` - Join lobby
- `startGame` - Start game (host only)
- `submitWord` - Submit word for validation
- `passTurn` - Pass turn
- `exchangeTiles` - Exchange tiles
- `disconnect` - Player leaves

**Server → Client:**
- `lobbyUpdate` - Player list updated
- `gameStarted` - Game has begun
- `boardUpdate` - Board state changed
- `turnChange` - Next player's turn
- `wordAccepted` - Word validated and scored
- `wordRejected` - Word invalid
- `gameEnded` - Game over
- `playerDisconnected` - Player left
- `error` - Error message

## Scalability Considerations

### Current Design (MVP)
- Single game instance per server
- In-memory state only
- ~4 players maximum
- No persistence

### Future Scaling
- Multiple game rooms (sessions)
- Database for persistence
- Reconnection handling
- Game history storage

## Security Considerations
(To be detailed by /4-security)

- Input validation on all client data
- Rate limiting on actions
- XSS protection in chat (if implemented)
- Dictionary file integrity

## Performance Considerations
(To be detailed by /5-performance)

- WebSocket connection efficiency
- Board update optimization (delta updates)
- Dictionary lookup speed (indexed)
- Client rendering optimization
