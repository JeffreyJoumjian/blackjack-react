const app = require('express')();

const GameManager = require('./game.js');

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
	cors: {
		origin: ["http://127.0.0.1:3001", "http://localhost:3001"]
	}
});

const connections = [null, null];
io.on('connection', socket => {

	// manage connection
	GameManager.playerHasConnected(connections, io, socket);

	// player readies up
	GameManager.playerIsReady(connections, io, socket);

	// player clicks hit
	GameManager.hit(io, socket);

	// player clicks hit
	GameManager.stay(io, socket);

	// player disconnects or reloads
	// SUGGESTION make player join back session
	GameManager.playerHasDisconnected(connections, io, socket);

	// check whether players have won or lost
	GameManager.playerHasWon(io, socket);
	GameManager.playerHasLost(io, socket);
	GameManager.playersHaveDrawn(io, socket);

});



const port = process.env.PORT || 3000;
server.listen(port, console.log(`server listening on port ${port}`));

module.exports = server;