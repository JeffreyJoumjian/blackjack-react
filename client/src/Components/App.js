import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import AudioManager from '../Audio/AudioManager';

import './App.css';
import Game from './Game.js';
import Card from './Card/Card';
import Table from './Table/Table';

const socket = io.connect('http://localhost:3000');

function App() {

	const defaultState = {
		playerIndex: 0,
		isReadyPlayer: false,
		isReadyOpponent: false,
		gameIsFull: false,
		gameHasStarted: false,
		playerCards: [],
		playerScore: 0,
		playerWinStatus: "",
		opponentScore: 0,
		opponentCards: [],
		opponentWinStatus: ""
	};

	const [state, setState] = useState(defaultState);
	const [timer, setTimer] = useState(6);
	const [timerOn, setTimerOn] = useState(false);

	let interval = null;

	function playerIndexListener() {
		socket.off('player-index').on('player-index', (playerIndex) => {
			if (playerIndex === -1)
				return setState({ ...state, gameIsFull: true })
			setState({ ...state, playerIndex });
		});
	}

	function playerReadyListener() {
		const { playerIndex, isReadyPlayer, isReadyOpponent } = state;

		socket.off('ready').on('ready', (dataPlayerIndex) => {

			setState({
				...state,
				isReadyPlayer: parseInt(dataPlayerIndex) === playerIndex ? true : isReadyPlayer,
				isReadyOpponent: parseInt(dataPlayerIndex) !== playerIndex ? true : isReadyOpponent
			});
		});
	}

	function gameStartListener() {
		socket.off('start').on('start', (data) => {
			setState({ ...state, gameHasStarted: true });
			setTimer(6);
			setTimerOn(true);
		});
	}

	function getHandsListener() {
		const { playerIndex } = state;


		// refactor this to support more players
		socket.off('hands').on('hands', (playersCards) => {
			let newState = {};
			let playerScore = 0;

			AudioManager.playHandSound();

			playersCards.forEach(player => {
				if (player.playerIndex === playerIndex) {
					playerScore = calculateScore(player.playerCards);

					newState.playerCards = player.playerCards;
					newState.playerScore = playerScore;
				}
				else {
					playerScore = calculateScore(player.playerCards);

					newState.opponentCards = player.playerCards;
					newState.opponentScore = playerScore;
				}
			});

			setState({ ...state, ...newState });

		});
	}

	function hitListener() {
		const { playerCards, opponentCards } = state;

		socket.off('hit').on('hit', ({ playerIndex, newCard }) => {
			let newPlayerCards = [];
			let newPlayerScore = 0;
			if (playerIndex === state.playerIndex) {
				newPlayerCards = playerCards;
				newPlayerScore = playerScore;

				newPlayerCards.push(newCard);
				newPlayerScore += parseInt(newCard.value);


				setState({ ...state, playerCards: newPlayerCards, playerScore: newPlayerScore });
			}
			else {
				newPlayerCards = opponentCards;
				newPlayerScore = opponentScore;

				newPlayerCards.push(newCard);
				newPlayerScore += parseInt(newCard.value);

				setState({ ...state, opponentCards: newPlayerCards, opponentScore: newPlayerScore });
			}
		});
	}

	function newGameListener() {
		if (playerWinStatus && opponentWinStatus) {
			setTimeout(() => {
				setState({ ...defaultState, playerIndex });
			}, 1500);
		}
	}

	function playerWinStatusListener() {
		const { playerScore, playerWinStatus } = state;

		// if player has a status return
		if (!playerWinStatus) {
			if (playerScore === 21)
				socket.emit('win', playerIndex);
			if (playerScore > 21)
				socket.emit('lose', playerIndex);

			// if (opponentWinStatus && opponentWinStatus !== "stand" && playerScore < 21)
			// 	socket.emit('win', playerIndex);

			if (playerScore !== 0 && playerScore === opponentScore)
				socket.emit('draw', playerIndex)
		}

		if (playerWinStatus === "stand") {
			if (opponentWinStatus === "stand") {
				if (playerScore > opponentScore)
					socket.emit("win", playerIndex);
				else if (playerScore === opponentScore)
					socket.emit("draw");
				else
					socket.emit("lose", playerIndex);
			}
			else if (opponentWinStatus === "lost")
				socket.emit("win", playerIndex);
			else if (opponentWinStatus === "win") {
				if (playerScore === opponentScore)
					socket.emit("draw", playerIndex);
				else
					socket.emit("lose", playerIndex);
			}
		}

		socket.off('stand').on('stand', (playerIndex) => setPlayerStatus(playerIndex, "stand"));

		socket.off('win').on('win', (playerIndex) => setPlayerStatus(playerIndex, "won"));

		socket.off('lose').on('lose', (playerIndex) => setPlayerStatus(playerIndex, "lost"));

		socket.off('draw').on('draw', (playerIndex) => setPlayerStatus(playerIndex, "draw"));
	}

	function setPlayerStatus(playerIndex, status) {

		let { playerWinStatus, opponentWinStatus } = state;

		let newState = { playerWinStatus, opponentWinStatus };

		if (status === "draw") {
			newState.playerWinStatus = status;
			newState.opponentWinStatus = status;
		} else {
			if (playerIndex === state.playerIndex)
				newState.playerWinStatus = status;
			else
				newState.opponentWinStatus = status;
		}

		setState({ ...state, ...newState });
	}

	function startTimer() {
		interval = null;

		if (timer <= 0) {
			document.querySelector('.action #stand')
			socket.emit("stand", playerIndex);
			setTimerOn(false);
		}


		if (gameHasStarted && timerOn && timer > 0)
			interval = setInterval(() => setTimer(timer - 0.01), 10);
		else
			clearInterval(interval);
	}

	function clear() {
		// disconnect listener from all sockets to be safe
		socket.off('player-index');
		socket.off('ready');
		socket.off('start');
		socket.off('hands');
		socket.off('hit');
		socket.off('stand');
		socket.off('win');
		socket.off('lose');
		socket.off('draw');

		clearInterval(interval);
	}


	useEffect(() => {

		// start timer
		startTimer();

		// get player index
		playerIndexListener();

		// listen if player has readied up
		playerReadyListener();

		// listen if game has started
		gameStartListener();

		// get hands from server
		getHandsListener();

		// listen for when a player clicks hit
		hitListener();

		// listen for when players win or lose
		playerWinStatusListener();

		// new hand listener
		newGameListener();

		return clear;
	});

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

	function onClickReady() {
		socket.emit('ready', state.playerIndex);
	}

	function onClickHit(e) {
		if (playerScore < 21) {
			AudioManager.playCardSound();
			socket.emit('hit', playerIndex);
		}
	}

	function onClickStand(e) {
		e.target.disabled = true;
		socket.emit("stand", playerIndex);
		setTimerOn(false);
	}

	const { isReadyPlayer, isReadyOpponent,
		gameHasStarted, gameIsFull,
		playerCards, playerScore, playerWinStatus,
		opponentCards, opponentScore, opponentWinStatus,
		playerIndex } = state;

	return (
		<div className="App" style={{
			background: "linear-gradient(rgba(0, 0, 0, 0.4),rgba(0, 0, 0, 0.4)),url('/table.jpg')"
		}}>

			{/* <Table
				timer={timer}
				onClickHit={onClickHit}
				onClickStand={onClickStand}
				playerCards={playerCards}
				playerScore={playerScore}
				playerWinStatus={playerWinStatus}
				opponentCards={opponentCards}
				opponentScore={opponentScore}
				opponentWinStatus={opponentWinStatus}
			/> */}

			{gameIsFull && <h1>Game is full</h1>}


			{!gameHasStarted && !gameIsFull &&
				<>
					<div className="player-container">

						<div className="ready-container">
							<h2>You</h2>
							<div className={`ready-indicator${isReadyPlayer ? " ready" : ""}`}></div>
						</div>
						<button onClick={onClickReady}>Ready</button>
					</div>

					<div className="opponent-container">
						<div className="ready-container">
							<h2>Opponent</h2>
							<div className={`ready-indicator${isReadyOpponent ? " ready" : ""}`}></div>
						</div>
					</div>
				</>
			}

			{gameHasStarted && !gameIsFull &&
				<Table
					timer={timer}
					onClickHit={onClickHit}
					onClickStand={onClickStand}
					playerCards={playerCards}
					playerScore={playerScore}
					playerWinStatus={playerWinStatus}
					opponentCards={opponentCards}
					opponentScore={opponentScore}
					opponentWinStatus={opponentWinStatus}
				/>
			}
		</div>
	);
}

export default App;
