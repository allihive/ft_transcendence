import { GiLaurelsTrophy } from "react-icons/gi";
import { useState, type JSX } from "react"

export function TournamentPage(): JSX.Element {

	return (
	<div className="flex flex-col justify-center items-center w-full pb-16">
		<div className="flex items-center justify-center w-full px-8 my-12">
			<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
			<span className="px-4 text-black dark:text-background font-title">Leader Board</span>
			<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>
		</div>
		<div className="w-[600px] h-[250px] relative bg-pop border-4 border-black rounded-4xl shadow-md">
			<div className="flex flex-col font-title items-center text-2xl justify-between h-full py-4">
				<span className="py-4">Your Rank</span>
				<span className="text-darkOrange ">4000</span>
				<div className="flex flex-row space-x-4">
					<span className="text-darkBlue">80th</span>
					<span>percentile</span>
				</div>
			</div>
		</div>
		<div className="text-darkBlue dark:text-background py-12">
			<GiLaurelsTrophy size={56} />
		</div>
		<table className="table-auto mx-auto border-darkOrange bg-lightOrange rounded-xl">
			<thead>
				<tr>
					<th className="font-title text-darkOrange px-12 py-8 text-left ">Rank</th>
					<th className="font-title text-darkOrange px-12 py-8 text-left ">Player</th>
					<th className="font-title text-darkOrange px-12 py-8 text-left ">Name</th>
					<th className="font-title text-darkOrange px-12 py-8 text-left ">Score</th>
				</tr>
			</thead>
			<tbody>
				<tr className="font-title">
					<td className="px-12 py-4 text-center">1</td>
					<td className="px-12 py-4 text-center">SuminK</td>
					<td className="px-12 py-4 text-center">Sumin</td>
					<td className="px-12 py-4 text-center">500</td>
				</tr>
				<tr className="font-title">
					<td className="px-12 py-8 text-center">2</td>
					<td className="px-12 py-8 text-center">HoangT</td>
					<td className="px-12 py-8 text-center">Hoang</td>
					<td className="px-12 py-8 text-center">300</td>
				</tr>
				<tr className="font-title">
					<td className="px-12 py-8 text-center">3</td>
					<td className="px-12 py-8 text-center">TimmoS</td>
					<td className="px-12 py-8 text-center">Timmo</td>
					<td className="px-12 py-8 text-center">200</td>
				</tr>
				<tr className="font-title">
					<td className="px-12 py-8 text-center">4</td>
					<td className="px-12 py-8 text-center">JosephL</td>
					<td className="px-12 py-8 text-center">Joseph</td>
					<td className="px-12 py-8 text-center">100</td>
				</tr>
				<tr className="font-title">
					<td className="px-12 py-8 text-center">5</td>
					<td className="px-12 py-8 text-center">AliceL</td>
					<td className="px-12 py-8 text-center">Alice</td>
					<td className="px-12 py-8 text-center">65</td>
				</tr>
			</tbody>
		</table>
	</div>
	)
}