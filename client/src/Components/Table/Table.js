import { useState, useEffect } from 'react';
import Card from '../Card/Card';
import './Table.css';
import Button from '../Button/Button';
import Status from '../Status';

export default function Table(props) {

	const [hitDisplay, setHitDisplay] = useState(true);
	const [standDisplay, setStandDisplay] = useState(true);
	const [playAgainDisplay, setPlayAgainDisplay] = useState(false);

	const {
		player, opponent,
		timer
	} = props;


	// check when to display appropriate buttons
	useEffect(() => {
		if (player.score >= 21 || timer <= 0 || player.winStatus) {
			setHitDisplay(false);
			setStandDisplay(false);
		}
		else {
			setHitDisplay(true);
			setStandDisplay(true);
		}

		// if both players have a result
		if (player.winStatus && opponent.winStatus)
			setPlayAgainDisplay(true);
		else
			setPlayAgainDisplay(false);

	}, [player.score, timer, player.winStatus, opponent.winStatus]);


	function onClickHit(e) {
		props.onClickHit(e);
	}

	function onClickStand(e) {
		setStandDisplay(false);
		setHitDisplay(false);
		props.onClickStand(e);
	}

	function onClickPlayAgain(e) {
		props.onClickPlayAgain(e);
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
				<Status status={opponent.winStatus} type="opponent" />
				<div className="hand opponent-hand">
					{opponent.cards.map((card, i) =>
						<Card
							value={card.value}
							suit={card.suit}
							key={i}
							position={i}
							total={opponent.cards.length}
						/>)
					}
					<div className="counter">{`${opponent.score}`}</div>
				</div>
			</div>

			<div className="player">
				<Status status={player.winStatus} type="player" />
				<div className="hand player-hand">
					{player.cards.map((card, i) =>
						<Card
							value={card.value}
							suit={card.suit}
							key={i}
							position={i}
							total={player.cards.length}
							last={i === player.cards.length} />)
					}
					<div className="counter">{`${player.score}`}</div>
				</div>

			</div>
			<div className="timer-container" style={{ opacity: `${player.winStatus ? 0 : 1}` }}>
				<div className="timer" style={{
					width: `${timer * 250 / 6}px`,
					background: `${calculateBackgroundColor()}`
				}} />
				<div className="timer-bg" />
			</div>
			<div className="actions">
				{hitDisplay && <Button id="btn-hit" onClick={onClickHit} text="Hit" />}
				{standDisplay && <Button id="btn-stand" onClick={onClickStand} text="Stand" />}
				{playAgainDisplay && <Button id="btn-play" onClick={onClickPlayAgain} text="Play Again" />}
			</div>

		</div>
	)
}
