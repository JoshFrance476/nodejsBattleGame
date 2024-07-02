let selectedTile = null;
let toggleMove = false;
let availableMoves = null;

document.addEventListener('DOMContentLoaded', () => {
    setupBoard();
    setupModalControls();
    setupMoveTroopButton();
    setupSquares();
    setupInitiateBattleButton();
});

async function setupBoard() {
    try {
        const response = await fetch('/get-board', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok)
        {
            const board = await response.json()
            updateBoardUI(board);
        }
    }
    catch (error)
    {
        console.error('Error setting up board', error)
    }
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

async function handleInitiateBattleButtonClick() {
    if (selectedTile)
    {
        try {
            const response = await fetch('/initiate-battle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ squareId: selectedTile.id })
            })
            if (response.ok) {
                const updatedBoard = await response.json();
                updateBoardUI(updatedBoard);
                selectSquare(selectedTile);

            }
        } catch (error)
        {
            console.error('Error initiating battle', error);
        }
    }
    else{
        console.warn('selectedTile is null when trying to initiate battle' + selectedTile);
    }
}

function setupMoveTroopButton() {
    const moveTroopButton = document.getElementById('move-troops-button');
    moveTroopButton.addEventListener('click', handleMoveTroopButtonClick);
}

async function handleMoveTroopButtonClick() {
    const moveTroopButton = document.getElementById('move-troops-button');
    if (toggleMove) {
        toggleMove = false;
        enableSquares();
        moveTroopButton.textContent = "Move Troops";
    } else if (selectedTile) {
        toggleMove = true;
        try {
            const response = await fetch('/get-available-moves', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ squareId: selectedTile.id })
            });

            if (response.ok) {
                availableMoves = await response.json();
                enableSquares(availableMoves);
                moveTroopButton.textContent = "Cancel Move";
            }
        } catch (error) {
            console.error('Error fetching available moves:', error);
        }
    }
}

function setupSquares() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.addEventListener('click', handleSquareClick);
    });
}

async function handleSquareClick(event) {
    const squareElement = event.target.closest('.square');
    if (!squareElement) return;

    const squareId = squareElement.id;
    const tileMoveTroopInput = document.getElementById('move-troop-count');

    if (toggleMove) {
        try {
            const response = await fetch('/move-troops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    squareIdTo: squareId,
                    squareIdFrom: selectedTile.id,
                    troopCount: Number(tileMoveTroopInput.value)
                })
            });

            if (response.ok) {
                const updatedBoard = await response.json();
                updateBoardUI(updatedBoard);
                selectSquare(squareElement);
                resetMoveState();
            }
        } catch (error) {
            console.error('Error moving troops:', error);
        }
    } else {
        selectSquare(squareElement);
    }
}

function resetMoveState() {
    const moveTroopButton = document.getElementById('move-troops-button');
    moveTroopButton.textContent = "Move Troops";
    toggleMove = false;
}


async function selectSquare(square) {
    const tileInfoModal = document.querySelector('.modal');
    const tileLocation = document.querySelector('.tile-location');
    const tileFriendlyTroops = document.querySelector('.tile-friendly-troops');
    const tileEnemyTroops = document.querySelector('.tile-enemy-troops');
    const tileMoveTroopInput = document.getElementById('move-troop-count');
    const initiateBattleButton = document.getElementById('initiate-battle-button');

    selectedTile = square;

    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected'));
    square.classList.add('selected');
    tileInfoModal.classList.add('open');

    try {
        const response = await fetch('/get-tile-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ squareId: square.id })
        });

        if (response.ok) {
            const squareInfo = await response.json();
            tileLocation.textContent = square.id;
            tileFriendlyTroops.textContent = squareInfo.friendlyTroops;
            tileEnemyTroops.textContent = squareInfo.enemyTroops;
            tileMoveTroopInput.max = squareInfo.friendlyTroops;
            tileMoveTroopInput.value = squareInfo.friendlyTroops;
            if (Number(squareInfo.friendlyTroops) > 0 && Number(squareInfo.enemyTroops) > 0)
            {
                initiateBattleButton.classList.remove('hidden');
            }
            else {
                initiateBattleButton.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Error fetching tile info:', error);
    }
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
