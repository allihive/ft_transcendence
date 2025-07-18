import { useState, useEffect, type JSX } from "react"
import type { PlayerGameResult } from "../../../../backend/services/game/src/modules/game-history/gameHistory.service"
import { useTranslation } from "react-i18next";
import { BarChart, Bar, CartesianGrid, Label, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'

const data = [
	{ date: '6-15-25', score: '6', opponentScore: '4' },
	{ date: '6-19-25', score: '7', opponentScore: '3' },
	{ date: '7-9-25', score: '4', opponentScore: '6' }
];
const COLORS = ['#59E2CA', '#FBBB83'];

const pieData = [
	{ name: 'win', percentage: 60, fill: "#59E2CA" },
	{ name: 'loss', percentage: 40, fill: "#BD542E" }
]
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomPieToolTip = ({active, payload}: CustomTooltipProps) => {
	const { t } = useTranslation();

	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="custom-tooltip p-2 bg-white border rounded shadow">
				<p>{`${data.name}: ${data.percentage}`}</p>
				<p>{t('totalGames')}: 100</p>
			</div>
		);
	}
	return null;
}

export const MyChart = (): JSX.Element => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-row space-x-15">
			<h2 className="flex flex-col items-center justify-center font-title">
				{t('latestMatches')}
			<BarChart width={600} height={400} data={data}>
				<XAxis dataKey="date">
					<Label value={t('date')} offset={0} dy={5} position="insideBottom" />
				</XAxis>
				<YAxis>
					<Label value={t('score')} angle={-90} />
				</YAxis>
				<Tooltip formatter={(value, name) => [value, t(`chart.${name}`)]} />
				<CartesianGrid />
				<Bar dataKey="score" fill="#59E2CA" />
				<Bar dataKey="opponentScore" fill="#FBBB83" />
			</BarChart>
			</h2>
			<h2 className="flex flex-col items-center justify-center font-title">
				{t('gameHistory')}
			<PieChart width={400} height={400}>
				<Pie
					data={pieData}
					dataKey="percentage"
					cx="50%"
					cy="50%"
					outerRadius={150}
				>
					{pieData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
					))}
				</Pie>
				<Tooltip content={CustomPieToolTip}/>
			</PieChart>
			</h2>
		</div>
	);
}