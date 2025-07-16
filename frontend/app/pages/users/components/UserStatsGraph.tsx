import { useState, useEffect, type JSX } from "react"
import type { PlayerGameResult } from "../../../../backend/services/game/src/modules/game-history/gameHistory.service"
import { useTranslation } from "react-i18next";
import { BarChart, Bar, CartesianGrid, Label, Tooltip, XAxis, YAxis } from 'recharts'

const data = [
	{date: '6-15-25', score: '6', opponentScore: '4'}, 
	{date: '6-19-25', score: '7', opponentScore: '3'}, 
	{date: '7-9-25', score: '4', opponentScore: '6'}
];

export const MyChart = (): JSX.Element => {
	const { t } = useTranslation();

	return (
	<BarChart width={600} height={300} data={data}>
		<XAxis dataKey="date">
			<Label value={t('date')} offset={0} dy={5} position="insideBottom"/>
		</XAxis>
		<YAxis>
			<Label value={t('score')} angle={-90}/>
		</YAxis>
		<Tooltip formatter={(value, name) => [value, t(`chart.${name}`)]}/>
		<CartesianGrid />
		<Bar dataKey="score" fill="#59E2CA"/>
		<Bar dataKey="opponentScore" fill="#FBBB83"/>
	</BarChart>
	);
}