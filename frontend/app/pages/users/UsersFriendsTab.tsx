import { NavBar } from '../../components/NavBar'
import { useState, type JSX } from "react"
import { UsersNavBar } from './components/UsersNavBar';

export function UsersPage(): JSX.Element {
	const [activeItem, setActiveItem] = useState("user");
	const [activeTab, setActiveTab] = useState("friends");
	const [loggedIn, setLogIn] = useState(false);

	return (
		<div className="flex min-h-screen bg-gradient-to-t from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange">
			<NavBar activeItem={activeItem} setActiveItem={setActiveItem}/>
			<UsersNavBar activeTab={activeTab} setActiveTab={setActiveTab} loggedIn={loggedIn}/>
		</div>
	)
}