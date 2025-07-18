import { useForm } from "react-hook-form";
import type { JSX } from "react";
import type { SubmitHandler } from "react-hook-form";
import type { UserUpdateFormData, UserUpdateFormProps, UserUpdateFormValues } from "./types";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import TwoFactorModal from "~/components/buttons/2FAToggle"


export function UserUpdateForm(props: UserUpdateFormProps): JSX.Element {
	const {t} = useTranslation();
	const { user, onUpdate, isProcessing } = props;
	const { register, handleSubmit, getValues, formState: { errors } } = useForm<UserUpdateFormValues>({
		defaultValues: {
			email: user.email,
			name: user.name,
			username: user.username
		}
	});

	const onSubmit: SubmitHandler<UserUpdateFormValues> = async (data, event) => {
		const userUpdateFormData: UserUpdateFormData = {
			id: user.id,
			email: data.email,
			name: data.name,
			username: data.username,
			avatar: data.avatars?.[0],
			newPassword: data.newPassword
		};

		onUpdate(userUpdateFormData, event);
	}

	const[is2FAenabled, setIs2FAEnabled] = useState(false);

	const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIs2FAEnabled(e.target.checked);
	}

	const closePopup = () => {
		setIs2FAEnabled(false);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4 items-stretch">
			<div className="flex flex-col items-center">
				<img src={user.avatarUrl} alt="Avatar" className="block w-[100px] h-auto rounded-full m-auto" />

				<label htmlFor="avatar" className="hover:cursor-pointer font-body">{t('changeAvatar')}</label>
				<input {...register("avatars")} id="avatar" type="file" accept=".jpeg, .jpg, .png, image/jpeg, image/png" className="hidden" />

				{errors.avatars && <p className="text-xs font-body text-red-500">{errors.avatars.message}</p>}
			</div>

			<div className="font-title text-md dark:text-background">{t('name')}</div>

			<input
				{...register("name")}
				type="text"
				placeholder={user.name}
				className="p-2 border-2 font-body border-black dark:border-background dark:text-background rounded-lg"
			/>

			{errors.name && <p className="text-xs font-body">{errors.name.message}</p>}

			<div className="font-title text-md dark:text-background">{t('username')}</div>

			<input
				type="text"
				placeholder={user?.username}
				className="p-2 border-2 font-body border-black dark:border-background dark:text-background rounded-lg"
				{...register("username", {
					pattern: {
						value: /^[a-zA-Z0-9_-]+$/,
						message: t('formErrors.usernameRequirements'),
					},
					minLength: {
						value: 6,
						message: t('formErrors.usernameMin'),
					}
				})}
			/>
			{errors.username ? <p className="text-xs font-body text-red-500">{errors.username.message}</p> : null}

			<div className="font-title text-md dark:text-background">{t('email')}</div>

			<input
				{...register("email", {
					pattern: {
						value: /^[a-zA-Z0-9_.]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
						message: t('validEmail'),
					},
				})}
				type="text"
				placeholder={user?.email}
				className="p-2 border-2 font-body border-black dark:border-background dark:text-background rounded-lg"
			/>
			{errors.email ? <p className="text-xs font-body text-red-500">{errors.email.message}</p> : null}

			<div className="font-title text-md dark:text-background">{t('currentPassword')}</div>

			<input
				{...register("currentPassword", {
					required: {
						message: t('formErrors.currentPassRequired'),
						value: true,
					},
					pattern: {
						value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/,
						message: t('formErrors.passwordRequirements'),
					},
					minLength: {
						value: 6,
						message: t('formErrors.passwordLen'),
					}
				})}
				type="password"
				placeholder={t('currentPassword')}
				className="p-2 border-2 font-body border-black dark:border-background dark:text-background rounded-lg"
			/>

			{errors.newPassword && <p className="text-xs font-body text-red-500">{errors.newPassword.message}</p>}

			<div className="font-title text-md dark:text-background">{t('newPassword')}</div>

			<input
				{...register("newPassword", {
					required: {
						message: t('formErrors.newPassRequired'),
						value: true,
					},
					pattern: {
						value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/,
						message: t('formErrors.passwordRequirements'),
					},
					minLength: {
						value: 6,
						message: t('formErrors.passwordLen'),
					}
				})}
				type="password"
				placeholder={t('newPassword')}
				className="p-2 border-2 font-body border-black dark:border-background dark:text-background rounded-lg"
			/>

			{errors.newPassword ? <p className="text-xs font-body text-red-500">{errors.newPassword.message}</p> : null}

			<div className="font-title text-md dark:text-background">{t('confirmPassword')}</div>

			<input
				{...register("confirmPassword", {
					required: t('confirmPassword'),
					validate: (value) => value === getValues("newPassword") || t('mismatchPassword')
				})}
				type="password"
				placeholder={t('confirmPassword')}
				className="p-2 border-2 font-body border-black dark:border-background dark:text-background rounded-lg"
			/>

			{errors.confirmPassword ? <p className="text-xs font-body text-red-500">{errors.confirmPassword.message}</p> : null}
			<label className="inline-flex items-center cursor-pointer">
				<input type="checkbox"
					onChange={handleToggle}
					className="sr-only peer"
					checked={is2FAenabled}/>
				<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus: dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
				<span className="ms-3 text-sm font-medium font-title text-gray-900 dark:text-background">{t('enable2factorAuth')}</span>
			</label>
			<TwoFactorModal 
				isOpen={is2FAenabled}
				onClose={closePopup}
			/>

			<button
				type="submit"
				disabled={isProcessing}
				className="border-black border-2 p-2 bg-brown rounded-lg text-md font-title"
			>
				{t('saveChanges')}
			</button>
		</form >

	)
}