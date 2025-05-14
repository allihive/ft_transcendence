import {  type JSX } from "react"
import { NavLink } from "react-router";

export function UsersNavBar(): JSX.Element {

return (

	<div className=" flex flex-col flex-1 items-center mt-8 ">
		<div className="flex space-x-4 mb-8">
		<NavLink to="/users/friends" 
				className={({ isActive }) =>
					`px-4 py-2 font-title rounded-lg border 
						${isActive ? "bg-lightOrange text-black border-black"
						: "text-black dark:text-background border-black dark:border-background"
						}` }>
				Friends
			</NavLink>
			<NavLink to="/users/profile" 
				className={({ isActive }) =>
					`px-4 py-2 font-title rounded-lg border 
						${isActive ? "bg-lightOrange text-black border-black"
						: "text-black dark:text-background border-black dark:border-background"
						}` }>
				Profile
			</NavLink>
			<NavLink to="/users/stats" 
				className={({ isActive }) =>
					`px-4 py-2 font-title rounded-lg border 
						${isActive ? "bg-lightOrange text-black border-black"
						: "text-black dark:text-background border-black dark:border-background"
						}` }>
				Stats
			</NavLink>
		</div>
	</div>
	);
}