import type { JSX } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Avatar } from "./Avatar";
import { Input } from "./Input";
import { getConfirmPasswordRule, getEmailRule, getNewPasswordRule, getPasswordRule, getUsernameRule } from "./rules";
import type { UserUpdateFormData, UserUpdateFormProps, UserUpdateFormValues } from "./types";
import { verifyCredentials } from "~/api/auth/verify";
import toast from "react-hot-toast";

export function UserUpdateForm(props: UserUpdateFormProps): JSX.Element {
	const { t } = useTranslation();
	const { user, onUpdate, isProcessing } = props;

	const { register, handleSubmit, watch, formState: { errors } } = useForm<UserUpdateFormValues>({
		defaultValues: {
			email: user.email,
			name: user.name,
			username: user.username,
			isTwoFactorEnabled: user.isTwoFactorEnabled
		}
	});

	const newPassword = watch("newPassword");

	const onSubmit: SubmitHandler<UserUpdateFormValues> = async (data, event) => {
		try {
			const verifiedUser = await verifyCredentials(user.email, data.password!);

			if (!verifiedUser) {
				throw new Error("Invalid password");
			}

			const userUpdateFormData: UserUpdateFormData = { id: user.id };

			if (data.email && data.email !== user.email) userUpdateFormData.email = data.email;
			if (data.name && data.name !== user.name) userUpdateFormData.name = data.name;
			if (data.username && data.username !== user.username) userUpdateFormData.username = data.username;
			if (data.avatars?.[0]) userUpdateFormData.avatar = data.avatars[0];
			if (data.newPassword) userUpdateFormData.newPassword = data.newPassword;

			onUpdate(userUpdateFormData, event);
		} catch (error) {
			toast.error((error as Error).message);
		}
	}

	// const [is2FAenabled, setIs2FAEnabled] = useState(false);

	// const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	setIs2FAEnabled(e.target.checked);
	// }

	// const closePopup = () => {
	// 	setIs2FAEnabled(false);
	// }

	// const setupTwoFactorHandler: ChangeEventHandler<HTMLInputElement> = async (event) => {
	// 	if (event.target.checked) {
	// 		setup
	// 	}
	// };

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4 items-stretch">
			<Avatar avatarInputProps={{ ...register("avatars") }} url={user.avatarUrl} error={errors.avatars} />

			<Input
				title={t("name")}
				error={errors.name}
				props={{ ...register("name"), type: "text", placeholder: user.name }}
			/>

			<Input
				title={t("username")}
				error={errors.username}
				props={{ ...register("username", getUsernameRule()), type: "text", placeholder: user.username }}
			/>

			<Input
				title={t("email")}
				error={errors.email}
				props={{ ...register("email", getEmailRule()), type: "email", placeholder: user.email }}
			/>

			<Input
				title={t("password")}
				error={errors.password}
				props={{ ...register("password", getPasswordRule()), type: "password", placeholder: t("password") }}
			/>

			<Input
				title={t("newPassword")}
				error={errors.newPassword}
				props={{ ...register("newPassword", getNewPasswordRule()), type: "password", placeholder: t("newPassword") }}
			/>

			<Input
				title={t("confirmPassword")}
				error={errors.confirmPassword}
				props={{ ...register("confirmPassword", getConfirmPasswordRule(newPassword)), type: "password", placeholder: t("confirmPassword") }}
			/>

			{/* <label className="inline-flex items-center cursor-pointer">
				<input type="checkbox"
					onChange={handleToggle}
					className="sr-only peer"
					checked={is2FAenabled} />
				<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus: dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
				<span className="ms-3 text-sm font-medium font-title text-gray-900 dark:text-background">{t('enable2factorAuth')}</span>
			</label> */}

			{/* <Switch
				label={t("enable2FA")}
				inputProps={{
					...register("isTwoFactorEnabled"),
					onChange: setupTwoFactorHandler
				}}
			/>

			<TwoFactorModal
				isOpen={is2FAenabled}
				onClose={closePopup}
			/> */}

			<button
				type="submit"
				disabled={isProcessing}
				className="border-black border-2 p-2 bg-brown rounded-lg text-md font-title"
			>
				{t("saveChanges")}
			</button>
		</form >

	)
}