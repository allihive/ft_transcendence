import {  type JSX } from "react"
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

export function UsersNavBar(): JSX.Element {

	const {t} = useTranslation();

return (

	<div className=" flex flex-col flex-1 items-center mt-8 ">
		<div className="flex space-x-4 mb-8">
		<NavLink to="/users/friends" 
				className={({ isActive }) =>
					`px-4 py-2 font-title rounded-lg border 
						${isActive ? "bg-lightOrange text-black border-black"
						: "text-black dark:text-background border-black dark:border-background"
						}` }>
				{t('friends')}
			</NavLink>
			<NavLink to="/users/profile" 
				className={({ isActive }) =>
					`px-4 py-2 font-title rounded-lg border 
						${isActive ? "bg-lightOrange text-black border-black"
						: "text-black dark:text-background border-black dark:border-background"
						}` }>
				{t('profile')}
			</NavLink>
			<NavLink to="/users/stats" 
				className={({ isActive }) =>
					`px-4 py-2 font-title rounded-lg border 
						${isActive ? "bg-lightOrange text-black border-black"
						: "text-black dark:text-background border-black dark:border-background"
						}` }>
				{t('stats')}
			</NavLink>
		</div>
	</div>
	);
}