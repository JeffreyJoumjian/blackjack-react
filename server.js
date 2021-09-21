const express = require('express');
const app = express();
const path = require('path');

const GameManager = require('./game.js');

const server = require('http').createServer(app);

// let corsOptions = { cors: { origin: ["http://127.0.0.1:3001", "http://localhost:3001"] } };
// app.use(express.static(path.join(__dirname, "./client/build")));
// const io = require('socket.io')(server, corsOptions); // dev

if (process.env.NODE_ENV === "production")
	app.use(express.static(path.join(__dirname, "./client/build")));

const io = require('socket.io')(server); // prod

const connections = [null, null];
io.on('connection', socket => {

	// manage connection
	GameManager.playerHasConnected(connections, io, socket);

	// player readies up
	GameManager.playerIsReady(connections, io, socket);

	// player clicks hit
	GameManager.hit(connections, io, socket);

	// player clicks hit
	GameManager.stand(connections, io, socket);

	// player disconnects or reloads
	GameManager.playerHasDisconnected(connections, io, socket);

	// players want to player again
	GameManager.playAgainReset(socket);
});



const port = process.env.PORT || 3000;
server.listen(port, console.log(`server listening on port ${port}`));

module.exports = server;