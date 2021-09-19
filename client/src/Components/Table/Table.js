import { useState, useEffect } from 'react';
import Card from '../Card/Card';
import './Table.css';

export default function Table(props) {

	const [hitDisplay, setHitDisplay] = useState(true);
	const [standDisplay, setStandDisplay] = useState(true);

	const {
		playerCards, playerScore, playerWinStatus,
		opponentCards, opponentScore, opponentWinStatus,
		timer
	} = props;

	useEffect(() => {
		if (playerScore >= 21) {
			setHitDisplay(false);
			setStandDisplay(false);
		}
	}, [playerScore]);


	function onClickHit(e) {
		props.onClickHit(e);
	}

	function onClickStand(e) {
		setStandDisplay(false);
		setHitDisplay(false);
		props.onClickStand(e);
	}

	function calculateBackgroundColor() {
		if (timer > 4)
			return "#33d900";
		else if (timer > 2)
			return "#d6a51e";
		else
			return "#d71313";
	}

	return (
		<div className="table">
			<div className="player">
				<p className="status player-status">{playerWinStatus && `${playerWinStatus}`}</p>
				<div className="hand player-hand">
					{playerCards.map((card, i) =>
						<Card value={card.value} suit={card.suit} key={i} position={i} />)
					}
					<div className="counter">{`${playerScore}`}</div>
				</div>
				<div className="timer" style={{
					width: `${timer * 200 / 6}px`,
					background: `${calculateBackgroundColor()}`
				}} />

				<div className="actions">
					{hitDisplay && <button id="hit" onClick={onClickHit}>Hit</button>}
					{standDisplay && <button id="stand" onClick={onClickStand}>stand</button>}
				</div>

			</div>

			<div className="opponent">
				<p className="status opponent-status">{opponentWinStatus && `${opponentWinStatus}`}</p>
				<div className="hand opponent-hand">
					{opponentCards.map((card, i) =>
						<Card value={card.value} suit={card.suit} key={i} position={i} />)
					}
					<div className="counter">{`${opponentScore}`}</div>
				</div>

			</div>
		</div>
	)
}
