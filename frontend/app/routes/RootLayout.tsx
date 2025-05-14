import { Outlet } from "react-router";
import { type JSX } from "react";
import { NavBar } from "~/components/navbar";

export default function RootLayout(): JSX.Element {

	return (
		<div className="flex min-h-screen bg-gradient-to-t from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange">
			<NavBar />
			<div className="flex flex-1 flex-col">
				<Outlet />
			</div>
		</div>
	)
}
