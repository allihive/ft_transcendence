import { useState, useEffect, type JSX } from "react"
// import type { PlayerGameResultDto } from "../../../../backend/services/game/src/modules/gameHistory/gameHistory.service"
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
	const { t } = useTranslation();

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
						<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('name')}</th>
						<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('name')}</th>
						<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('rank')}</th>
						<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('status')}</th>
						<th className="font-title text-darkOrange px-12 py-8 text-left ">{t('message')}</th>
					</tr>
				</thead>
				<tbody>
					<tr className="font-title">
						<td className="px-12 py-2 text-center">Sumin name</td>
						<td className="px-12 py-2 text-center">60th rank</td>
						<td className="px-12 py-2 text-center">friend online</td>
						<td className="px-12 py-2 text-center">Sumin</td>
						<td className="px-12 py-2 text-center">Gold</td>
						<td className="px-12 py-2 text-center">Online</td>
						<td className="px-12 py-2 text-center">
							<button className="text-pop flex items-center justify-center w-full"><BiSolidMessageRounded size={32}/></button>
						</td>
					</tr>
					<tr className="font-title">
						<td className="px-12 py-2 text-center">Timo</td>
						<td className="px-12 py-2 text-center">Silver</td>
						<td className="px-12 py-2 text-center">Offline</td>
						<td className="px-12 py-2 text-center">
							<button className="text-pop flex items-center justify-center w-full"><BiSolidMessageRounded size={32}/></button>
						</td>
					</tr>
				</tbody>
			</table>
		</>
	);
}