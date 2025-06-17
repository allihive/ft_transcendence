import { useState, useEffect, type JSX } from "react"
import type { PlayerGameResult } from "../../../../backend/services/game/src/modules/game-history/gameHistory.service"

// interface PlayerGameResult {
//   matchId: string;           // Unique match identifier
//   date: string;             // When the game was played (formatted date)
//   opponent: number;         // The opponent's player ID
//   playerScore: number;      // This player's score
//   opponentScore: number;    // Opponent's score
//   result: 'WIN' | 'LOSS';   // Did this player win or lose?
// }
// 11.6 we need to find a way to playerId to it fetches the correct gameHistory

const test_playerId = 1;

export function UsersStats(): JSX.Element {
	//have name be passed as props?
	const [matches, setMatches] = useState<PlayerGameResult[]>([]);

	useEffect(() => {
		console.log(`PlayerId: ${test_playerId}`);
	  fetch(`http://localhost:3000/api/game-history/${test_playerId}`)
		.then((res) => res.json())
		.then((data) => {
			if (data.success && data.data && Array.isArray(data.data.games)) {
				setMatches(data.data.games);
			  } else {
				console.warn('Unexpected data format:', data);
				setMatches([]);}
	})
		.catch((err) => console.error("Failed to fetch matches:", err));
	}, []);
	// console.log("matches:", matches)
	matches.forEach(match => {
    console.log("Match date:", match.date);
	console.log("MatchId", match.matchId );
	console.log("Match opponent", match.opponent );
	console.log("Match result", match.result );
  	});
	return (
		<>
			<div className="flex items-center justify-center w-full px-8 my-4">
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
				<span className="px-4 text-black dark:text-background font-title">Hello Name</span>
				<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>
			</div>
			<div className="flex items-center justify-center w-full px-8 my-8">
				<span className="px-4 text-black dark:text-background font-title">Results</span>
			</div>
			<table className="table-auto mx-auto text-black dark:text-background">
				<thead>
					<tr className="font-title text-md">
						<th className="px-12 text-left">Date</th>
						<th className="px-12 text-left">Opponent</th>
						<th className="px-12 text-left">Score</th>
						<th className="px-12 text-left">Win/Loss</th>
					</tr>
				</thead>
				<tbody className="font-body text-black dark:text-background">
					{matches.map((match) => (
					<tr key={match.matchId} className="border-b border-black dark:border-lightOrange">
						<td className="px-12 py-4 text-left">{match.date}</td>
						<td className="px-12 py-4 text-left">{match.opponent}</td>
						<td className="px-12 py-4 text-left">{match.opponentScore} - {match.playerScore}</td>
						<td className={`px-12 py-4 text-left ${
    					match.result === 'WIN' ? 'text-green-500' : 'text-red-500'}`}>{match.result}</td>
					</tr>
					))}
				</tbody>
			</table>
		</>
	)
}