import { type JSX } from 'react';
import { NavLink } from "react-router";
import { AiFillHome } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import { RiPingPongFill } from "react-icons/ri";
import { GiLaurelsTrophy } from "react-icons/gi";
import { FaUser } from "react-icons/fa6";
import { BiSolidMessageRounded } from "react-icons/bi";

// import { index } from '@react-router/dev/routes';

// type NavBarProps = {
// 	activeItem: string;
// 	setActiveItem: (item: string) => void;
// }
{/* <NavLink to="/search" 
className={({ isActive }) =>
	`px-4 py-4 font-title
		${isActive ? "text-lightOrange dark:text-pop"
		: "text-darkBlue dark:text-lightOrange "
		}` }>
<GoSearch size={48}/>
</NavLink> */}
export function NavBar(): JSX.Element {
	return (
		<div className=" flex flex-col items-center mt-8 ">
		<NavLink to="/"
				className={({ isActive }) =>
					`px-4 py-4 font-title
						${isActive ? "text-lightOrange dark:text-pop"
						: "text-darkBlue dark:text-lightOrange "
						}` }>
				<AiFillHome size={48}/>
			</NavLink>
			<NavLink to="/tournament" 
				className={({ isActive }) =>
					`px-4 py-4 font-title
						${isActive ? "text-lightOrange dark:text-pop"
						: "text-darkBlue dark:text-lightOrange "
						}` }>
				<GiLaurelsTrophy size={48}/>
			</NavLink>
			<NavLink to="/play" 
				className={({ isActive }) =>
					`px-4 py-4 font-title
						${isActive ? "text-lightOrange dark:text-pop"
						: "text-darkBlue dark:text-lightOrange "
						}` }>
				<RiPingPongFill size={48}/>
			</NavLink>
			<NavLink to="/users" 
				className={({ isActive }) =>
					`px-4 py-4 font-title
						${isActive ? "text-lightOrange dark:text-pop"
						: "text-darkBlue dark:text-lightOrange "
						}` }>
				<FaUser size={48}/>
			</NavLink>
			<NavLink to="/chat" 
				className={({ isActive }) =>
					`px-4 py-4 font-title
						${isActive ? "text-lightOrange dark:text-pop"
						: "text-darkBlue dark:text-lightOrange "
						}` }>
				<BiSolidMessageRounded size={48}/>
			</NavLink>
	</div>
	);
}
