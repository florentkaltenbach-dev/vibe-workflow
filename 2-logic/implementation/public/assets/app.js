// Client application
const socket = io('http://localhost:3000');

const clientState = {
  myId: null,
  myName: null,
  myTiles: [],
  board: createEmptyBoard(),
  players: [],
  currentPlayerId: null,
  gamePhase: 'lobby',
  pendingMove: [],
  tileBagCount: 100,
  draggedTile: null,
  draggedTileIndex: null,
};

function createEmptyBoard() {
  return Array(15).fill(null).map(() => Array(15).fill(null));
}

// Socket listeners
socket.on('connect', () => {
  clientState.myId = socket.id;
  console.log('Connected to server');
});

socket.on('lobbyUpdate', (data) => {
  clientState.players = data.players;
  renderLobby(data.players, data.canStart);
});

socket.on('gameStarted', (data) => {
  clientState.gamePhase = 'playing';
  clientState.board = data.board;
  clientState.currentPlayerId = data.currentPlayerId;
  clientState.tileBagCount = data.tileBagCount;

  document.getElementById('lobby-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');

  renderBoard();
  renderTurnIndicator();
});

socket.on('yourTiles', (data) => {
  clientState.myTiles = data.tiles;
  renderMyTiles();
});

socket.on('boardUpdate', (data) => {
  clientState.board = data.board;
  renderBoard();

  if (data.lastPlay) {
    highlightLastPlay(data.lastPlay.positions);
  }
});

socket.on('turnChange', (data) => {
  clientState.currentPlayerId = data.currentPlayerId;
  renderTurnIndicator();

  if (isMyTurn()) {
    enableActionButtons();
    showNotification('Your turn!', 'success');
  } else {
    disableActionButtons();
  }
});

socket.on('wordAccepted', (data) => {
  showNotification(`'${data.word}' scored ${data.score} points!`, 'success');
  clearPendingMove();
});

socket.on('wordRejected', (data) => {
  let message = data.reason;
  if (data.invalidWords) {
    message += `: ${data.invalidWords.join(', ')}`;
  }
  showNotification(message, 'error');
});

socket.on('tilesExchanged', () => {
  showNotification('Tiles exchanged', 'success');
  clearPendingMove();
});

socket.on('scoreUpdate', (data) => {
  renderScoreboard(data.scores);
});

socket.on('tileBagUpdate', (data) => {
  clientState.tileBagCount = data.count;
  document.getElementById('tile-bag-count').textContent = `Tiles remaining: ${data.count}`;
});

socket.on('gameEnded', (data) => {
  clientState.gamePhase = 'ended';
  renderGameOver(data);
});

socket.on('playerDisconnected', (data) => {
  showNotification(`${data.playerName} disconnected`, 'error');
});

socket.on('error', (data) => {
  showNotification(data.message, 'error');
});

// UI Event Handlers
document.getElementById('join-button').addEventListener('click', () => {
  const name = document.getElementById('name-input').value.trim();

  if (name.length < 3 || name.length > 20) {
    document.getElementById('join-error').textContent = 'Name must be 3-20 characters';
    return;
  }

  clientState.myName = name;
  socket.emit('joinGame', { playerName: name });

  document.getElementById('join-screen').classList.add('hidden');
  document.getElementById('lobby-screen').classList.remove('hidden');
});

document.getElementById('name-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('join-button').click();
  }
});

document.getElementById('start-game-button').addEventListener('click', () => {
  socket.emit('startGame', {});
  document.getElementById('start-game-button').disabled = true;
});

document.getElementById('submit-button').addEventListener('click', () => {
  if (clientState.pendingMove.length === 0) {
    showNotification('Place tiles first', 'error');
    return;
  }

  socket.emit('submitWord', { placements: clientState.pendingMove });
  document.getElementById('submit-button').disabled = true;
});

document.getElementById('pass-button').addEventListener('click', () => {
  if (!isMyTurn()) {
    showNotification('Not your turn', 'error');
    return;
  }

  if (confirm('Are you sure you want to pass?')) {
    socket.emit('passTurn', {});
  }
});

document.getElementById('exchange-button').addEventListener('click', () => {
  if (!isMyTurn()) {
    showNotification('Not your turn', 'error');
    return;
  }

  const indices = promptTileSelection();
  if (indices && indices.length > 0) {
    socket.emit('exchangeTiles', { tileIndices: indices });
  }
});

document.getElementById('clear-button').addEventListener('click', () => {
  clearPendingMove();
});

