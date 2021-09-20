export default function Button(props) {

	const { className, id, onClick, text } = props;
	return (
		<button className={className} id={id} onClick={onClick}>
			<span className="btn-front">
				{text}
			</span>
		</button>
	)
}
