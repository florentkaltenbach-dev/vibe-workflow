# Integration Test Scenarios

## Test Environment Setup

### Dependencies
- Socket.io-client for testing WebSocket connections
- Supertest for HTTP endpoint testing
- Jest for test framework

### Test Server
- Run actual server on test port (e.g., 3001)
- Load test dictionary with known words
- Clean state between tests

---

## Scenario 1: Complete Game Flow (Happy Path)

### Description
Two players join, play a complete game with multiple turns, and see correct final scores.

### Steps
1. **Setup**
   - Start server
   - Connect two socket.io clients (Alice, Bob)

2. **Join Game**
   - Alice joins with name "Alice"
   - Verify Alice receives `lobbyUpdate` with 1 player
   - Bob joins with name "Bob"
   - Verify both receive `lobbyUpdate` with 2 players
   - Verify `canStart: true`

3. **Start Game**
   - Alice (host) emits `startGame`
   - Verify both receive `gameStarted` event with:
     - Turn order
     - Current player ID
     - Empty board
     - Tile bag count = 100 - 14 = 86
   - Verify both receive `yourTiles` with 7 tiles each
   - Verify both receive `scoreUpdate` with scores [0, 0]

4. **First Turn (Alice)**
   - Alice submits word "CAT" at (7,7) horizontally
   - Verify Alice receives `wordAccepted` with score
   - Verify both receive `boardUpdate` with CAT placed
   - Verify both receive `scoreUpdate` with Alice's new score
   - Verify both receive `turnChange` with Bob as current player
   - Verify Alice receives `yourTiles` with new tiles

5. **Second Turn (Bob)**
   - Bob submits word "CATS" extending Alice's word
   - Verify Bob receives `wordAccepted`
   - Verify both receive `boardUpdate`
   - Verify both receive `scoreUpdate`
   - Verify both receive `turnChange` back to Alice

6. **Pass Turn**
   - Alice emits `passTurn`
   - Verify both receive `turnChange` to Bob
   - Verify consecutive passes count increases

7. **Game End (6 consecutive passes)**
   - Players pass 5 more times
   - On 6th pass, verify both receive `gameEnded` with:
     - Reason: 'consecutivePasses'
     - Final scores
     - Winner

8. **Cleanup**
   - Disconnect clients
   - Stop server

### Expected Results
- All events received in correct order
- Board state consistent across clients
- Scores calculated correctly
- Game ends properly

---

## Scenario 2: Invalid Word Submission

### Description
Player attempts to submit an invalid word and receives rejection.

### Steps
1. Start game with 2 players
2. Current player submits invalid word "XYZQ"
3. Verify player receives `wordRejected` with:
   - Reason message
   - Invalid words list: ['XYZQ']
4. Verify board unchanged
5. Verify turn remains with same player
6. Player submits valid word
7. Verify word accepted and turn advances

### Expected Results
- Invalid word rejected
- Valid word accepted
- Turn only advances on valid word

---

## Scenario 3: Player Disconnection During Game

### Description
Player disconnects mid-game and game continues with remaining players.

### Steps
1. Start game with 3 players (Alice, Bob, Charlie)
2. Alice plays a turn successfully
3. Bob disconnects (socket.disconnect())
4. Verify remaining players receive `playerDisconnected` event
5. Verify turn advances to Charlie (skipping Bob)
6. Charlie plays a turn
7. Verify game continues normally
8. Complete game with 2 players

### Expected Results
- Disconnected player marked as disconnected
- Turn automatically skips disconnected player
- Game continues with remaining players
- Final scores include disconnected player (with current score)

---

## Scenario 4: Concurrent Word Submission (Race Condition)

### Description
Two players attempt to submit words simultaneously (out of turn).

### Steps
1. Start game with 2 players
2. Alice's turn starts
3. Bob (not current player) attempts to submit word
4. Verify Bob receives error "Not your turn"
5. Verify Bob's submission ignored
6. Alice submits valid word
7. Verify Alice's word accepted
8. Turn advances to Bob

### Expected Results
- Only current player's submission accepted
- Out-of-turn submissions rejected with error
- Game state remains consistent

---

## Scenario 5: Tile Exchange Flow

### Description
Player exchanges tiles successfully.

### Steps
1. Start game with 2 players
2. Current player emits `exchangeTiles` with indices [0, 2, 4]
3. Verify player receives `tilesExchanged` event
4. Verify player receives `yourTiles` with new tile set
5. Verify both players receive `turnChange` to next player
6. Verify tile bag count decreased by 0 (exchanged tiles returned)

### Expected Results
- Player receives different tiles
- Turn advances after exchange
- Tile count remains balanced

---

## Scenario 6: First Move Must Touch Center

### Description
Validates first move placement rules.

### Steps
1. Start game with 2 players
2. Current player submits word NOT touching center (7,7)
3. Verify receives `wordRejected` with "First word must touch center"
4. Current player submits word touching center
5. Verify word accepted

