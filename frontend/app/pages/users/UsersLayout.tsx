import { NavBar } from '../../components/NavBar'
import { useState, type JSX } from "react"

export function UsersPage(): JSX.Element {

	return (
		<div className="flex min-h-screen bg-gradient-to-t from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange">
			<NavBar />
			<div className="flex-1 p-4 text-white">users page</div>
		</div>
	)
}