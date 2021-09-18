import { useState, useEffect } from 'react';
import Card from '../Card/Card';
import './Table.css';

export default function Table(props) {

	const [hitDisplay, setHitDisplay] = useState(true);
	const [stayDisplay, setStayDisplay] = useState(true);

	const { playerCards, playerScore, playerWinStatus, opponentCards, opponentScore, opponentWinStatus } = props;

	useEffect(() => {
		if (playerScore >= 21) {
			setHitDisplay(false);
			setStayDisplay(false);
		}
	}, [playerScore]);


	function onClickHit(e) {
		props.onClickHit(e);
	}

	function onClickStay(e) {
		setStayDisplay(false);
		setHitDisplay(false);
		props.onClickStay(e);
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

				<div className="actions">
					{hitDisplay && <button onClick={onClickHit}>Hit</button>}
					{stayDisplay && <button onClick={onClickStay}>Stay</button>}
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
