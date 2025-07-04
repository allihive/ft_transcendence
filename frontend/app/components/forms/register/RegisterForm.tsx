import { useForm } from "react-hook-form";
import { register as registerApi } from "~/api/auth/register";
import { upload } from "~/api/media/file-upload";
import type { JSX } from "react";
import type { SubmitHandler } from "react-hook-form";
import type { FormValues, RegisterFormProps } from "./types";

export function RegisterForm(props: RegisterFormProps): JSX.Element {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<FormValues>();

	const password = watch("password");

	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		let avatarUrl = "/files/2ca09462-3930-4dbc-b3cc-5e9b4b09d525.png";

		try {
			if (data.avatar?.[0]) {
				const response = await upload(data.avatar[0]);
				avatarUrl = response.url;
			}

			const user = await registerApi({
				email: data.email,
				username: data.username,
				password: data.password,
				name: data.name,
				avatarUrl
			});

			props.onSuccess(user);

			console.log("Success:", user);
		} catch (error) {
			console.error("Error submitting form:", error);
			props.onError?.(error as Error);
		}
	};

	return (
		<>
			<div className="flex items-center justify-center w-full px-8 my-4">
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
				<span className="px-4 text-black dark:text-background font-title">New User</span>
				<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>

			</div>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center items-center mt-10 font-title">
				<input
					{...register("avatar")}
					type="file"
					accept=".jpeg, .jpg, .png, image/jpeg, image/png"
					placeholder="image"
					className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
				{errors.avatar && <p className="text-xs font-body text-red-500">{errors.avatar.message}</p>}
				<input {...register("name", { required: "name" })}
					type="text"
					placeholder="Name"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				{errors.name && <p className="text-xs font-body text-red-500">{errors.name.message}</p>}
				<input {...register("email", {
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
					type="email"
					placeholder="Email"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				{errors.email && <p className="text-xs font-body text-red-500">{errors.email.message}</p>}
				<input {...register("username", {
					required: {
						message: "Username is required",
						value: true
					},
					pattern: {
						value: /^[a-zA-Z0-9_-]+$/,
						message: "Uppercase, lowercase, numbers, - , _ accepted",
					},
					minLength: {
						value: 6,
						message: "Username must have 6 characters",
					}
				})}
					type="text"
					placeholder="Username"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				{errors.username && <p className="text-xs font-body text-red-500">{errors.username.message}</p>}
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
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				{errors.password && <p className="text-xs font-body text-red-500">{errors.password.message}</p>}
				<input {...register("confirmPassword", {
					required: "Please confirm your password",
					validate: value => value === password || "Passwords do not match"
				})}
					type="password"
					placeholder="Confirm password"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				{errors.confirmPassword && <p className="text-xs font-body text-red-500">{errors.confirmPassword.message}</p>}
				<button type="submit" className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4">Enter</button>
			</form>
		</>
	);
}