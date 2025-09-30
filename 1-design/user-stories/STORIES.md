# User Stories

## Epic: Game Setup

### US-001: Start Server
**As a** host
**I want to** start the game server with a single command
**So that** I can quickly set up a game without technical hassle

**Acceptance Criteria:**
- Server starts with one command (e.g., `npm start`)
- Displays the URL players should visit
- Shows server status (running, port number)
- Can be stopped gracefully (Ctrl+C)

---

### US-002: Join Game
**As a** player
**I want to** join a game by entering my name in a browser
**So that** I can start playing without creating an account

**Acceptance Criteria:**
- Player visits URL shown by server
- Enters a display name (3-20 characters)
- Joins lobby automatically
- Sees list of other players in lobby
- Cannot join if name is already taken
- Cannot join if game is full (4 players max)

---

### US-003: Start Game
**As a** host/first player
**I want to** start the game once all players have joined
**So that** we can begin playing

**Acceptance Criteria:**
- Minimum 2 players required
- "Start Game" button visible to host
- All players notified when game starts
- Board initializes with starting tiles
- Turn order determined randomly

---

## Epic: Gameplay

### US-004: View Board
**As a** player
**I want to** see the current game board clearly
**So that** I can plan my moves

**Acceptance Criteria:**
- 15x15 grid displayed clearly
- Premium squares visible (double/triple word/letter)
- Placed tiles show letters and point values
- Board updates in real-time when others play
- Responsive design works on tablet/phone

---

### US-005: View My Tiles
**As a** player
**I want to** see my 7 letter tiles
**So that** I know what letters I can play

**Acceptance Criteria:**
- Tiles displayed clearly with letters and points
- Can see all 7 tiles at once
- Tiles distinct from board tiles visually
- Only I can see my tiles (not other players)

---

### US-006: Place Tiles
**As a** player on my turn
**I want to** drag and drop tiles onto the board
**So that** I can form words

**Acceptance Criteria:**
- Drag tiles from rack to board
- Snap to grid positions
- Can drag back to rack before submitting
- Visual feedback for valid placement positions
- Cannot place on occupied squares
- First word must touch center square

---

### US-007: Submit Word
**As a** player on my turn
**I want to** submit my word for validation
**So that** I can score points

**Acceptance Criteria:**
- "Submit" button available after placing tiles
- Word validated against dictionary
- Score calculated and displayed
- Invalid words rejected with error message
- Tiles return to rack if invalid
- Turn passes to next player if valid
- New tiles drawn to refill rack to 7

---

### US-008: Pass Turn
**As a** player on my turn
**I want to** pass my turn
**So that** I can skip if I cannot play

**Acceptance Criteria:**
- "Pass" button always available on my turn
- Turn immediately passes to next player
- Pass count tracked (game ends after 6 consecutive passes)
- No penalty for passing

---

### US-009: Exchange Tiles
**As a** player on my turn
**I want to** exchange some or all of my tiles
**So that** I can get better letters

**Acceptance Criteria:**
- "Exchange" button available if tiles remain in bag
- Select 1-7 tiles to exchange
- Exchanged tiles go back to bag
- Draw same number of new tiles
- Turn passes to next player
- Cannot exchange if fewer than 7 tiles remain in bag

---

### US-010: Use Blank Tile
**As a** player
**I want to** designate what letter a blank tile represents
**So that** I can use it flexibly

**Acceptance Criteria:**
- When placing blank, prompted to choose letter
- Letter choice shown on board
- Blank counts as 0 points
- Letter designation is permanent once submitted

---

## Epic: Game State

### US-011: See Turn Indicator
**As a** player
**I want to** know whose turn it is
**So that** I know when to play

**Acceptance Criteria:**
- Clear visual indicator of current player
- My turn highlighted prominently
- Player list shows turn order
- Timer shows time remaining (if implemented)

---

### US-012: View Scores
**As a** player
**I want to** see all players' scores
**So that** I know who is winning

**Acceptance Criteria:**
- Scoreboard visible at all times
- Shows all players and their scores
- Updates immediately after valid plays
- Sorted by score (highest first)

---

### US-013: View Tile Count
**As a** player
**I want to** see how many tiles remain in the bag
**So that** I know how close the game is to ending

**Acceptance Criteria:**
- Tile count displayed prominently
- Updates after each draw
- Shows "0" when bag is empty

---

### US-014: View Recent Plays
**As a** player
**I want to** see the last few plays
**So that** I can track game progress

**Acceptance Criteria:**
- Shows last 5 plays minimum
- Displays: player name, word, score
- Optional: highlight affected board positions

---

## Epic: Game End

### US-015: End Game
**As a** player
**I want to** see the final results when the game ends
**So that** I know who won

**Acceptance Criteria:**
- Game ends when:
  - One player uses all tiles and bag is empty
  - Six consecutive passes occur
- Final scores calculated (subtract remaining tile values)
- Winner announced
- Final scoreboard displayed
- Option to start new game

---

## Epic: Quality of Life

### US-016: Challenge Word (Future)
**As a** player
**I want to** challenge an opponent's word
**So that** invalid words can be caught

**Acceptance Criteria:**
- "Challenge" button appears after opponent plays
- If word invalid: opponent loses turn, tiles returned
- If word valid: challenger loses next turn
- Time limit on challenge (e.g., 30 seconds)

**Status:** Future enhancement

---

### US-017: Chat (Future)
**As a** player
**I want to** send messages to other players
**So that** we can communicate during the game

**Acceptance Criteria:**
- Simple chat box visible to all players
- Messages show sender name and timestamp
- Chat persists during game

**Status:** Future enhancement

---

### US-018: Save/Load Game (Future)
**As a** host
**I want to** save and resume games
**So that** we can continue later

**Acceptance Criteria:**
- "Save Game" button for host
- Game state saved to file
- "Load Game" option on server start
- All players can rejoin with same names

**Status:** Future enhancement
