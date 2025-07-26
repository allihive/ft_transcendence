import { useState, type JSX } from "react"
import { UsersNavBar } from './components/UsersNavBar';

export function UsersPage(): JSX.Element {

	return (
		<div className="flex items-center justify-center w-full px-8 my-4">
			<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
			<span className="px-4 text-black dark:text-background font-title">New User</span>
			<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>
			<div>
				
			</div>
		</div>
	)
}