import { type JSX } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { RegisterFormProps, UserRegisterFormData, UserRegisterFormValues } from "./types";
import { useTranslation, Trans } from "react-i18next";

export function UserRegisterForm(props: RegisterFormProps): JSX.Element {
	const { onRegister, isProcessing } = props;
	const { register, handleSubmit, getValues, formState: { errors } } = useForm<UserRegisterFormValues>();
	const { t } = useTranslation();

	const onSubmit: SubmitHandler<UserRegisterFormValues> = async (data, event) => {
		const userRegisterFormData: UserRegisterFormData = {
			email: data.email,
			name: data.name,
			username: data.username,
			avatar: data.avatars?.[0],
			password: data.password
		};

		onRegister(userRegisterFormData, event);
	};

	return (
		<>
			<div className="flex items-center justify-center w-full px-8 my-4">
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
				<span className="px-4 text-black dark:text-background font-title">{t('newUser')}</span>
				<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>

			</div>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center items-center mt-10 font-title">
				<input
					{...register("avatars")}
					type="file"
					accept=".jpeg, .jpg, .png, image/jpeg, image/png"
					placeholder={t('image')}
					className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4"
				/>
				{errors.avatars ? <p className="text-xs font-body text-red-500">{errors.avatars.message}</p> : null}
				<input
					{...register("name", {
						required: {
							value: true,
							message: t("formErrors.nameRequired")
						}
					})}
					type="text"
					placeholder={t('name')}
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4"
				/>

				{errors.name ? <p className="text-xs font-body text-red-500">{errors.name.message}</p> : null}

				<input
					{...register("email", {
						required: {
							value: true,
							message: t("formErrors.emailRequired")
						},
						pattern: {
							value: /^[a-zA-Z0-9_.]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
							message: t('formErrors.validEmail')
						},
					})}
					type="email"
					placeholder={t('email')}
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4"
				/>

				{errors.email ? <p className="text-xs font-body text-red-500">{errors.email.message}</p> : null}

				<input
					{...register("username", {
						required: {
							value: true,
							message: t('formErrors.usernameRequired')
						},
						pattern: {
							value: /^[a-zA-Z0-9_-]+$/,
							message: t('formErrors.usernameRequirements')
						},
						minLength: {
							value: 6,
							message: t('formErrors.usernameMin'),
						}
					})}
					type="text"
					placeholder={t('username')}
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4"
				/>

				{errors.username ? <p className="text-xs font-body text-red-500">{errors.username.message}</p> : null}

				<input
					{...register("password", {
						required: {
							message: t("formErrors.passwordRequired"),
							value: true,
						},
						pattern: {
							value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/,
							message: t('formErrors.passwordRequirements'),
						},
						minLength: {
							value: 6,
							message: "Password must have 6 characters",
						}
					})}
					type="password"
					placeholder={t('password')}
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4"
				/>

				{errors.password ? <p className="text-xs font-body text-red-500">{errors.password.message}</p> : null}

				<input
					{...register("confirmPassword", {
						required: t('formErrors.conFirmPassword'),
						validate: (value) => value === getValues("password") || t('formErrors.mismatchPassword')
					})}
					type="password"
					placeholder={t('confirmPassword')}
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4"
				/>

				{errors.confirmPassword ? <p className="text-xs font-body text-red-500">{errors.confirmPassword.message}</p> : null}

				<button
					type="submit"
					disabled={isProcessing}
					className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4"
				>
					{t('register')}
				</button>
			</form>
		</>
	);
}
