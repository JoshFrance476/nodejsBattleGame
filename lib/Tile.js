export default class Tile {
    /**
     * @param {int} x 
     * @param {int} y 
     * @param {int} friendlyTroops 
     * @param {int} enemyTroops 
     */
    constructor(x, y, friendlyTroops, enemyTroops) {
      this.x = x;
      this.y = y;
      this.friendlyTroops = friendlyTroops;
      this.enemyTroops = enemyTroops;
      this.id = `${x},${y}`;
    }
  
    /**
     * @returns {object} Dictionary {friendlyTroops, enemyTroops}
     */
    getInfo() {
      return {
        friendlyTroops: this.friendlyTroops,
        enemyTroops: this.enemyTroops
      };
    }
}