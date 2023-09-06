const express = require('express');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/public', express.static('public')); 

let objects = [{
    id: 'npcA',
    x: 460,
    y: 292,
    socket_id: "",
    face: 'down',

}];
const tiles = require('./tilesData');

io.on('connection', (socket) => {

    createNewCharacter(socket.id);
    socket.broadcast.emit('stateChanged', Object.values(objects));

    socket.on('requestMapTiles', () => {
        socket.emit('loadMapTiles', Object.values(tiles));
    });

    socket.on('requsetObjects', () => {
        socket.emit('loadObjects', Object.values(objects));
    });

    socket.on('charMove', function({ socket_id, x, y, face}) {
        // Find the object with the corresponding socket.id
        let obj = objects.find(obj => obj.socket_id === socket_id);
        
        if (obj) {
            // Update the x and y values
            obj.x = x;
            obj.y = y;
            obj.face = face;

            socket.emit('stateChanged', Object.values(objects));
            socket.broadcast.emit('stateChanged', Object.values(objects));
        }
    });

    socket.on('disconnect', () => {
        disconnect(socket.id);
        // Emit the updated state to other clients
        io.emit('stateChange', objects);
    });
});

function createNewCharacter(socketId) {

    let randomCoordinates = getRandomTileCoordinates();
    
    // Keep generating new coordinates while the tile is occupied
    while (isTileOccupied(randomCoordinates.x, randomCoordinates.y)) {
        randomCoordinates = getRandomTileCoordinates();
    }

    objects.push({
        id: 'char1',
        x: randomCoordinates.x,
        y: randomCoordinates.y,
        socket_id: socketId,
        face: 'down',
    });
}

function isTileOccupied(x, y) {
    return objects.some(obj => obj.x === x && obj.y === y);
}

function getRandomTileCoordinates() {
    const randomTile = tiles[Math.floor(Math.random() * tiles.length)];
    return { x: randomTile.x, y: randomTile.y };
}

function disconnect(socketId) {
    // Remove the object associated with the disconnected user
    objects = objects.filter(obj => obj.socket_id !== socketId);
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});