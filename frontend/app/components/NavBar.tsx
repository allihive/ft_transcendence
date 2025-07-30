import type { JSX } from 'react';
import { useState } from 'react';
import { NavLink } from "react-router";
import { IoIosLogOut } from "react-icons/io";
import { GoSearch } from "react-icons/go";
import { useAuth } from "~/stores/useAuth";
import { useLanguageStore } from "~/stores/useLanguageStore"; // update path as needed
import { toast } from "react-hot-toast";
import { useNavigate } from 'react-router';
import type { MouseEventHandler } from "react";

const getClassName = (isActive: boolean): string => {
	return `px-4 py-4 font-title ${isActive
		? "text-lightOrange dark:text-pop"
		: "text-darkBlue dark:text-lightOrange"
	}`;
}

export function NavBar(): JSX.Element {

	const logoutHandler: MouseEventHandler<HTMLButtonElement> = async (event) => {
		try {
			await logout();
			alert("You've successfully signed out");
			navigate("/");
		} catch (error) {
			toast.error((error as Error).message);
		}
	}


	const { language, setLanguage } = useLanguageStore();
	const navigate = useNavigate();
	const user = useAuth((state) => state.user);
	const logout = useAuth((state) => state.logout);
	const [open, setOpen] = useState(false);

	return (
		<>
			<div className="flex flex-row items-center mt-8 space-x-4">
			{user ?
				<button className="hover:text-lightOrange" onClick={logoutHandler}>
					<IoIosLogOut size={48} />
				</button>
				:
				null
			}
			<select
				value={language}
				onChange={async (e) => await setLanguage(e.target.value)}
				className="p-1 border border-black font-body rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
			>
				<option value="en">English</option>
				<option value="es">Español</option>
				{/* Add more languages if needed */}
			</select>
			</div>
		</>
  );
}
