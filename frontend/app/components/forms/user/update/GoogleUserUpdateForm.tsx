import type { JSX } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Avatar } from "./Avatar";
import { Input } from "./Input";
import { getUsernameRule } from "./rules";
import type { UserUpdateFormData, UserUpdateFormProps, UserUpdateFormValues } from "./types";

export function GoogleUserUpdateForm(props: UserUpdateFormProps): JSX.Element {
	const { t } = useTranslation();
	const { user, onUpdate, isProcessing } = props;

	const { register, handleSubmit, formState: { errors } } = useForm<UserUpdateFormValues>({
		defaultValues: {
			name: user.name,
			username: user.username,
		}
	});

	const onSubmit: SubmitHandler<UserUpdateFormValues> = async (data, event) => {
		const googleUserUpdateFormData: UserUpdateFormData = { id: user.id };

		if (data.name && data.name !== user.name) googleUserUpdateFormData.name = data.name;
		if (data.username && data.username !== user.username) googleUserUpdateFormData.username = data.username;
		if (data.avatars?.[0]) googleUserUpdateFormData.avatar = data.avatars[0];

		onUpdate(googleUserUpdateFormData, event);
	}

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
				props={{
					...register("username", getUsernameRule()),
					type: "text",
					placeholder: user.username
				}}
			/>

			<Input
				title={t("email")}
				props={{ type: "email", placeholder: user.email, readOnly: true }}
			/>

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