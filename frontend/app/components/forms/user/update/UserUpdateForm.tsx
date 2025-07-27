import { type JSX } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Avatar } from "./Avatar";
import { Input } from "./Input";
import { getConfirmPasswordRule, getEmailRule, getNewPasswordRule, getPasswordRule, getUsernameRule } from "./rules";
import type { UserUpdateFormData, UserUpdateFormProps, UserUpdateFormValues } from "./types";
import { login } from "~/api/auth/login";

export function UserUpdateForm(props: UserUpdateFormProps): JSX.Element {
	const { t } = useTranslation();
	const { user, onUpdate, isProcessing } = props;

	const { register, handleSubmit, watch, formState: { errors } } = useForm<UserUpdateFormValues>({
		defaultValues: {
			email: user.email,
			name: user.name,
			username: user.username,
		}
	});

	const newPassword = watch("newPassword");

	const onSubmit: SubmitHandler<UserUpdateFormValues> = async (data, event) => {
		try {
			const verifiedUser = await login(user.email, data.password!, true);

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
	};

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

			<button
				type="submit"
				disabled={isProcessing}
				className="border-black border-2 p-2 bg-brown rounded-lg text-md font-title"
			>
				{t("saveChanges")}
			</button>
		</form >
	);
}