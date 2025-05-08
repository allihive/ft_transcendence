import { useState, type JSX } from "react"
import { Link, useNavigate } from "react-router";

export interface UserItemProps {
	isActive:boolean;
	onClick: () => void;
	buttonText: string;
}

const UserItem: React.FC<UserItemProps> = ({ isActive, onClick, buttonText}) => {
	return (
		<button
		onClick={onClick}
		className={`px-6 py-2 font-title rounded-lg border 
			${isActive ? 'bg-lightOrange text-black border-black' : 'text-black dark:text-background border-black dark:border-background'}`}
			>
		{buttonText}
	</button>
	)
}

interface UserNavBarProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
	loggedIn: boolean;
}

export function UsersNavBar({ activeTab, setActiveTab, loggedIn }: UserNavBarProps): JSX.Element {
	const navigate = useNavigate();

	const handleClick = (name: string) => {
		setActiveTab(name);
		if (loggedIn === true)
		{
			if (name === 'friends') navigate("friends");
			else if (name === 'stats') navigate("stats");
			else if (name === 'profile') navigate("profile");
		}
		else {
			<div className="font-body text-4xl items-center border border-black mt-10">Please Login in first or create an account</div>
			navigate("/users");
		}
	}
return (

	<div className=" flex flex-col flex-1 items-center mt-8 ">
		<div className="flex space-x-4 mb-8">
			<UserItem onClick={() => handleClick('friends')} 
				isActive={activeTab === 'friends'} 
				buttonText="Friends" />
			<UserItem onClick={() => handleClick("stats")} 
				isActive={activeTab === 'stats'} 
				buttonText="Stats" />
			<UserItem onClick={() => handleClick("profile")} 
				isActive={activeTab === 'profile'} 
				buttonText="Profile" />
			<Link to="/stats">Stats</Link>
		</div>
	</div>
	);
}