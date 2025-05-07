import { NavBar } from '../../components/navbar'
import { useState, type JSX } from "react"

export function UsersPage(): JSX.Element {
	const [activeItem, setActiveItem] = useState("user");
	return (
		<div className="flex min-h-screen bg-gradient-to-t from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange">
			<NavBar activeItem={activeItem} setActiveItem={setActiveItem}/>
			<div className="p-4 text-white">users page</div>
		</div>
	)
}