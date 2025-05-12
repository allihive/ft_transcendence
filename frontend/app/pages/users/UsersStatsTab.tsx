import { type JSX } from "react"

// interface GameData {
// 	data: string;
// 	opponent: string;
// 	score: string;
// 	result: string;
// }

export function UsersStats(): JSX.Element {
	//have name be passed as props?
	// const [matches, setMatches] = useState<Match[]>([]);

	// useEffect(() => {
	//   fetch("http://localhost:3001/api/matches")
	// 	.then((res) => res.json())
	// 	.then((data) => setMatches(data))
	// 	.catch((err) => console.error("Failed to fetch matches:", err));
	// }, []);
	//        {matches.map((match, index) => (
		// <tr key={index} className="border-b border-black dark:border-lightOrange"> put this in tbody

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
				<tr className="border-b border:black dark:border-lightOrange">
					<td className="px-12 py-4 text-left">15/4</td>
					<td className="px-12 py-4 text-left">username</td>
					<td className="px-12 py-4 text-left">5-6</td>
					<td className="px-12 py-4 text-left">loss</td>
				</tr>
				<tr className="border-b border:black dark:border-lightOrange">
					<td className="px-12 py-4 text-left">15/4</td>
					<td className="px-12 py-4 text-left">username</td>
					<td className="px-12 py-4 text-left">5-6</td>
					<td className="px-12 py-4 text-left">loss</td>
				</tr>
				<tr className="border-b border:black dark:border-lightOrange">
					<td className="px-12 py-4 text-left">15/4</td>
					<td className="px-12 py-4 text-left">username</td>
					<td className="px-12 py-4 text-left">5-6</td>
					<td className="px-12 py-4 text-left">loss</td>
				</tr>
			</tbody>
		</table>
		</>
	)
}