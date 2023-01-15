import kaboom from "kaboom"

kaboom({
  background: [0, 0, 0],
  width: 1000,
  height: 600
})

let script = document.createElement("script");
script.src = 'https://tic-tac-toe-server.finn765.repl.co' + '/socket.io/socket.io.js'
document.head.appendChild(script);

scene("startGame", () => {
  const SCREEN_WIDTH = 1000;
  const SCREEN_HEIGHT = 600;

  add([
    text("What's your name? ", { size: 32, font: "sinko" }),
    pos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 3),
    origin("center")
  ]);

  const nameField = add([
    text("", { size: 32, font: "sinko" }),
    pos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2),
    origin("center")
  ]);

  charInput((ch) => {
    nameField.text += ch;
  });

  keyRelease("enter", () => {
    console.log('GO: "gamemode"')
    go("gamemode", { playerName: nameField.text });
  })

});

go("startGame");

scene("gamemode", ({ playerName }) => {
  const SCREEN_WIDTH = 1000;
  const SCREEN_HEIGHT = 600;

  add([
    text("What gamemode? (daily / unlimited) ", { size: 32, font: "sinko" }),
    pos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 3),
    origin("center")
  ]);

  const gameModeField = add([
    text("", { size: 32, font: "sinko" }),
    pos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2),
    origin("center")
  ]);

  charInput((ch) => {
    gameModeField.text += ch;
  });
  
  keyRelease("enter", () => {
    if (gameModeField.text === "daily") {
      go("dailyMain", { playerName });
    } else {
      console.log('GO: "unlimitedMain"')
      go("unlimitedMain", { playerName });
    }
  })

});

scene ("dailyMain", ({ playerName }) => {
  const SCREEN_WIDTH = 1000;
  const SCREEN_HEIGHT = 600;
  
  add([
    text("daily gme mode, player: " + playerName, { size: 24, font: "sinko" }),
    pos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 5),
    origin("center")
  ]);
})

scene("unlimitedMain", ({ playerName }) => {
  const SCREEN_WIDTH = 1000;
  const SCREEN_HEIGHT = 600;

  const MaxNumWords = 3;
  let gridCells = [];
  let gridSize = 5;
  const boardWidth = 400;

  add([
    text("unlimited game mode, player: " + playerName, { size: 24, font: "sinko" }),
    pos(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 10),
    origin("center")
  ]);

  let scrabbleValues = [
    ['a', 9],
    ['b', 2],
    ['c', 2],
    ['d', 4],
    ['e', 12],
    ['f', 2],
    ['g', 3],
    ['h', 2],
    ['i', 9],
    ['j', 1],
    ['k', 1],
    ['l', 4],
    ['m', 2],
    ['n', 6],
    ['o', 8],
    ['p', 2],
    ['q', 1],
    ['r', 6],
    ['s', 4],
    ['t', 6],
    ['u', 4],
    ['v', 2],
    ['w', 2],
    ['x', 1],
    ['y', 2],
    ['z', 1]
  ]

  let grid = [] 
  const scrabbleLetters = [];
  scrabbleValues.forEach(([letter, value]) => {
    for (let i = 0; i < value; i++) {
      scrabbleLetters.push(letter);
    }
  });

  //do {
    for (i = 0; i < gridSize; i++) {
      for (j = 0; j < gridSize; j++) {
        grid[i, j] = scrabbleLetters[Math.floor(Math.random() * scrabbleLetters.length)];
        console.log(grid[i,j])
      }
    }
    //findWords(gridSize, grid, 3, true);
  //} while (foundWords.Count != MaxNumWords);

  
  drawGrid(gridCells, gridSize, boardWidth, grid)



  // Players and game status elements
  const playerOneLabel = add([
    text('', { size: 20, font: "sinko" }),
    pos(600, 100),
  ]);
  const playerTwoLabel = add([
    text('', { size: 20, font: "sinko" }),
    pos(600, 150),
  ]);
  const statusLabel = add([
    text('', { size: 20, font: "sinko" }),
    pos(600, 200),
    color(0, 255, 0)
  ])
  var socket = io('https://tic-tac-toe-server.finn765.repl.co');
  socket.on('connect', function() {
    socket.emit("addPlayer", {
      playerName: playerName
    });
  });
  const Statuses = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    DRAW: 'draw',
    WIN: 'win'
  }
  socket.on('gameState', function(state) {
    for (let index = 0; index < state.board.length; index++) {
      const player = state.board[index];
      if (player != null) {
        boardSquares[index].textBox.text = player.symbol;
      } else {
        boardSquares[index].textBox.text = '';
      }
    }

    statusLabel.text = '';
    switch (state.result.status) {
      case Statuses.WAITING:
        statusLabel.text = 'Waiting for players....';
        break;
      case Statuses.PLAYING:
        statusLabel.text = state.currentPlayer.playerName + ' to play';
        break;
      case Statuses.DRAW:
        statusLabel.text = 'Draw! \nPress R for rematch';
        break;
      case Statuses.WIN:
        statusLabel.text = state.result.winner.playerName + ' Wins! \nPress R for rematch';
        break;
      default:
        break;
    }

    playerOneLabel.text = '';
    playerTwoLabel.text = '';
    if (state.players.length > 0) {
      playerOneLabel.text = state.players[0].symbol + ': ' + state.players[0].playerName;
    }

    if (state.players.length > 1) {
      playerTwoLabel.text = state.players[1].symbol + ': ' + state.players[1].playerName;
    }

  });
  mouseRelease(() => {
    const mpos = mousePos();
    // find the square we clicked on
    for (let index = 0; index < boardSquares.length; index++) {
      const square = boardSquares[index];
      if (mpos.x > square.x
        && mpos.x < square.x + square.width
        && mpos.y > square.y
        && mpos.y < square.y + square.height) {
        socket.emit("action", {
          gridIndex: square.index
        });
        break;
      }
    }
  });
  charInput((ch) => {
    if (ch === 'r' || ch === 'R') {
      socket.emit("rematch", null)
    }
  });

});


function drawGrid(gridCells, gridSize, boardWidth, grid) {
  let gapSize = (boardWidth/gridSize)/8
  let cellSize = (boardWidth/gridSize) - gapSize
  
  // Board
  for (i = 1; i <= gridSize; i++) {
    for (j = 1; j <=gridSize; j++) {
      add([
        pos(i*cellSize + gapSize, j*cellSize + gapSize),
        rect(cellSize, cellSize),
        color(50,50,50),
        outline(12),
        area(),
      ])
      gridCells.push({ index: i, x: i*cellSize + gapSize, y: j*cellSize + gapSize, width: cellSize, height: cellSize })
    }
  }
  createTextBoxesForGrid(gridCells, grid);
}

function createTextBoxesForGrid(gridCells, grid){
  gridCells.forEach((cell)=>{
    let x = cell.x + cell.width*0.5;
    let y = cell.y + cell.height*0.55;
    cell.textBox = add([
      text(grid[cell.x, cell.y], 40),
      pos(x, y),
      origin('center')
    ]);
  })
}
