import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Board from './lib/Board.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());


const currentBoard = new Board(20, 10)

let hostPlayer;
let guestPlayer;

let currentPlayer;



io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  function sendBoard() {
    currentBoard.updateBoard(currentPlayer)
    io.to(hostPlayer).emit('boardData', currentBoard.getBoard('host'));
    io.to(guestPlayer).emit('boardData', currentBoard.getBoard('guest'));
  }

  socket.on('reconnection', (playerRole) => {
    if (playerRole == "host") {
      hostPlayer = socket.id;
      currentPlayer = 'host';
    }
    else if (playerRole == "guest") {
      guestPlayer = socket.id;
    }
  })

  socket.on('hostJoining', () => {
    if (hostPlayer === socket.id) {
      console.log('You are already host.');
    }
    else if (!hostPlayer) {
      hostPlayer = socket.id;
      console.log('Host Player joined: ', hostPlayer);
      io.emit('hostJoined', hostPlayer);
    }
    else {
      console.log('Host player already exists. Try joining as guest.');
    }
  });

  socket.on('guestJoining', () => {
    if (!hostPlayer) {
      console.log('There is no host. Join as host instead.');
    }
    else if (guestPlayer === socket.id) {
      console.log('You are already guest.');
    }
    else if (!guestPlayer) {
      guestPlayer = socket.id;
      console.log('Guest player joined.', guestPlayer);
      io.emit('guestJoined', guestPlayer);
    }
    else {
      console.log('There is already a guest player.');
    }
  });

  socket.on('gameStarting', () => {
    console.log('Game Starting');
    io.emit('gameStarted');
  });

  socket.on('getBoard', () => {
    sendBoard();
  });

  socket.on('moveTroops', ({ squareIdTo, squareIdFrom, troopCount }) => {
    if (socket.id == hostPlayer && currentPlayer == 'host') {
      currentBoard.moveTroops(squareIdTo, squareIdFrom, troopCount, 'host');
      currentPlayer = 'guest';
    }
    else if (socket.id == guestPlayer && currentPlayer == 'guest') {
      currentBoard.moveTroops(squareIdTo, squareIdFrom, troopCount, 'guest');
      currentPlayer = 'host';
    }
    sendBoard();
  })

  socket.on('getAvailableMoves', squareId => {
    const availableTiles = currentBoard.getAvailableMoves(squareId);
    socket.emit('availableMoves', { tiles: availableTiles });
  });

  socket.on('getTileInfo', squareId => {
    let  tileInfo;
    if (socket.id == hostPlayer) {
      tileInfo = currentBoard.getTile(squareId, 'host').getInfo();
    }
    else if (socket.id == guestPlayer) {
      tileInfo = currentBoard.getTile(squareId, 'guest').getInfo();
    }
    
    socket.emit('tileInfo', tileInfo);
  });

  socket.on('initiateBattle', squareId => {
      currentBoard.initiateBattle(squareId);
      sendBoard();
  });
});

app.get('/', (req, res) => {
  res.render('menu');
});

app.get('/game', (req, res) => {
  res.render('game', { board: currentBoard.getBoard('host') });
});

httpServer.listen(port, () => {
    console.log(`Battle game server listening at http://localhost:${port}`);
});
