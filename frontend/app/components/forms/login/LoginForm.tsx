import { type JSX } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { FormValues, LoginFormProps } from "./types";
import { login } from "~/api/auth/login";

export function LoginForm(props: LoginFormProps): JSX.Element {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>();

	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		try {
			const user = await login(data.email, data.password);
			// save user to zustand here
		} catch (error) {
			// alert() for quick showcase but popup error message dialog is preferred
			alert("Login failed");
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center items-center mt-4 font-title">
			<input
				{...register("email", {
					required: {
						value: true,
						message: "Email required",
					},
					pattern: {
						value: /^[a-zA-Z0-9_.]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
						message: "Please enter a valid email",
					},
				})
				}
				type="text"
				placeholder="email"
				className="p-2 border-2 border-black rounded-lg mt-4 " />
			{errors.email && <p className="text-xs font-body">{errors.email.message}</p>}
			<input {...register("password", {
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
			})
			}
				type="password"
				placeholder="Password"
				className="p-2 border-2 border-black rounded-lg mt-4" />
			{errors.password && <p className="text-xs font-body">{errors.password.message}</p>}
			<button type="submit" className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4">Submit</button>
		</form>
	);
}
