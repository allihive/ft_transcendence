import { useState, useEffect, type JSX } from "react"
import { useTranslation } from "react-i18next";
import { BarChart, Bar, CartesianGrid, Label, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { getUserStats } from "~/api/stats/getUserStats";
import type { getUserMatchHistory } from "~/api/stats/types";
import type { UserStats } from "~/api/types";
import { UsersStats, type PlayerGameResult } from "~/pages/users/UsersStatsTab";


// const data = [
// 	{ date: '6-15-25', score: '6', opponentScore: '4' },
// 	{ date: '6-19-25', score: '7', opponentScore: '3' },
// 	{ date: '7-9-25', score: '4', opponentScore: '6' }
// ];

const COLORS = ['#59E2CA', '#FBBB83'];

// const [pieData, setPieData] = useState([]);



interface CustomTooltipProps {
	active?: boolean;
	payload?: any[];
}

export type PieChartData = {
	name: string;
	percentage: number;
	matchesPlayed: number;
}

export type MyChartProps = {
	matches: getUserMatchHistory[];
	userStats: PieChartData[];
};


const CustomPieToolTip = ({ active, payload }: CustomTooltipProps) => {
	const { t } = useTranslation();
	//  console.log(payload[0].payload);

	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="custom-tooltip p-2 bg-white border rounded shadow text-black">
				<p>{`${t(data.name)}: ${data.percentage}%`}</p>
				<p>{t('totalGames')}: {data.matchesPlayed}</p>
			</div>
		);
	}
	return null;
}

export const MyChart = ({ matches, userStats }: MyChartProps): JSX.Element => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-row space-x-15">
			<h2 className="flex flex-col items-center justify-center font-title text-darkOrange dark:text-background">
				{t('latestMatches')}
				{matches ?
					<BarChart width={600} height={400} data={matches}>
					<XAxis dataKey="date" style={{fontSize: 12, fill: "#985D3e", fontFamily: 'Orbitron'}} >
						<Label value={t('date')} 
								offset={0} 
								dy={5} 
								position="insideBottom" 
								style={{fontSize: 16, fill: "#BD542E"}}/>
					</XAxis>
					<YAxis>
						<Label value={t('score')} angle={-90} style={{fontSize: 16, fill: "#BD542E"}} />
					</YAxis>
					<Tooltip formatter={(value, name) => [value, name === 'playerScore' ? t('yourScore') : t('opponentScore')]} />
					<CartesianGrid />
					<Bar dataKey="playerScore" fill="#59E2CA" />
					<Bar dataKey="opponentScore" fill="#FBBB83" />
				</BarChart>
				: (
					<p className="text-title text-black dark:text-background">{t('noData')}</p>
				)
				}
			</h2>
			<h2 className="flex flex-col items-center justify-center font-title text-darkOrange dark:text-background">
				{t('gameHistory')}
				{userStats.length !== 0 ? (
					<PieChart width={400} height={400}>
						<Pie
							data={userStats}
							dataKey="percentage"
							cx="50%"
							cy="50%"
							outerRadius={150}
						>
							{userStats.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip content={CustomPieToolTip} />
					</PieChart>

				) : (
					<p className="text-title text-black dark:text-background">{t('noData')}</p>
				)}
			</h2>
		</div>
	);
}