import { useAuth } from "~/stores/useAuth";
import { redirect } from "react-router";
import { UserUpdateForm } from "~/components/forms/user/update/UserUpdateForm";
import type { UpdateHandler } from "~/components/forms/user/update/types";

export function clientLoader(): void {
	if (!useAuth.getState().user) {
		throw redirect("/login");
	}
}

export default function Profile() {
	const user = useAuth((state) => state.user);

	const updateHandler: UpdateHandler = async (data, event) => {

	};

	return (
		<div className="flex flex-col">
			<UserUpdateForm user={user!} onUpdate={updateHandler} />
		</div>
	);
}