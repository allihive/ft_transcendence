import { NavBar } from '../../components/NavBar'
import { useState, type JSX } from "react"
import { UsersNavBar } from './components/UsersNavBar';

export function UsersPage(): JSX.Element {
	const [activeItem, setActiveItem] = useState("user");
	const [activeTab, setActiveTab] = useState("newAccount");
	const [loggedIn, setLogIn] = useState(false);

	return (
		<div className="flex min-h-screen bg-gradient-to-t justify-center w-full from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange">
			<NavBar activeItem={activeItem} setActiveItem={setActiveItem}/>
			<div className="absolute top-8 left-1/2 transform -translate-x-1/2">
				<UsersNavBar activeTab={activeTab} setActiveTab={setActiveTab} loggedIn={loggedIn}/>
			</div>
			<div className="flex justify-center w-full px-8">
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
				<span className="px-4 text-black dark:text-background font-title">New User</span>
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
			</div>
		</div>
	)
}