import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import AudioManager from '../Audio/AudioManager';

import './App.css';
import Table from './Table/Table';

const socket = io.connect('http://localhost:3000');

function App() {

	const defaultPlayerState = {
		playerIndex: 0,
		score: 0,
		cards: [],
		connectionStatus: "",
		winStatus: ""
	};

	const defaultOpponentState = {
		playerIndex: 0,
		score: 0,
		cards: [],
		connectionStatus: "",
		winStatus: ""
	};

	const defaultState = {
		playerIndex: 0,
		isReadyPlayer: false,
		isReadyOpponent: false,
		gameIsFull: false,
		gameHasStarted: false,
	};

	const [playerState, setPlayerState] = useState(defaultPlayerState);
	const [opponentState, setOpponentState] = useState(defaultOpponentState);

	const [state, setState] = useState(defaultState);
	// const [timer, setTimer] = useState(6);
	// const [timerOn, setTimerOn] = useState(false);

	let interval = null;

	// todo
	function playerIndexListener() {
		socket.off('player-index').on('player-index', (playerIndex) => {
			if (playerIndex === -1)
				return setState({ ...state, gameIsFull: true })
			setPlayerState({ ...playerState, playerIndex });
		});
	}


	// done
	function playerReadyListener() {
		socket.off('ready').on('ready', (playerIndex) => {
			if (playerIndex === playerState.playerIndex)
				setPlayerState({ ...playerState, connectionStatus: 'ready' });
			else
				setOpponentState({ ...opponentState, connectionStatus: 'ready' });
		});
	}


	function gameStartListener() {
		socket.off('start').on('start', (data) => {
			setState({ ...state, gameHasStarted: true });
			// setTimer(6);
			// setTimerOn(true);
		});
	}


	// done
	function getHandsListener() {
		socket.off('hands').on('hands', (players) => {

			AudioManager.playHandSound();
			updatePlayerStates(players);
		});
	}

	// done
	function hitListener() {
		socket.off('hit').on('hit', (players) => {
			updatePlayerStates(players);
		});
	}

	// todo
	// function newGameListener() {
	// 	if (playerWinStatus && opponentWinStatus) {
	// 		setTimeout(() => {
	// 			setState({ ...defaultState, playerIndex });
	// 		}, 1500);
	// 	}
	// }

	// todo
	function standListener() {
		socket.off('stand').on('stand', (players) => updatePlayerStates(players));
	}

	// todo
	// function setPlayerStatus(playerIndex, winStatus) {
	// 	if (playerIndex === playerState.playerIndex)
	// 		setPlayerState({ ...playerState, winStatus });
	// 	else
	// 		setOpponentState({ ...opponentState, winStatus });
	// }

	// done
	function updatePlayerStates(players) {
		players.forEach(player => {
			console.log(player.playerIndex, playerState.playerIndex, player.playerIndex === playerState.playerIndex);
			if (player.playerIndex === playerState.playerIndex)
				setPlayerState({ ...playerState, ...player });
			else
				setOpponentState({ ...opponentState, ...player });

		});
	}

	// function startTimer() {
	// 	interval = null;

	// 	if (timer <= 0) {
	// 		document.querySelector('.action #stand')
	// 		socket.emit("stand", playerIndex);
	// 		setTimerOn(false);
	// 	}


	// 	if (gameHasStarted && timerOn && timer > 0)
	// 		interval = setInterval(() => setTimer(timer - 0.01), 10);
	// 	else
	// 		clearInterval(interval);
	// }

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
		// startTimer();

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
		standListener();

		// new hand listener
		// newGameListener();

		return clear;
	});

	function onClickReady() {
		socket.emit('ready');
	}

	function onClickHit(e) {
		if (playerState.score < 21) {
			AudioManager.playCardSound();
			socket.emit('hit');
		}
	}

	function onClickStand(e) {
		e.target.disabled = true;
		socket.emit('stand');
		// setTimerOn(false);
	}

	const { gameHasStarted, gameIsFull } = state;


	return (
		<div className="App" style={{
			background: "linear-gradient(rgba(0, 0, 0, 0.4),rgba(0, 0, 0, 0.4)),url('/table.jpg')"
		}}>

			{/* <Table
					// timer={timer}
					onClickHit={onClickHit}
					onClickStand={onClickStand}
					player={playerState}
					opponent={opponentState}
			/> */}

			{gameIsFull && <h1>Game is full</h1>}


			{!gameHasStarted && !gameIsFull &&
				<>
					<div className="player-container">

						<div className="ready-container">
							<h2>You</h2>
							<div className={`ready-indicator${playerState.connectionStatus === "ready" ? " ready" : ""}`}></div>
						</div>
						<button onClick={onClickReady}>Ready</button>
					</div>

					<div className="opponent-container">
						<div className="ready-container">
							<h2>Opponent</h2>
							<div className={`ready-indicator${opponentState.connectionStatus === "ready" ? " ready" : ""}`}></div>
						</div>
					</div>
				</>
			}

			{gameHasStarted && !gameIsFull &&
				<Table
					// timer={timer}
					onClickHit={onClickHit}
					onClickStand={onClickStand}
					player={playerState}
					opponent={opponentState}
				/>
			}
		</div>
	);
}

export default App;
