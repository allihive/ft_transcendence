import { useEffect, useState, type ReactNode } from "react";
import { redirect, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { UserUpdateForm } from "~/components/forms/user/update/UserUpdateForm";
import { useAuth } from "~/stores/useAuth";
import { updateUser } from "~/api/users/updateUser";
import type { UpdateHandler } from "~/components/forms/user/update/types";
import type { UserUpdateData } from "~/api/types";

export function clientLoader(): void {
	const {isLoggingIn, user } = useAuth.getState();

	if (!isLoggingIn && !user) {
		throw redirect("/login");
	}
}

export default function Profile(): ReactNode {
	const navigate = useNavigate();
	const user = useAuth((state) => state.user);
	const setUser = useAuth((state) => state.setUser);
	const isLoggingIn = useAuth((state) => state.isLoggingIn);
	const [isUpdating, setUpdating] = useState<boolean>(false);

	const updateHandler: UpdateHandler = async (data) => {
		setUpdating(true);
		const userUpdateData: UserUpdateData = data;

		try {
			const updatedUser = await updateUser(userUpdateData);
			setUser(updatedUser);
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setUpdating(false);
		}
	};

	useEffect(() => {
		if (!isLoggingIn && !user) {
			navigate("/login");
		}
	}, [isLoggingIn, user, navigate]);

	if (isLoggingIn) {
		return <>Loading user ...</>;
	}

	if (!user) {
		return null;
	}

	return (
		<div className="flex flex-col">
			<UserUpdateForm user={user!} onUpdate={updateHandler} isProcessing={isUpdating} />
		</div>
	);
}
