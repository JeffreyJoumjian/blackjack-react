export default function Card(props) {

	const { value, suit, position, last } = props;

	return (
		<img
			className="card"
			src={`images/cards/${value}-${suit}.png`} alt={`${value} of ${suit}`}
			style={{
				marginLeft: `${position * 30}px`,
				zIndex: position + 1,
				animation: `${last ? "cardDraw 250ms 50ms ease-in-out" : ""}`
			}}
		/>
	)
}
