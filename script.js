// script.js

document.addEventListener("DOMContentLoaded", () => {
    const board = Array.from({ length: 4 }, () => Array(4).fill(0));
    const gameBoard = document.getElementById("game-board");
    const gameStatus = document.getElementById("game-status");
  
    let touchStartX = 0;
    let touchStartY = 0;
  
    // Initialize the game
    function startGame() {
      addNewTile();
      addNewTile();
      updateBoard();
      gameStatus.textContent = "";
    }
  
    // Add a new tile with value 2 at a random empty position
    function addNewTile() {
      const emptyTiles = [];
      board.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell === 0) emptyTiles.push([i, j]);
        });
      });
  
      if (emptyTiles.length > 0) {
        const [row, col] = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[row][col] = 2;
      }
    }
  
    // Update the game board visually
    function updateBoard() {
      gameBoard.innerHTML = "";
      board.forEach(row => {
        row.forEach(value => {
          const tile = document.createElement("div");
          tile.classList.add("tile");
          if (value !== 0) {
            tile.textContent = value;
            tile.dataset.value = value;
          }
          gameBoard.appendChild(tile);
        });
      });
    }
  
    // Handle moves
    function move(direction) {
      let moved = false;
  
      for (let i = 0; i < 4; i++) {
        let row = board[i];
        if (direction === "right" || direction === "left") {
          row = direction === "right" ? row.reverse() : row;
          const { mergedRow, changed } = compressAndMerge(row);
          if (changed) moved = true;
          board[i] = direction === "right" ? mergedRow.reverse() : mergedRow;
        } else {
          let column = board.map(row => row[i]);
          column = direction === "down" ? column.reverse() : column;
          const { mergedRow, changed } = compressAndMerge(column);
          if (changed) moved = true;
          column = direction === "down" ? mergedRow.reverse() : mergedRow;
          column.forEach((value, j) => (board[j][i] = value));
        }
      }
  
      if (moved) {
        addNewTile();
        updateBoard();
        checkGameState();
      }
    }
  
    // Combine tiles and handle compression
    function compressAndMerge(row) {
      const nonZeroTiles = row.filter(value => value !== 0);
      let mergedRow = [];
      let changed = false;
  
      for (let i = 0; i < nonZeroTiles.length; i++) {
        if (nonZeroTiles[i] === nonZeroTiles[i + 1]) {
          mergedRow.push(nonZeroTiles[i] * 2);
          i++; // Skip the next tile as it's merged
          changed = true;
        } else {
          mergedRow.push(nonZeroTiles[i]);
        }
      }
      while (mergedRow.length < 4) mergedRow.push(0);
      if (JSON.stringify(mergedRow) !== JSON.stringify(row)) changed = true;
  
      return { mergedRow, changed };
    }
  
    // Check the game state (Win/Loss)
    function checkGameState() {
      const hasEmpty = board.some(row => row.includes(0));
      const hasMove = canMakeMove();
  
      if (!hasEmpty && !hasMove) {
        gameStatus.textContent = "Game Over!";
        disableInput();
      } else if (board.flat().includes(2048)) {
        gameStatus.textContent = "Congratulations! You Won!";
        disableInput();
      }
    }
  
    // Check if any move is possible
    function canMakeMove() {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (j < 3 && board[i][j] === board[i][j + 1]) return true; // Check right
          if (i < 3 && board[i][j] === board[i + 1][j]) return true; // Check down
        }
      }
      return false;
    }
  
    // Disable keyboard input when the game is over
    function disableInput() {
      document.removeEventListener("keydown", handleKeyPress);
      gameBoard.removeEventListener("touchstart", handleTouchStart);
      gameBoard.removeEventListener("touchend", handleTouchEnd);
    }
  
    // Handle keypresses for movement
    function handleKeyPress(e) {
      if (e.key === "ArrowUp") move("up");
      else if (e.key === "ArrowDown") move("down");
      else if (e.key === "ArrowLeft") move("left");
      else if (e.key === "ArrowRight") move("right");
    }
  
    // Handle touch start for swipe detection
    function handleTouchStart(e) {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }
  
    // Handle touch end for swipe detection
    function handleTouchEnd(e) {
      const touch = e.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
  
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
  
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) move("right");
        else move("left");
      } else {
        if (deltaY > 0) move("down");
        else move("up");
      }
    }
  
    // Add event listener for keypresses
    document.addEventListener("keydown", handleKeyPress);
  
    // Add event listeners for touch input
    gameBoard.addEventListener("touchstart", handleTouchStart);
    gameBoard.addEventListener("touchend", handleTouchEnd);
  
    // Start the game
    startGame();
  });
  