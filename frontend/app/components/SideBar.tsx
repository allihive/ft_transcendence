import type { JSX, MouseEventHandler } from "react";
import { NavLink, useNavigate } from "react-router";
import { AiFillHome } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import { RiPingPongFill } from "react-icons/ri";
import { GiLaurelsTrophy } from "react-icons/gi";
import { FaUser } from "react-icons/fa6";
import { BiSolidMessageRounded } from "react-icons/bi";
import { IoIosLogOut } from "react-icons/io";
import { useAuth } from "~/stores/useAuth";
import { toast } from "react-hot-toast";

const getClassName = (isActive: boolean): string => {
	return `px-4 py-4 font-title ${isActive
		? "text-lightOrange dark:text-pop"
		: "text-darkBlue dark:text-lightOrange"
		}`;
}

export function SideBar(): JSX.Element {
	const navigate = useNavigate();
	const user = useAuth((state) => state.user);
	const logout = useAuth((state) => state.logout);

	const logoutHandler: MouseEventHandler<HTMLButtonElement> = async (event) => {
		try {
			await logout();
			alert("You've successfully signed out");
			navigate("/");
		} catch (error) {
			toast.error((error as Error).message);
		}
	}

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
			<NavLink to="/search" className={({ isActive }) => getClassName(isActive)}>
				<GoSearch size={48} />
			</NavLink>
			{user ?
				<button className="hover:text-lightOrange" onClick={logoutHandler}>
					<IoIosLogOut size={48} />
				</button>
				:
				null
			}
		</div>
	);
}
