import { Outlet } from "react-router";
import { type JSX } from "react";
import { SideBar } from "~/components/SideBar";
import { NavBar } from "~/components/NavBar";

export default function RootLayout(): JSX.Element {
	return (
		<div className="flex flex-col min-h-screen bg-background dark:bg-darkMode">
			<div className="flex justify-end p-4">
				<NavBar/>
			</div>
			<div className="flex flex-1 flex-row">
				<SideBar />
			<div className="flex flex-1 flex-col">
				<Outlet />
			</div>
			</div>
		</div>
	);
}
