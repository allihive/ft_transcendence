import { useForm } from "react-hook-form";
import type { JSX } from "react";
import type { SubmitHandler } from "react-hook-form";
import type { UserLoginFormData, LoginFormProps } from "./types";
import { useTranslation } from "react-i18next";


export function UserLoginForm(props: LoginFormProps): JSX.Element {
	const { register, handleSubmit, formState: { errors } } = useForm<UserLoginFormData>();
	const {t} = useTranslation();
	const onSubmit: SubmitHandler<UserLoginFormData> = async (data, event) => {
		props.onLogin(data, event);
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col justify-center items-center mt-4 font-title pb-2"
		>
			<input
				type="text"
				placeholder={t('email')}
				className="p-2 border-2 border-black rounded-lg mt-4 "
				{...register("email", {
					required: {
						value: true,
						message: t('formErrors.emailRequired'),
					},
					pattern: {
						value: /^[a-zA-Z0-9_.]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
						message: t('formErrors.validEmail'),
					},
				})}
			/>

			{errors.email && <p className="text-xs font-body">{errors.email.message}</p>}

			<input
				type="password"
				placeholder={t('password')}
				className="p-2 border-2 border-black rounded-lg mt-4"
				{...register("password", {
					required: {
						message: t('formErrors.passwordRequired'),
						value: true,
					},
					pattern: {
						value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/,
						message: t('formErrors.passwordRequirements'),
					},
					minLength: {
						value: 6,
						message: t('formErrors.passwordLen')
					}
				})}
			/>
			{errors.password && <p className="text-xs font-body">{errors.password.message}</p>}

			<button
				type="submit"
				className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4">
				{t('submit')}
			</button>
		</form>
	);
}
