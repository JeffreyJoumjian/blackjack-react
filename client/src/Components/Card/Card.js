export default function Card(props) {

	const { value, suit, position } = props;

	return (
		<img
			className="card"
			src={`cards/${value}-${suit}.png`} alt={`${value} of ${suit}`}
			style={{
				marginLeft: `${position * 30}px`,
				zIndex: position + 1
			}}
		/>
	)
}
