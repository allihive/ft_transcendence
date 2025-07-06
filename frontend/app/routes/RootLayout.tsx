import { Outlet } from "react-router";
import { type JSX } from "react";
import { SideBar } from "~/components/SideBar";

export default function RootLayout(): JSX.Element {
	return (
		<div className="flex min-h-screen bg-background dark:bg-darkMode">
			<SideBar />
			<div className="flex flex-1 flex-col">
				<Outlet />
			</div>
		</div>
	);
}
