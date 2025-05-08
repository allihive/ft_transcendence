import { Outlet } from "react-router";
import { useState, type JSX } from "react";
import { NavBar } from "~/components/NavBar";

export default function RootLayout(): JSX.Element {
	const [activeItem, setActiveItem] = useState("home");

	return (
		<div className="flex min-h-screen bg-gradient-to-t from-darkOrange to-background dark:from-darkBlue dark:to-darkOrange">
			<NavBar activeItem={activeItem} setActiveItem={setActiveItem} />
			<div className="flex flex-col items-center justify-center">
				<Outlet />
			</div>
		</div>
	)
}6