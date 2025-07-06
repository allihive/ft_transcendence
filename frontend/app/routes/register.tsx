import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { UserRegisterForm } from "~/components/forms/user/register/UserRegisterForm";
import { useAuth } from "~/stores/useAuth";
import type { UserRegisterData } from "~/api/types";
import type { RegisterHandler } from "~/components/forms/user/register/types";
import { upload } from "~/api/media/file-upload";

export default function Register() {
	const register = useAuth((state) => state.register);
	const isRegistering = useAuth((state) => state.isRegistering);
	const navigate = useNavigate();

	const registerHandler: RegisterHandler = async (data) => {
		let avatarUrl: string | undefined = undefined;

		try {
			if (data.avatar) {
				const fileUpload = await upload(data.avatar);
				avatarUrl = fileUpload.url;
			}

			const userRegisterData: UserRegisterData = {
				email: data.email,
				name: data.name,
				username: data.username,
				avatarUrl,
				password: data.password
			};

			await register(userRegisterData);
			navigate("/");
		} catch (error) {
			toast.error((error as Error).message);
		}
	}

	return <UserRegisterForm onRegister={registerHandler} isProcessing={isRegistering} />
}
