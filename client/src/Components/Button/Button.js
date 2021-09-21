import './Button.css';
export default function Button(props) {

	const { id, onClick, text } = props;
	return (
		<button className="btn-action" id={id} onClick={onClick}>
			<span className="btn-front">
				{text}
			</span>
		</button>
	)
}
