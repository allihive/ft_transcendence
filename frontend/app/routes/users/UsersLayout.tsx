import { Outlet } from "react-router";
import { type JSX } from "react";
import { UsersNavBar } from "~/pages/users/components/UsersNavBar";

export default function UsersLayout(): JSX.Element {
	return (
		<div className="w-screen">
			<div className="flex flex-col items-center w-full max-w-6xl px-4">
				<UsersNavBar />
				<div className="w-full mt-4">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
