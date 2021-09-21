export default function Status(props) {
	const { status, type } = props;

	function getSvg(status) {
		if (status === "won")
			return <i className={`status-icon ${status} fas fa-trophy`}></i>
		if (status === "lost")
			return <i className={`status-icon ${status} fas fa-times`}></i>
		if (status === "draw")
			return <i className={`status-icon ${status} fas fa-handshake`}></i>
		return <i className={`status-icon ${status} fas fa-lock`}></i>
	}
	return (
		<div className={`status ${type}-status"`}>
			{status &&
				<>
					<p>{`${type === "player" && !(status === "draw" || status === "stand") ? `You ${status}!` : `${status}`}`}</p>
					{getSvg(status)}
				</>
			}
		</div>
	)
}
