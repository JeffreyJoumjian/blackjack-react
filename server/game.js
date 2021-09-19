const suits = ["hearts", "spades", "clubs", "diamonds"];
let deck = [];

class Player {
	playerIndex; status; score; cards;

	constructor(playerIndex) {
		this.playerIndex = playerIndex;
		this.score = 0;
		this.status = 0;
	}
}

// generate 2 decks
function generateDeck() {

	for (let s = 0; s < 4; s++)
		for (let i = 1; i <= 13; i++) {
			deck.push({ value: i, suit: suits[s] });
		}
}

function pickCard() {
	let rand = Math.floor(Math.random() * deck.length);
	let card = deck.splice(rand, 1)[0];
	return card;
}

function dealHand() {
	let hand = [];

	if (deck.length < 4)
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
	// let player = new Player(playerIndex);
	socket.playerIndex = playerIndex;
	connections[playerIndex] = false;
	// connections[playerIndex] = new Player(playerIndex);
}

function playerHasDisconnected(connections, io, socket) {
	socket.on('disconnect', () => {
		const { playerIndex } = socket;
		console.log(`player ${playerIndex} has disconnected`);

		// clear up available slot
		connections[playerIndex] = null;
	});
}

function playerIsReady(connections, io, socket) {

	// player has readied up
	socket.on('ready', (playerIndex) => {

		console.log(`player ${playerIndex} is ready`);

		// let both players know that they readied up
		io.emit('ready', playerIndex);

		// player is connected and ready
		connections[parseInt(playerIndex)] = true;

		// if there are missing players => don't start
		for (let i = 0; i < connections.length; i++)
			if (!connections[i])
				return;

		// if we're here then both players are connected and ready => start game
		setTimeout(() => startGame(connections, io, socket), 1000);
	});
}


// SUGGESTION introduce deck and pick from deck instead of randomly
function startGame(connections, io, socket) {

	// generate deck
	generateDeck();

	// generate cards for all players and send
	const playersCards = [];

	// for each connection
	for (let i = 0; i < connections.length; i++) {
		let playerCards = dealHand();

		playersCards.push({ playerIndex: i, playerCards });
	}

	console.log('dealt hands');

	io.emit('hands', playersCards);
	io.emit('start');
}

function hit(io, socket) {
	socket.on('hit', () => {

		// pick a random card from the deck
		let newCard = pickCard();

		// generate a random card and send
		// let newCard = {
		// 	value: Math.floor(Math.random() * 12) + 1,
		// 	suit: suits[Math.floor(Math.random() * 4)]
		// };
		io.emit('hit', { playerIndex: socket.playerIndex, newCard });
	})
}

function stand(io, socket) {
	socket.on('stand', () => io.emit("stand", socket.playerIndex));
}

// SUGGESTION have a bigger function to incorporate dealer
function playerHasWon(io, socket) {
	socket.on('win', () => {
		console.log('win');
		io.emit('win', socket.playerIndex)
	});
}

function playerHasLost(io, socket) {
	socket.on('lose', () => {
		console.log('lose');
		io.emit('lose', socket.playerIndex)
	});
}

function playersHaveDrawn(io, socket) {
	socket.on('draw', () => {
		console.log('draw');
		io.emit('draw');
	});
}

module.exports = {
	playerHasConnected,
	playerHasDisconnected,
	playerIsReady,
	hit,
	stand,
	playerHasWon,
	playerHasLost,
	playersHaveDrawn
}