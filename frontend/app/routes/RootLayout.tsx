import { Outlet } from "react-router";
import { type JSX } from "react";
import { NavBar } from "~/components/navbar";

export default function RootLayout(): JSX.Element {

	return (
		<div className="flex min-h-screen bg-background dark:bg-darkMode">
			<NavBar />
			<div className="flex flex-1 flex-col">
				<Outlet />
			</div>
		</div>
	)
}
