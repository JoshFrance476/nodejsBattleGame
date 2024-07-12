let selectedTile = null;
let toggleMove = false;
let availableMoves = null;
let playerRole;
let socket;

document.addEventListener('DOMContentLoaded', () => {
    setupSocket();
    setupModalControls();
    setupMoveTroopButton();
    setupSquares();
    setupInitiateBattleButton();

    socket.emit('getBoard');
});



function setupSocket() {
    socket = io();
    playerRole = sessionStorage.getItem('playerRole');
    socket.emit('reconnection', playerRole);


    socket.on('boardData', (board) => {
        updateBoardUI(board);
    })

    socket.on('availableMoves', (moves) => {
        enableSquares(moves);
        availableMoves = moves;
        const moveTroopButton = document.getElementById('move-troops-button');
        moveTroopButton.textContent = "Cancel Move";
    })

    socket.on('tileInfo', (info) => {
        const tileLocation = document.querySelector('.tile-location')
        const tileFriendlyTroops = document.querySelector('.tile-friendly-troops')
        const tileEnemyTroops = document.querySelector('.tile-enemy-troops')
        const tileMoveTroopInput = document.getElementById('move-troop-count')
        
        tileLocation.textContent = selectedTile.id;
        tileFriendlyTroops.textContent = info.friendlyTroops;
        tileEnemyTroops.textContent = info.enemyTroops;
        tileMoveTroopInput.max = info.friendlyTroops;
        tileMoveTroopInput.value = info.friendlyTroops;
        const initiateBattleButton = document.getElementById('initiate-battle-button');
        if (Number(info.friendlyTroops) > 0 && Number(info.enemyTroops) > 0)
        {
            initiateBattleButton.classList.remove('hidden');
        }
        else {
            initiateBattleButton.classList.add('hidden');
        }
    })
}




function setupModalControls() {
    const tileInfoModal = document.querySelector('.modal');
    const closeModalButton = document.querySelector('.close-button');
    closeModalButton.addEventListener('click', () => {
        tileInfoModal.classList.remove('open');
        
    });
}

function setupInitiateBattleButton() {
    const initiateBattleButton = document.getElementById('initiate-battle-button');
    initiateBattleButton.addEventListener('click', handleInitiateBattleButtonClick)
}

function handleInitiateBattleButtonClick() {
    if (selectedTile)
    {
        socket.emit('initiateBattle', selectedTile.id);
    }
    else{
        console.warn('selectedTile is null when trying to initiate battle' + selectedTile);
    }
}

function setupMoveTroopButton() {
    const moveTroopButton = document.getElementById('move-troops-button');
    moveTroopButton.addEventListener('click', handleMoveTroopButtonClick);
}

function handleMoveTroopButtonClick() {
    const moveTroopButton = document.getElementById('move-troops-button');
    if (toggleMove) {
        toggleMove = false;
        enableSquares();
        moveTroopButton.textContent = "Move Troops";
    } else if (selectedTile) {
        toggleMove = true;
        socket.emit('getAvailableMoves', selectedTile.id)
    }
}

function setupSquares() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.addEventListener('click', handleSquareClick);
    });
}

function handleSquareClick(event) {
    const squareElement = event.target.closest('.square');
    if (!squareElement) return;

    const squareId = squareElement.id;
    const tileMoveTroopInput = document.getElementById('move-troop-count');

    if (toggleMove) {
        socket.emit('moveTroops', {
            squareIdTo: squareId,
            squareIdFrom: selectedTile.id,
            troopCount: Number(tileMoveTroopInput.value)
        })
        selectSquare(squareElement);
        resetMoveState();
    } else {
        selectSquare(squareElement);
    }
}

function resetMoveState() {
    const moveTroopButton = document.getElementById('move-troops-button');
    moveTroopButton.textContent = "Move Troops";
    toggleMove = false;
}


function selectSquare(square) {   
    socket.emit('getTileInfo', square.id)

    const tileInfoModal = document.querySelector('.modal');

    selectedTile = square;

    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected'));
    square.classList.add('selected');
    tileInfoModal.classList.add('open');
}

function enableSquares(squaresToEnable = null) {
    const squares = document.querySelectorAll('.square');

    if (squaresToEnable) {
        const squareIds = squaresToEnable.tiles.map(id => id.toString());
        squares.forEach(square => {
            if (!squareIds.includes(square.id)) {
                square.classList.add('not-available');
            }
        });
    } else {
        squares.forEach(square => {
            square.classList.remove('not-available');
        });
    }
}

function updateBoardUI(updatedBoard) {
    updatedBoard.forEach(squareobj => {
        const square = document.getElementById(squareobj.id);
        const tileDisplay = square.querySelector('.tile-display');
        if (squareobj.friendlyTroops > 0 && squareobj.enemyTroops > 0)
        {
            tileDisplay.innerHTML = `<span class="troop-display friendly">${squareobj.friendlyTroops}</span>/<span class="troop-display enemy">${squareobj.enemyTroops}</span>`;
        }
        else if (squareobj.friendlyTroops > 0)
        {
            tileDisplay.innerHTML = `<span class="troop-display friendly">${squareobj.friendlyTroops}</span>`;
        }
        else if (squareobj.enemyTroops > 0)
        {
            tileDisplay.innerHTML = `<span class="troop-display enemy">${squareobj.enemyTroops}</span>`;
        }
        else {
            tileDisplay.innerHTML = ``;
        }
        
        square.classList.remove('not-available');
    });
}
