# Scrabble Game - Implementation

A local multiplayer Scrabble game accessible through web browsers.

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. Navigate to the implementation directory:
```bash
cd 2-logic/implementation
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

### Running the Game

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## How to Play

1. **Start the server** using one of the commands above
2. **Open your browser** and navigate to `http://localhost:3000`
3. **Enter your name** to join the lobby
4. **Wait for other players** to join (2-4 players)
5. **Host starts the game** (first player to join is the host)
6. **Play Scrabble!**
   - Drag tiles from your rack to the board
   - Submit your word
   - Pass your turn if needed
   - Exchange tiles if you have no moves

## Game Rules

- Standard Scrabble rules apply
- 2-4 players
- First word must touch the center square
- Subsequent words must connect to existing tiles
- Words are validated against the dictionary
- Premium squares (DL, TL, DW, TW) apply
- Bingo bonus: 50 points for using all 7 tiles

## Project Structure

```
2-logic/implementation/
├── src/
│   ├── game-engine/        # Core game logic
│   │   ├── tile-bag.ts
│   │   ├── board.ts
│   │   ├── validation.ts
│   │   ├── scoring.ts
│   │   └── game-engine.ts
│   ├── server.ts            # Express + Socket.io server
│   ├── dictionary.ts        # Dictionary service
│   └── types.ts             # Shared type definitions
├── public/
│   ├── index.html           # Main HTML file
│   └── assets/
│       ├── app.js           # Client JavaScript
│       └── styles.css       # Client styles
├── dictionary.txt           # Word list
├── package.json
├── tsconfig.json
└── README.md
```

## Technology Stack

- **Server**: Node.js, Express, Socket.io
- **Client**: HTML, CSS, JavaScript
- **Language**: TypeScript
- **Real-time Communication**: WebSocket (Socket.io)

## Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm run clean` - Remove dist folder

### Adding Words to Dictionary

Edit `dictionary.txt` and add words (one per line, uppercase).

## Troubleshooting

### Port 3000 already in use
Change the `PORT` constant in `src/server.ts`

### Dictionary not loading
Ensure `dictionary.txt` is in the root of the implementation folder

### Players can't connect
- Check firewall settings
- Ensure players are on the same network
- Verify the server URL shown in console
