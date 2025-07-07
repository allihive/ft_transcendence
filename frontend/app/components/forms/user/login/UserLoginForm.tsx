import { useForm } from "react-hook-form";
import type { JSX } from "react";
import type { SubmitHandler } from "react-hook-form";
import type { UserLoginFormData, LoginFormProps } from "./types";

export function UserLoginForm(props: LoginFormProps): JSX.Element {
	const { register, handleSubmit, formState: { errors } } = useForm<UserLoginFormData>();

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
				placeholder="email"
				className="p-2 border-2 border-black rounded-lg mt-4 "
				{...register("email", {
					required: {
						value: true,
						message: "Email required",
					},
					pattern: {
						value: /^[a-zA-Z0-9_.]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
						message: "Please enter a valid email",
					},
				})}
			/>

			{errors.email && <p className="text-xs font-body">{errors.email.message}</p>}

			<input
				type="password"
				placeholder="Password"
				className="p-2 border-2 border-black rounded-lg mt-4"
				{...register("password", {
					required: {
						message: "Password is required",
						value: true,
					},
					pattern: {
						value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/,
						message: "One uppercase (A-Z), one lowercase (a-z), one special character(%$ or 0-9)",
					},
					minLength: {
						value: 6,
						message: "Password must have 6 characters",
					}
				})}
			/>
			{errors.password && <p className="text-xs font-body">{errors.password.message}</p>}

			<button
				type="submit"
				className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4">
				Submit
			</button>
		</form>
	);
}
