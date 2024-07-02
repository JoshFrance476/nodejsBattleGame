import express from 'express';
const app = express();
const port = 3000;

import Board from './lib/Board.js';

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());


const currentBoard = new Board(20, 10)


app.get('/', (req, res) => {
    res.render('index', {board: currentBoard.board});
})

app.post('/get-board', (req, res) => {
  res.json(currentBoard.board);
})

app.post('/move-troops', (req, res) => {
  const { squareIdTo, squareIdFrom, troopCount } = req.body;
  currentBoard.moveTroops(squareIdTo, squareIdFrom, troopCount);
  res.json(currentBoard.board);
});


app.post('/get-available-moves', (req, res) => {
  const { squareId } = req.body;
  const availableTiles = currentBoard.getAvailableMoves(squareId); 
  const availableMoves = {
    tiles: availableTiles
  }
  res.json(availableMoves);
})


app.post('/get-tile-info', (req, res) => {
  const { squareId } = req.body;
  const tileInfo = currentBoard.getTile(squareId).getInfo();
  res.json( tileInfo );
})

app.post('/initiate-battle', (req, res) => {
  const { squareId } = req.body;
  currentBoard.initiateBattle(squareId);
  res.json(currentBoard.board);
})

app.listen(port, () => {
    console.log(`Battle game server listening at http://localhost:${port}`);
});