// Rendering Functions
function renderLobby(players, canStart) {
  const playerList = document.getElementById('player-list');
  playerList.innerHTML = '';

  players.forEach((player) => {
    const li = document.createElement('li');
    li.textContent = `${player.name} ${player.isHost ? '(Host)' : ''}`;
    playerList.appendChild(li);
  });

  const isHost = players.length > 0 && players[0].id === clientState.myId;
  const startButton = document.getElementById('start-game-button');
  const status = document.getElementById('lobby-status');

  if (isHost && canStart) {
    startButton.classList.remove('hidden');
    status.textContent = '';
  } else if (isHost) {
    startButton.classList.add('hidden');
    status.textContent = 'Waiting for more players... (need at least 2)';
  } else {
    startButton.classList.add('hidden');
    status.textContent = 'Waiting for host to start the game...';
  }
}

function renderBoard() {
  const boardContainer = document.getElementById('board-container');
  let html = '<table id="game-board">';

  for (let row = 0; row < 15; row++) {
    html += '<tr>';
    for (let col = 0; col < 15; col++) {
      const square = clientState.board[row][col];
      const premiumType = getPremiumSquareType(row, col);
      const cssClass = `square ${premiumType.toLowerCase().replace('_', '-')}`;

      if (square) {
        html += `<td class="${cssClass} occupied">${renderTile(square)}</td>`;
      } else {
        const pendingTile = clientState.pendingMove.find((p) => p.row === row && p.col === col);
        if (pendingTile) {
          html += `<td class="${cssClass} pending" data-row="${row}" data-col="${col}">
            ${renderTile(pendingTile.tile)}
          </td>`;
        } else {
          html += `<td class="${cssClass}" data-row="${row}" data-col="${col}"
            ondragover="allowDrop(event)" ondrop="handleDrop(event)">
            <span class="premium-label">${getPremiumLabel(premiumType)}</span>
          </td>`;
        }
      }
    }
    html += '</tr>';
  }

  html += '</table>';
  boardContainer.innerHTML = html;
}

function renderTile(tile) {
  const letter = tile.isBlank ? tile.letter.toLowerCase() : tile.letter;
  const points = tile.isBlank ? '' : tile.points;
  return `<div class="tile">
    <span class="letter">${letter}</span>
    <span class="points">${points}</span>
  </div>`;
}

function renderMyTiles() {
  const rack = document.getElementById('tile-rack');
  rack.innerHTML = '';

  clientState.myTiles.forEach((tile, index) => {
    const usedInPending = clientState.pendingMove.some((p, i) =>
      clientState.draggedTileIndex !== null && i === clientState.pendingMove.length - 1 && clientState.draggedTileIndex === index
    );

    if (!usedInPending && !isPendingTile(index)) {
      const tileDiv = document.createElement('div');
      tileDiv.className = 'tile draggable';
      tileDiv.draggable = true;
      tileDiv.dataset.index = index;
      tileDiv.innerHTML = `
        <span class="letter">${tile.isBlank ? '_' : tile.letter}</span>
        <span class="points">${tile.points}</span>
      `;
      tileDiv.addEventListener('dragstart', handleTileDragStart);
      rack.appendChild(tileDiv);
    }
  });
}

function renderTurnIndicator() {
  const indicator = document.getElementById('turn-indicator');
  const currentPlayer = clientState.players.find((p) => p.id === clientState.currentPlayerId);

  if (isMyTurn()) {
    indicator.textContent = 'Your turn!';
    indicator.className = 'my-turn';
  } else if (currentPlayer) {
    indicator.textContent = `${currentPlayer.name}'s turn`;
    indicator.className = 'other-turn';
  }
}

function renderScoreboard(scores) {
  const scoreboard = document.getElementById('scoreboard');
  let html = '<tr><th>Player</th><th>Score</th></tr>';

  scores.forEach((score) => {
    const cssClass = score.playerId === clientState.myId ? 'my-score' : '';
    html += `<tr class="${cssClass}">
      <td>${score.playerName}</td>
      <td>${score.score}</td>
    </tr>`;
  });

  scoreboard.innerHTML = html;
}

