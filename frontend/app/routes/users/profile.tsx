import { useState, type JSX } from "react";
import { toast } from "react-hot-toast";
import { upload } from "~/api/media/file-upload";
import { updateUser } from "~/api/users/updateUser";
import { GoogleUserUpdateForm } from "~/components/forms/user/update/GoogleUserUpdateForm";
import { UserUpdateForm } from "~/components/forms/user/update/UserUpdateForm";
import { useAuth } from "~/stores/useAuth";
import type { UserUpdateData } from "~/api/types";
import type { UpdateHandler } from "~/components/forms/user/update/types";

export default function Profile(): JSX.Element {
	const user = useAuth((state) => state.user);
	const setUser = useAuth((state) => state.setUser);
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

			const updatedUser = await updateUser(userUpdateData);
			setUser(updatedUser);
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div className="max-w-[600px] mx-auto p-8">
			{user?.authMethod === "password"
				?	<UserUpdateForm user={user} onUpdate={updateHandler} isProcessing={isUpdating} />
				:	<GoogleUserUpdateForm user={user!} onUpdate={updateHandler} isProcessing={isUpdating} />
			}
		</div>
	);
}