### Expected Results
- First move enforced to touch center
- Subsequent moves don't require center

---

## Scenario 7: Cross Word Formation

### Description
Player places word that forms multiple valid words (main + cross).

### Steps
1. Start game with 2 players
2. Player 1 plays "CAT" horizontally at (7,7)
3. Player 2 plays "BAR" vertically, with 'A' at (7,8) creating "CAR" + "BAT"
4. Verify both words validated
5. Verify score includes both words
6. Verify both receive `boardUpdate` with new tiles

### Expected Results
- Multiple words validated
- Combined score calculated
- Board updated correctly

---

## Scenario 8: Bingo Bonus (Using All 7 Tiles)

### Description
Player uses all 7 tiles in one turn and receives bingo bonus.

### Steps
1. Start game with 2 players
2. Current player submits 7-tile word
3. Verify word accepted
4. Verify score includes +50 bingo bonus
5. Verify player draws 7 new tiles

### Expected Results
- Bingo bonus applied
- Player racks refilled to 7 tiles

---

## Scenario 9: Game End - Empty Tile Bag

### Description
Game ends when a player uses all tiles and bag is empty.

### Steps
1. Set up game with minimal tiles remaining
2. Current player places final tiles
3. Verify both receive `gameEnded` with reason 'allTilesPlayed'
4. Verify final scores account for opponent's remaining tiles
5. Verify winner declared

### Expected Results
- Game ends when tiles exhausted
- Remaining tile penalties applied
- Winner calculated correctly

---

## Scenario 10: HTTP Endpoint Integration

### Description
Test HTTP endpoints work correctly.

### Steps
1. Start server
2. GET /api/status
   - Verify returns server status
   - Verify player count correct
3. GET /api/dictionary/check/HELLO
   - Verify returns {word: 'HELLO', valid: true}
4. GET /api/dictionary/check/XYZQ
   - Verify returns {word: 'XYZQ', valid: false}
5. GET /
   - Verify returns HTML page

### Expected Results
- All endpoints respond correctly
- Status reflects current game state
- Dictionary checks accurate

---

## Scenario 11: Multiple Clients Board Synchronization

### Description
Verify all connected clients see identical board state.

### Steps
1. Start game with 4 players
2. Each player takes a turn
3. After each turn, query board state from all clients
4. Verify all boards identical
5. Verify all scoreboards identical
6. Verify all see same current player

### Expected Results
- Perfect synchronization across all clients
- No state drift
- All receive same events

---

## Scenario 12: Name Collision in Lobby

### Description
Two players attempt to join with same name.

### Steps
1. Connect client 1
2. Client 1 joins as "Alice"
3. Connect client 2
4. Client 2 attempts to join as "Alice"
5. Verify client 2 receives error with code 'NAME_TAKEN'
6. Client 2 joins as "Bob"
7. Verify successful join

### Expected Results
- Duplicate names rejected
- Error code provided
- Unique names accepted

---

## Scenario 13: Lobby to Game Transition

### Description
Test lobby mechanics and game start.

### Steps
1. Connect client 1 (Alice)
2. Verify receives `lobbyUpdate` with canStart: false
3. Alice attempts to start game
4. Verify receives error 'Need at least 2 players'
5. Connect client 2 (Bob)
6. Verify both receive `lobbyUpdate` with canStart: true
7. Bob (non-host) attempts to start
8. Verify Bob receives error 'Only host can start'
9. Alice starts game
10. Verify game starts successfully

### Expected Results
- Minimum player count enforced
- Only host can start
- Lobby state updated correctly

---

## Scenario 14: Blank Tile Handling

### Description
Player uses blank tile and designates letter.

### Steps
1. Start game
2. Give current player a blank tile (test setup)
3. Player submits word using blank as 'E'
4. Verify word validated with 'E'
5. Verify blank counts as 0 points in score
6. Verify board shows designated letter

### Expected Results
- Blank tile accepts any letter designation
- Scores correctly (0 points)
- Board displays chosen letter

---

## Scenario 15: Stress Test - Rapid Actions

### Description
Multiple players perform actions rapidly.

### Steps
1. Start game with 4 players
2. Players submit actions as quickly as possible
3. Mix of valid/invalid submissions
4. Include disconnects and reconnects
5. Monitor for race conditions
6. Verify game state remains consistent

### Expected Results
- No crashes or hangs
- All actions processed correctly
- State consistency maintained
- Appropriate errors for invalid actions

---

## Test Coverage Goals

- **User Flows**: All user stories from /1-design/user-stories tested
- **Error Paths**: All error scenarios covered
- **Edge Cases**: Boundary conditions tested
- **Concurrency**: Race conditions tested
- **State Sync**: Perfect synchronization verified

## Running Integration Tests

```bash
npm run test:integration
```

## CI/CD Integration

Integration tests should run:
- Before every deployment
- On every pull request
- Nightly for full regression suite
