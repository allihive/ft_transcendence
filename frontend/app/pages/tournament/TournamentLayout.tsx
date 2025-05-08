import { NavBar } from '../../components/NavBar'
import { useState, type JSX } from "react"

export function TournamentPage(): JSX.Element {
	const [activeItem, setActiveItem] = useState("tournament");

	return (
			<div className="p-4 text-white">Tournament page</div>
	)
}