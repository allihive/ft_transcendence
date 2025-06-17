import BabylonScene from '../../game/BabylonScene'
import { type JSX } from 'react' 

const player1 = { id: 'player1_id', username: 'Alice' };
const player2 = { id: 'player2_id', username: 'Timo' };

export function TwoPlayer(): JSX.Element {
	return (
		<>
			<h1 className="flex flex-col font-title justify-center items-center mt-10">Two Player Mode</h1>
			<div className="flex flex-col font-title justify-center items-center mt-10 text-background text-sm">
				Player 1: use a & q to move Player 2: use p & l to move</div>
			<BabylonScene player1={player1} player2={player2}/>
		</>
	)
}