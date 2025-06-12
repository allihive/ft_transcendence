// import { NavBar } from '../../components/NavBar'
import { useState, type JSX } from "react"
import BabylonScene from '../../game/BabylonScene'

export function PlayPage(): JSX.Element {
	// const [activeItem, setActiveItem] = useState("play");

	const player1 = { id: 'player1_id', username: 'Alice' };
	const player2 = { id: 'player2_id', username: 'Timo' };

	return (
		<div>
		<h1>Game Setup</h1>
		{/* Pass player1 and player2 data to the BabylonScene component */}
		<BabylonScene player1={player1} player2={player2} />
		</div>
	);
};