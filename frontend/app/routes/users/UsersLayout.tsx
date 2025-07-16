import { Outlet } from "react-router";
import { type JSX } from "react";
import { UsersNavBar } from "~/pages/users/components/UsersNavBar";

export default function UsersLayout(): JSX.Element {
	return (
		<div className="w-full">
			<div className="mx-auto flex flex-col container justify-center w-full px-8 sm:px-6 md:px-8">
				<UsersNavBar />
				<div className="w-full mt-4">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
