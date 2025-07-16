import { useState, useEffect, type JSX } from "react"
import type { PlayerGameResult } from "../../../../backend/services/game/src/modules/game-history/gameHistory.service"
import { useTranslation } from "react-i18next";
import { MyChart } from "./components/UserStatsGraph";

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
	const { t } = useTranslation();
	useEffect(() => {
		console.log(`PlayerId: ${test_playerId}`);
		fetch(`http://localhost:3000/api/game-history/${test_playerId}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.success && data.data && Array.isArray(data.data.games)) {
					setMatches(data.data.games);
				} else {
					console.warn('Unexpected data format:', data);
					setMatches([]);
				}
			})
			.catch((err) => console.error("Failed to fetch matches:", err));
	}, []);
	return (
		<>
			<div className="flex items-center justify-center w-full my-4">
				<div className="flex-grow mx-8">
					<div className="w-full border-t border-black dark:border-white" />
				</div>
				<span className="text-black dark:text-background font-title">{t('hello')} Name</span>
				<div className="flex-grow mx-8">
					<div className="w-full border-t border-black dark:border-white" />
				</div>
			</div>

			<div className="flex items-center justify-center w-full py-8">
				<MyChart />
			</div>
			<div className="flex items-center justify-center w-full my-8">
				<span className="px-4 text-black dark:text-background font-title">{t('results')}</span>
			</div>
			<table className="table-auto mx-auto text-black dark:text-background">
				<thead>
					<tr className="font-title text-md">
						<th className="px-12 text-left">{t('date')}</th>
						<th className="px-12 text-left">{t('opponent')}</th>
						<th className="px-12 text-left">{t('score')}</th>
						<th className="px-12 text-left">{t('winOrLoss')}</th>
					</tr>
				</thead>
				<tbody className="font-body text-black dark:text-background">
					{matches.map((match) => (
						<tr key={match.matchId} className="border-b border-black dark:border-lightOrange">
							<td className="px-12 py-4 text-left">{match.date}</td>
							<td className="px-12 py-4 text-left">{match.opponent}</td>
							<td className="px-12 py-4 text-left">{match.opponentScore} - {match.playerScore}</td>
							<td className={`px-12 py-4 text-left ${match.result === 'WIN' ? 'text-green-500' : 'text-red-500'}`}>{match.result}</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	)
}