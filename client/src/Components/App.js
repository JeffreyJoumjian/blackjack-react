import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import AudioManager from '../Audio/AudioManager';

import './App.css';
import Table from './Table/Table';
import Button from './Button/Button';


const socket = io.connect('http://localhost:3000'); // local
// const socket = io.connect("/"); // production

function App() {

	const defaultPlayerState = {
		playerIndex: 0,
		score: 0,
		totalScore: 0,
		cards: [],
		connectionStatus: "",
		winStatus: ""
	};

	const defaultOpponentState = {
		playerIndex: 0,
		totalScore: 0,
		score: 0,
		cards: [],
		connectionStatus: "",
		winStatus: ""
	};

	const defaultState = {
		gameIsFull: false,
		gameHasStarted: false,
	};

	const [playerState, setPlayerState] = useState(defaultPlayerState);
	const [opponentState, setOpponentState] = useState(defaultOpponentState);

	const [state, setState] = useState(defaultState);
	const [timer, setTimer] = useState(6);
	const [timerOn, setTimerOn] = useState(false);

	let interval = null;

	// done
	function playerIndexListener() {
		socket.off('player-index').on('player-index', (playerIndex) => {
			if (playerIndex === -1)
				return setState({ ...state, gameIsFull: true })
			setPlayerState({ ...playerState, playerIndex });
		});
	}


	// done
	function playerReadyListener() {
		socket.off('ready').on('ready', (players) => {
			updatePlayerStates(players, true)
		});
	}


	function gameStartListener() {
		socket.off('start').on('start', () => {
			setState({ ...state, gameHasStarted: true });
			setTimer(6);
			setTimerOn(true);
		});
	}


	// done
	function getHandsListener() {
		socket.off('hands').on('hands', (players) => {
			AudioManager.playHandSound();
			updatePlayerStates(players, true);
		});
	}

	// done
	function hitListener() {
		socket.off('hit').on('hit', (players) => {
			updatePlayerStates(players);
		});
	}

	function standListener() {
		socket.off('stand').on('stand', (players) => updatePlayerStates(players));
	}

	function showResultsListener() {
		socket.off('show-results').on('show-results', (players) => {
			updatePlayerStates(players, true);
		});
	}

	function disconnectListener() {
		socket.off('player-disconnected').on('player-disconnected', () => reset())
	}

	// done
	function updatePlayerStates(players, hand = false) {
		players.forEach(player => {
			if (player.playerIndex === playerState.playerIndex) {
				setPlayerState({ ...playerState, ...player });
			}
			else
				if (hand)
					setOpponentState({ ...opponentState, ...player });

		});
	}


	function startTimer() {
		interval = null;

		if (timer <= 0 && timerOn) {
			socket.emit("stand");
			setTimerOn(false);
		}


		if (gameHasStarted && timerOn && timer > 0 && !playerState.winStatus)
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
		socket.off('show-results');
		socket.off('player-disconnected');

		clearInterval(interval);
	}

	function reset(playAgain = false) {
		setState(defaultState);

		let newPlayerState = { ...defaultPlayerState, playerIndex: playerState.playerIndex };
		let newOpponentState = { ...defaultOpponentState, playerIndex: opponentState.playerIndex };

		if (playAgain) {
			newPlayerState.totalScore = playerState.totalScore;
			newOpponentState.totalScore = opponentState.totalScore;
		}

		setPlayerState(newPlayerState);
		setOpponentState(newOpponentState);
		setTimer(6);
		setTimerOn(false);
	}

	// play win audio
	useEffect(() => {
		if (playerState.winStatus && opponentState.winStatus && playerState.winStatus === "won")
			AudioManager.playWinSound();
	}, [playerState.winStatus, opponentState.winStatus]);

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
		standListener();

		// listen for results
		showResultsListener();

		// listen for disconnects
		disconnectListener();

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
		setTimerOn(false);
	}

	function onClickPlayAgain(e) {
		socket.emit('play-again');
		reset(true);
	}

	const { gameHasStarted, gameIsFull } = state;


	return (
		<div className="App" style={{
			background: "linear-gradient(rgba(0, 0, 0, 0.4),rgba(0, 0, 0, 0.4)),url('/images/table.jpg')"
		}}>

			{gameIsFull && <h1>Game is full</h1>}

			{!gameHasStarted && !gameIsFull &&
				<>
					<div className="title-container">
						<p className="title">
							<span>B</span>LACK<span>J</span>ACK 21</p>
						<img className="logo" src="/images/casino.png" alt="" />
					</div>

					<div className="lobby">

						<div className="player-container">
							<div className="ready-container">
								<h2>You</h2>
								<div className={`ready-indicator${playerState.connectionStatus === "ready" ? " ready" : ""}`}></div>
							</div>
							<p className="total-score">{`${playerState.totalScore}`}</p>
						</div>

						<div className="opponent-container">
							<div className="ready-container">
								<h2>Opponent</h2>
								<div className={`ready-indicator${opponentState.connectionStatus === "ready" ? " ready" : ""}`}></div>
							</div>
							<p className="total-score">{`${opponentState.totalScore}`}</p>
						</div>

					</div>
					<Button id="btn-ready" onClick={onClickReady} text="Ready Up" />
				</>
			}

			{gameHasStarted && !gameIsFull &&
				<Table
					timer={timer}
					onClickHit={onClickHit}
					onClickStand={onClickStand}
					onClickPlayAgain={onClickPlayAgain}
					player={playerState}
					opponent={opponentState}
				/>
			}
		</div>
	);
}

export default App;