function renderGameOver(data) {
  const modal = document.getElementById('game-over-modal');
  const content = document.getElementById('game-over-content');

  const reasonText = {
    allTilesPlayed: 'All tiles have been played!',
    consecutivePasses: 'All players passed - game over!',
    allPlayersDisconnected: 'All players disconnected',
  };

  let html = `
    <h1>${reasonText[data.reason]}</h1>
    <h2>Winner: ${data.winner.playerName}</h2>
    <h3>Final Score: ${data.winner.score}</h3>
    <h3>Final Scores:</h3>
    <table>
  `;

  data.finalScores.forEach((score) => {
    html += `<tr><td>${score.playerName}</td><td>${score.score}</td></tr>`;
  });

  html += `</table><button onclick="location.reload()">Play Again</button>`;

  content.innerHTML = html;
  modal.classList.remove('hidden');
}

// Drag and Drop
function handleTileDragStart(e) {
  const index = parseInt(e.target.dataset.index);
  clientState.draggedTile = clientState.myTiles[index];
  clientState.draggedTileIndex = index;
  e.dataTransfer.effectAllowed = 'move';
}

function allowDrop(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();

  if (!clientState.draggedTile) return;

  const cell = e.target.closest('td');
  if (!cell) return;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  if (isNaN(row) || isNaN(col)) return;

  let tile = { ...clientState.draggedTile };

  // Handle blank tile
  if (tile.isBlank) {
    const letter = prompt('Choose letter for blank tile (A-Z):');
    if (!letter || letter.length !== 1 || !/[A-Z]/i.test(letter)) {
      clientState.draggedTile = null;
      clientState.draggedTileIndex = null;
      return;
    }
    tile.letter = letter.toUpperCase();
  }

  clientState.pendingMove.push({ row, col, tile });

  clientState.draggedTile = null;
  clientState.draggedTileIndex = null;

  renderBoard();
  renderMyTiles();

  document.getElementById('submit-button').disabled = false;
  document.getElementById('clear-button').disabled = false;
}

// Helper Functions
function isMyTurn() {
  return clientState.currentPlayerId === clientState.myId;
}

function isPendingTile(tileIndex) {
  return clientState.pendingMove.some((_, i) =>
    clientState.draggedTileIndex !== null && i === clientState.pendingMove.length - 1
  );
}

function clearPendingMove() {
  clientState.pendingMove = [];
  renderBoard();
  renderMyTiles();
  document.getElementById('submit-button').disabled = true;
  document.getElementById('clear-button').disabled = true;
}

function enableActionButtons() {
  document.getElementById('pass-button').disabled = false;
  document.getElementById('exchange-button').disabled = false;
}

function disableActionButtons() {
  document.getElementById('submit-button').disabled = true;
  document.getElementById('pass-button').disabled = true;
  document.getElementById('exchange-button').disabled = true;
  document.getElementById('clear-button').disabled = true;
}

function highlightLastPlay(positions) {
  setTimeout(() => {
    positions.forEach((pos) => {
      const cell = document.querySelector(`td[data-row="${pos.row}"][data-col="${pos.col}"]`);
      if (cell) {
        cell.classList.add('last-play');
      }
    });

    setTimeout(() => {
      document.querySelectorAll('.last-play').forEach((cell) => {
        cell.classList.remove('last-play');
      });
    }, 3000);
  }, 100);
}

function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;

  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

function promptTileSelection() {
  const message = 'Enter tile numbers to exchange (0-6), comma-separated:';
  const input = prompt(message);

  if (!input) return null;

  const indices = input
    .split(',')
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n) && n >= 0 && n < 7);

  return indices;
}

function getPremiumSquareType(row, col) {
  const tripleWord = [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]];
  if (tripleWord.some(([r, c]) => r === row && c === col)) return 'TRIPLE_WORD';

  const doubleWord = [
    [1, 1], [2, 2], [3, 3], [4, 4], [1, 13], [2, 12], [3, 11], [4, 10],
    [13, 1], [12, 2], [11, 3], [10, 4], [13, 13], [12, 12], [11, 11], [10, 10], [7, 7]
  ];
  if (doubleWord.some(([r, c]) => r === row && c === col)) return 'DOUBLE_WORD';

  const tripleLetter = [
    [1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]
  ];
  if (tripleLetter.some(([r, c]) => r === row && c === col)) return 'TRIPLE_LETTER';

  const doubleLetter = [
    [0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12],
    [7, 3], [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]
  ];
  if (doubleLetter.some(([r, c]) => r === row && c === col)) return 'DOUBLE_LETTER';

  return 'NORMAL';
}

function getPremiumLabel(type) {
  const labels = {
    TRIPLE_WORD: 'TW',
    DOUBLE_WORD: 'DW',
    TRIPLE_LETTER: 'TL',
    DOUBLE_LETTER: 'DL',
    NORMAL: '',
  };
  return labels[type] || '';
}
