import { useState, useEffect, type JSX } from "react"
import { useTranslation } from "react-i18next";
import { MyChart } from "../../components/gameStats/UserStatsGraph";
import type { UserStats } from "~/api/types";
import { useAuth } from "~/stores/useAuth"
import type { getUserMatchHistory } from "~/api/stats/types";


export interface PlayerGameResult {
  matchId: string;           // Unique match identifier
  date: string;             // When the game was played (formatted date)
  opponent: number;         // The opponent's player ID
  playerScore: number;      // This player's score
  opponentScore: number;    // Opponent's score
  UserStats: UserStats[];
  result: 'WIN' | 'LOSS';   // Did this player win or lose?
}
// 11.6 we need to find a way to playerId to it fetches the correct gameHistory

type UsersStatsProps = {
	userStats: any[];
	userMatchHistory: getUserMatchHistory[];
};

export function UsersStats({ userStats, userMatchHistory }: UsersStatsProps): JSX.Element {

	const { t } = useTranslation();
	const user = useAuth((state) => (state.user?.name));

	return (
		<>
			<div className="flex items-center justify-center w-full my-4">
				<div className="flex-grow mx-8">
					<div className="w-full border-t border-black dark:border-white" />
				</div>
				<span className="text-black dark:text-background font-title">{t('hello')} {user}</span>
				<div className="flex-grow mx-8">
					<div className="w-full border-t border-black dark:border-white" />
				</div>
			</div>

			<div className="flex items-center justify-center w-full py-8">
				<MyChart matches={userMatchHistory} userStats={userStats} />
			</div>
			<div className="flex items-center justify-center w-full my-8">
				<span className="px-4 text-black dark:text-background font-title">{t('latestMatches')}</span>
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
					{userMatchHistory.map((match, index) => (
						<tr key={`match-${index}`} className="border-b border-black dark:border-lightOrange">
							<td className="px-12 py-4 text-left text-xs font-body">{new Date(match.date).toLocaleDateString()}</td>
							<td className="px-12 py-4 text-left">
								{match.isLocal 
									? match.opponentName || 'Local Player' 
									: match.opponent || 'Unknown'
								}
							</td>
							<td className="px-12 py-4 text-left">{match.playerScore} - {match.opponentScore}</td>
							<td className={`px-12 py-4 text-left ${match.result === 'WIN' ? 'text-green-500' : 'text-red-500'}`}>{match.result}</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	)
}