import type { JSX, MouseEventHandler } from "react";
import { NavLink, useNavigate } from "react-router";
import { AiFillHome } from "react-icons/ai";
import { RiPingPongFill } from "react-icons/ri";
import { GiLaurelsTrophy } from "react-icons/gi";
import { FaUser } from "react-icons/fa6";
import { BiSolidMessageRounded } from "react-icons/bi";

const getClassName = (isActive: boolean): string => {
	return `px-4 py-4 font-title ${isActive
		? "text-lightOrange dark:text-pop"
		: "text-darkBlue dark:text-lightOrange"
		}`;
}

export function SideBar(): JSX.Element {


	return (
		<div className=" flex flex-col items-center mt-8 ">
			<NavLink to="/" className={({ isActive }) => getClassName(isActive)}>
				<AiFillHome size={48} />
			</NavLink>
			<NavLink to="/tournament" className={({ isActive }) => getClassName(isActive)}>
				<GiLaurelsTrophy size={48} />
			</NavLink>
			<NavLink to="/play" className={({ isActive }) => getClassName(isActive)}>
				<RiPingPongFill size={48} />
			</NavLink>
			<NavLink to="/users/profile" className={({ isActive }) => getClassName(isActive)}>
				<FaUser size={48} />
			</NavLink>
			<NavLink to="/chat" className={({ isActive }) => getClassName(isActive)}>
				<BiSolidMessageRounded size={48} />
			</NavLink>
		</div>
	);
}
