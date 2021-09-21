const suits = ["hearts", "spades", "clubs", "diamonds"];
let deck = [];
let playAgain = false;

class Player {
	playerIndex; connectionStatus; winStatus; score; totalScore; cards;

	constructor(playerIndex) {
		this.playerIndex = playerIndex;
		this.score = 0;
		this.totalScore = 0;
		this.cards = [];
		this.winStatus = "";
		this.connectionStatus = "";
	}

	resetPlayer(playAgain) {
		console.log(playAgain);
		this.score = 0;
		this.totalScore = playAgain ? this.totalScore : 0;
		this.cards = [];
		this.winStatus = "";
		this.connectionStatus = "connected";
	}
}

// generate 1 decks
function generateDeck() {

	for (let s = 0; s < 4; s++)
		for (let i = 1; i <= 13; i++)
			deck.push({ value: i, suit: suits[s] });

	// shuffle deck
	deck.sort(() => 0.5 - Math.random());
}

function pickCard() {
	let rand = Math.floor(Math.random() * deck.length);
	let card = deck.splice(rand, 1)[0];
	return card;
}

function dealHand() {
	let hand = [];

	if (deck.length < 2)
		deck = generateDeck();

	// generate 2 cards for each
	for (let j = 0; j < 2; j++)
		hand.push(pickCard());

	return hand;
}

function playerHasConnected(connections, io, socket) {
	let playerIndex = -1;
	// max 2 players => check if there is an available slot;
	for (let i = 0; i < connections.length; i++) {
		if (connections[i] === null) {
			playerIndex = i;
			break;
		}
	}


	console.log(`player ${playerIndex} has connected`);
	socket.emit('player-index', playerIndex);

	if (playerIndex === -1) return;

	// player is connected but not ready
	let player = new Player(playerIndex);
	player.connectionStatus = "connected"

	socket.player = player;

	connections[playerIndex] = socket;
}

function playerHasDisconnected(connections, io, socket) {
	socket.on('disconnect', () => {
		if (socket.player) {

			const { playerIndex } = socket.player;
			console.log(`player ${playerIndex} has disconnected`);

			// clear up available slot
			socket.player = null;
			connections[playerIndex] = null;
		}
		playAgain = false;

		for (let i = 0; i < connections.length; i++)
			if (connections[i] && connections[i].player)
				connections[i].player.resetPlayer(playAgain);

		// emit disconnect to other player
		io.emit('player-disconnected');
	});
}

// done
function playerIsReady(connections, io, socket) {

	// player has readied up
	socket.on('ready', () => {

		const { playerIndex } = socket.player;

		console.log(`player ${playerIndex} is ready`);

		// let both players know that they readied up

		// player is connected and ready
		socket.player.connectionStatus = "ready";

		io.emit('ready', getPlayers(connections));

		// if there are missing players => don't start
		for (let i = 0; i < connections.length; i++)
			if (!connections[i] || connections[i].player.connectionStatus !== "ready")
				return;

		// if we're here then both players are connected and ready => start game
		setTimeout(() => startGame(connections, io, socket), 1000);
	});
}

// done
function getPlayers(connections) {
	return connections.reduce((players, con) => {
		if (con && con.player)
			players.push(con.player);
		return players;
	}, []);
}

// done
function startGame(connections, io, socket) {

	// SUGGESTION refactor to keep using same deck
	// generate deck
	generateDeck();

	// for each connection
	for (let i = 0; i < connections.length; i++) {
		connections[i].player.resetPlayer(playAgain);
		connections[i].player.connectionStatus = "playing";

		let playerCards = dealHand();

		connections[i].player.cards = playerCards;
		connections[i].player.score = calculateScore(playerCards);
		checkPlayerWin(connections, io, socket);
	}

	console.log('dealt hands');

	io.emit('hands', getPlayers(connections));
	io.emit('start');
}

function playAgainReset(socket) {
	socket.on('play-again', () => {
		playAgain = true;
		socket.player.resetPlayer(playAgain);
	});
}

// done
function calculateScore(cards) {

	let score = 0;
	let aceCounter = 0;

	for (let i = 0; i < cards.length; i++) {
		let card = parseInt(cards[i].value);
		if (card === 1 && aceCounter === 0) {
			aceCounter++;
			score += 11
		}
		else {
			score += card;
		}

		if (score > 21 && aceCounter === 1) {
			score -= 10;
			aceCounter = -1;
		}
	}
	return score;
}

// done
function checkPlayerWin(connections, io, socket) {

	// check individual player
	for (let i = 0; i < connections.length; i++) {
		let { player } = connections[i];
		if (player.score > 21)
			player.winStatus = "lost";

		if (player.score === 21)
			player.winStatus = "won";
	}

	let { player } = socket;

	// check with other player
	const otherPlayer = connections[1 - player.playerIndex].player;

	if (player.winStatus === "stand") {
		if (otherPlayer.winStatus === "stand") {
			if (player.score > otherPlayer.score) {
				player.winStatus = "won";
				otherPlayer.winStatus = "lost";
			}
			else if (player.score === otherPlayer.score) {
				player.winStatus = "draw";
				otherPlayer.winStatus = "draw";
			}
			else {
				player.winStatus = "lost";
				otherPlayer.winStatus = "won";
			}
		}

		if (otherPlayer.winStatus === "lost")
			player.winStatus = "won";

		if (otherPlayer.winStatus === "won")
			player.winStatus = "lost";
	}

	if (player.winStatus === "lost" && otherPlayer.winStatus === "stand")
		otherPlayer.winStatus = "won";

	if (player.winStatus === "won" && otherPlayer.winStatus === "stand")
		otherPlayer.winStatus = "lost";

	if (player.winStatus === "won" && otherPlayer.winStatus === "won" && player.score === 21) {
		player.winStatus = "draw";
		otherPlayer.winStatus = "draw";
	}


	let showResultsWhen = ["won", "lost", "draw"];
	let showResults = !!(showResultsWhen.find(res => res === player.winStatus) && showResultsWhen.find(res => res === otherPlayer.winStatus));

	if (showResults) {

		// update player scores
		for (let i = 0; i < connections.length; i++) {
			let { player } = connections[i];
			if (player.winStatus === "won" || player.winStatus === "draw") player.totalScore++;
		}

		console.log('results');
		// show results
		io.emit('show-results', getPlayers(connections));

		console.log(getPlayers(connections));
	}
}

// done
function hit(connections, io, socket) {
	socket.on('hit', () => {
		console.log('hit');
		const { player } = socket;

		if (player.score < 21) {

			// pick a random card from the deck
			let newCard = pickCard();

			player.cards.push(newCard);
			player.score = calculateScore(player.cards);

			checkPlayerWin(connections, io, socket);

			io.emit('hit', getPlayers(connections));
		}
	});
}

// done
function stand(connections, io, socket) {
	socket.on('stand', () => {
		console.log('stand');
		socket.player.winStatus = "stand";

		checkPlayerWin(connections, io, socket);

		io.emit('stand', getPlayers(connections));
	});
}

module.exports = {
	playerHasConnected,
	playerHasDisconnected,
	playAgainReset,
	playerIsReady,
	hit,
	stand,
	checkPlayerWin
}