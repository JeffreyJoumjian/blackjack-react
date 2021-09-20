import { useState, useEffect } from 'react';
import Card from '../Card/Card';
import './Table.css';

export default function Table(props) {

	const [hitDisplay, setHitDisplay] = useState(true);
	const [standDisplay, setStandDisplay] = useState(true);

	const {
		player, opponent,
		timer
	} = props;


	useEffect(() => {
		if (player.score >= 21 || timer <= 0 || player.winStatus) {
			setHitDisplay(false);
			setStandDisplay(false);
		}
		else {
			setHitDisplay(true);
			setStandDisplay(true);
		}
	}, [player.score, timer, player.winStatus]);


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

			<div className="opponent">
				<p className="status opponent-status">{opponent.winStatus && `${opponent.winStatus}`}</p>
				<div className="hand opponent-hand">
					{opponent.cards.map((card, i) =>
						<Card value={card.value} suit={card.suit} key={i} position={i} />)
					}
					<div className="counter">{`${opponent.score}`}</div>
				</div>
			</div>

			<div className="player">
				<p className="status player-status">{player.winStatus && `${player.winStatus}`}</p>
				<div className="hand player-hand">
					{player.cards.map((card, i) =>
						<Card value={card.value} suit={card.suit} key={i} position={i} last={i === player.cards.length} />)
					}
					<div className="counter">{`${player.score}`}</div>
				</div>
				<div className="timer" style={{
					width: `${timer * 200 / 6}px`,
					background: `${calculateBackgroundColor()}`,
					opacity: `${player.winStatus ? 0 : 1}`
				}} />

				<div className="actions">
					{hitDisplay &&
						<button
							className="btn-action" id="btn-hit" onClick={onClickHit}>Hit</button>}
					{standDisplay && <button className="btn-action" id="stand" onClick={onClickStand}>stand</button>}
				</div>
			</div>

		</div>
	)
}
