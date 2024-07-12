let socket;
let playerRole;
let playerId;

function initialiseSocket() {
    if (!socket) {
        socket = io();        
    }

    socket.on('connect', () => {
        playerId = socket.id;
    })

    socket.on('hostJoined', (hostId) => {
        console.log('Host has joined. hostid: '+hostId+' playerId: '+playerId);
        if (hostId == playerId) {
            playerRole = 'host';
            sessionStorage.setItem('playerRole', 'host');
            document.querySelector('.host-join-button').style.display = "none";
            document.querySelector('.guest-join-button').style.display = "none";
            document.querySelector('.server-message').textContent = "You are host. Waiting for guest...";
        }
        
    });

    socket.on('guestJoined', (guestId) => {
        console.log('Guest has joined. Waiting for host to start game.');
        if (guestId == playerId) {
            playerRole = 'guest';
            sessionStorage.setItem('playerRole', 'guest');
            document.querySelector('.host-join-button').style.display = "none";
            document.querySelector('.guest-join-button').style.display = "none";
            document.querySelector('.server-message').textContent = "You are guest. Waiting for host to start..";

        }
        else {
            document.querySelector('.start-game-button').style.display = "block";
            document.querySelector('.server-message').textContent = "Guest has joined. Start when ready.";
        }
    });

    socket.on('gameStarted', () => {
        console.log('Game Started');
        window.location.href = '/game';
    });
}

document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('.host-join-button').addEventListener('click', () => {
        initialiseSocket();
        socket.emit('hostJoining');
    });

    document.querySelector('.guest-join-button').addEventListener('click', () => {
        initialiseSocket();
        socket.emit('guestJoining');
    });

    document.querySelector('.start-game-button').addEventListener('click', () => {
        socket.emit('gameStarting');
        
    });
});