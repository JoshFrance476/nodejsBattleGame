import Tile from './Tile.js';

/**
 * Represents the game board.
 */
export default class Board {
    /**
     * Creates an instance of Board.
     * @param {number} gridx - Number of tiles in the x-axis.
     * @param {number} gridy - Number of tiles in the y-axis.
     */
    constructor(gridx, gridy){
    this.hostBoard = [];
    this.guestBoard =[];
    this.selectedTile = null;
    for (let i = 0; i<gridy; i++)
    {
      for (let j = 0; j < gridx; j++)
      {
        if (j == 8) {
          this.hostBoard.push(new Tile(i, j, 10, 0))
          this.guestBoard.push(new Tile(i, j, 0, 10))
        }
        else if (j == gridx - 9) {
          this.hostBoard.push(new Tile(i, j, 0, 10))
          this.guestBoard.push(new Tile(i, j, 10, 0))
        }
        else {
          this.hostBoard.push(new Tile(i, j, 0, 0))
          this.guestBoard.push(new Tile(i, j, 0, 0))
        }
          
      }

    }};


    updateBoard(client) {
      if (client == 'guest') {
        for (let i=0; i<this.hostBoard.length;i++) {
          let tileToCopy = this.hostBoard[i];
          let copiedTile = new Tile(tileToCopy.x, tileToCopy.y, tileToCopy.enemyTroops, tileToCopy.friendlyTroops);
          this.guestBoard[i] = copiedTile;
        }
      }
      else if (client == 'host') {
        for (let i=0; i<this.guestBoard.length;i++) {
          let tileToCopy = this.guestBoard[i];
          let copiedTile = new Tile(tileToCopy.x, tileToCopy.y, tileToCopy.enemyTroops, tileToCopy.friendlyTroops);
          this.hostBoard[i] = copiedTile;
        }
      }
    }


    getBoard(client) {
      if (client == 'host') {
        return this.hostBoard;
      }
      else if (client == 'guest') {
        return this.guestBoard;
      }
    }

    
    /**
     * returns tile object from string representation of tile's id
     * @param {string} tileId - string format of tileId. Example '3,2'
     * @returns {Tile} tileobject
     */
    getTile(tileId, client) {
      if (client == 'host') {
        return this.hostBoard.find(tile => tile.id === tileId);
      }
      else if (client == 'guest') {
        return this.guestBoard.find(tile => tile.id === tileId);
      }
    }
  
    /**
     * returns available moves from tileIdFrom
     * @param {string} tileIdFrom - string format of tileId to move from. Example '3,2'
     * @returns {string[]} array of tile's id in string format. Example ['2,2','4,2','3,3','3,1']
     */
    getAvailableMoves(tileIdFrom) {
      this.selectedTile = this.getTile(tileIdFrom);
      const [x, y] = tileIdFrom.split(',').map(Number);
      const availableTiles = [
        `${x - 1},${y}`,
        `${x + 1},${y}`,
        `${x},${y - 1}`,
        `${x},${y + 1}`,
      ];
      return availableTiles;
    }
  
    /**
     * moves troops from one tile to another if move is validated
     * @param {string} tileIdTo - must be tileId returned by .getAvailableMoves(tileIdFrom)
     * @param {string} tileIdFrom
     * @param {number} troopCount - must be <= to tileIdFrom's troop count
     */
    moveTroops(tileIdTo, tileIdFrom, troopCount, client) {
      const tileTo = this.getTile(tileIdTo, client);
      const tileFrom = this.getTile(tileIdFrom, client);
      const availableMoves = this.getAvailableMoves(tileIdFrom);
  
      if (availableMoves.includes(tileIdTo) && troopCount <= tileFrom.friendlyTroops) {
        tileTo.friendlyTroops += troopCount;
        tileFrom.friendlyTroops -= troopCount;
      } else {
        console.log("Invalid move");
      }
    }
  
    initiateBattle(tileId){
      const tile = this.getTile(tileId, 'host');
      if (tile.friendlyTroops > 0 && tile.enemyTroops > 0)
      {
        if (tile.friendlyTroops >= tile.enemyTroops)
        {
          tile.friendlyTroops = tile.friendlyTroops - tile.enemyTroops;
          tile.enemyTroops = 0;
        }
        else {
          tile.enemyTroops = tile.enemyTroops - tile.friendlyTroops;
          tile.friendlyTroops = 0;
        }
      }
      else {
        console.log("Invalid battle")
      }
    }
}