import { useState, useEffect, type JSX } from "react"
import type { PlayerGameResult } from "../../../../backend/services/game/src/modules/game-history/gameHistory.service"
import { IoIosCloseCircleOutline } from "react-icons/io";
import { CiCircleCheck } from "react-icons/ci";
import { BiSolidMessageRounded } from "react-icons/bi";
import { useTranslation } from "react-i18next";


//3 will need to be replaced by how many of the person's friends are online
//5 will be replaced with number of friends
//onclick for accepting and denying friend requests
//tables will have to loop
//onlick for message button

export function UsersFriends(): JSX.Element {
	const test_playerId = 1;

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
				setMatches([]);}
	})
		.catch((err) => console.error("Failed to fetch matches:", err));
	}, []);
	console.log("matches:", matches)
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
			<span className="px-4 text-black dark:text-background font-title">{t('hello')} Name</span>
			<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>
		</div>
			<table className="table-auto mx-auto ">
			<thead>
				<tr>
				<th className="px-12 text-left font-title text-brown dark:text-darkBlue">{t('requests')}</th>
				<th className="px-12 text-left font-title text-brown dark:text-darkBlue">
					<div className="flex flex-row space-x-4">
					<span className="text-green-500 dark:text-green-300">{t('friendsOnline', {count: 2})}</span>
					</div>
				</th>
				</tr>
			</thead>
			<tbody className="font-body text-black dark:text-background">
			<tr>
				<td className="px-12 py-4 text-left flex flex-row">
					<div className="flex items-center justify-between w-full">
						<span>JoesphL</span>
					</div>
					<div className="flex space-x-4 pl-4">
						<button className="text-green-500 dark:text-green-300"><CiCircleCheck size={24}/></button>
						<button className="text-red-500" ><IoIosCloseCircleOutline size={24}/></button>
					</div>
				</td>
				<td className="px-12 py-4 text-left">Sumin</td>
			</tr>
			<tr>
				<td className="px-12 py-4 text-left flex flex-row">
					<div className="flex items-center justify-between w-full">
						<span>SuminK</span>
					</div>
					<div className="flex space-x-4 pl-4">
						<button className="text-green-500 dark:text-green-300"><CiCircleCheck size={24}/></button>
						<button className="text-red-500" ><IoIosCloseCircleOutline size={24}/></button>
					</div>
				</td>
				<td className="px-12 py-4 text-left">Timo</td>
			</tr>
			</tbody>
			</table>
			<table className="table-auto mx-auto border-darkOrange bg-lightOrange rounded-xl mt-4">
				<thead>
					<tr>
						<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('name')}/th>
						<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('rank')}</th>
						<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('status')}</th>
						<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('message')}</th>
					</tr>
				</thead>
				<tbody>
					<tr className="font-title">
						<td className="px-12 py-2 text-center">{friend.name}</td>
						<td className="px-12 py-2 text-center">{friend.rank}</td>
						<td className="px-12 py-2 text-center">{friend.status}</td>
						<td className="px-12 py-2 text-center">
							<button className="text-pop flex items-center justify-center w-full"><BiSolidMessageRounded size={32}/></button>
						</td>
					</tr>
				
				</tbody>
			</table>
	
		</>
	);
}