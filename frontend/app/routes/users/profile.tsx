import { useEffect, useState, type ReactNode } from "react";
import { redirect, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { UserUpdateForm } from "~/components/forms/user/update/UserUpdateForm";
import { useAuth } from "~/stores/useAuth";
import { updateUser } from "~/api/users/updateUser";
import { GoogleUserUpdateForm } from "~/components/forms/user/update/GoogleUserUpdateForm";
import type { UpdateHandler } from "~/components/forms/user/update/types";
import type { UserUpdateData } from "~/api/types";
import { upload } from "~/api/media/file-upload";

export function clientLoader(): void {
	const { isLoggingIn, user } = useAuth.getState();

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
		const { avatar, ...rest } = data;
		const userUpdateData: UserUpdateData = { ...rest };
		setUpdating(true);

		try {
			if (avatar) {
				const fileUpload = await upload(avatar);
				userUpdateData.avatarUrl = fileUpload.url;
			}
			console.log("userUpdateData = ", userUpdateData);
			const updatedUser = await updateUser(userUpdateData);
			console.log("updateUser = ", updatedUser);
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
		<div className="max-w-[600px] mx-auto p-8">
			{user.authMethod === "password"
				?	<UserUpdateForm user={user} onUpdate={updateHandler} isProcessing={isUpdating} />
				:	<GoogleUserUpdateForm user={user} onUpdate={updateHandler} isProcessing={isUpdating} />
			}
		</div>
	);
}
