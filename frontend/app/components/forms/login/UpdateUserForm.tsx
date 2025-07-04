import { type JSX } from "react";
import { useForm } from "react-hook-form";
import { updateUser } from "~/api/users/updateUser";
import type { SubmitHandler } from "react-hook-form";
import type { UpdateUserData, LoginFormProps } from "./types";
import { useAuth } from "~/stores/useAuth"
import { login } from "~/api/auth/login";


export function UpdateForm(props: LoginFormProps): JSX.Element {
	const { onSuccess } = props;
	const {
		register,
		watch,
		handleSubmit,
		formState: { errors },
	} = useForm<UpdateUserData>();

	const setUser = useAuth((state) => state.setUser);
	const user = useAuth((state) => state.user);
	const password = watch("newPassword");

	const onSubmit: SubmitHandler<UpdateUserData> = async (data) => {
		try {
			const updateUserValue = await updateUser(data.id, {
				id: data.id,
				name: data.name,
				email: data.email,
				username: data.username,
				avatarUrl: data.avatarUrl,
				newPassword: data.newPassword,
				confirmPassword: data.confirmPassword
			})
				onSuccess(updateUserValue);
		}
		catch(error) {
			console.error(error);
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-left">
			<div className="font-title text-md mt-8 dark:text-background">Upload Avatar</div>
			<input
				{...register("avatarUrl")}
				type="file"
				accept="image/*"
				placeholder={user?.avatarUrl}
				onChange={(e) => console.log(e.target.files[0])}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
				{errors.avatarUrl && <p className="text-xs font-body text-red-500">{errors.avatarUrl.message}</p>}
			<div className="font-title text-md mt-8 dark:text-background">Name</div>
			<input
				{...register("name")}
				type="text"
				placeholder={user?.name}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
				{errors.name && <p className="text-xs font-body">{errors.name.message}</p>}
			<div className="font-title text-md mt-8 dark:text-background">Username</div>
			<input
				{...register("username", {
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
				placeholder={user?.username}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
				{errors.username && <p className="text-xs font-body text-red-500">{errors.username.message}</p>}
			<div className="font-title text-md mt-8 dark:text-background">Email</div>
			<input
				{...register("email", {
					pattern: {
						value: /^[a-zA-Z0-9_.]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
						message: "Please enter a valid email",
					},
				})
				}
				type="text"
				placeholder={user?.email}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
				{errors.email && <p className="text-xs font-body text-red-500">{errors.email.message}</p>}
			<div className="font-title text-md mt-8 dark:text-background">Password</div>
			<input
				{...register("newPassword", {
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
					}})
				}
				type="password"
				value={password}
				className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
				{errors.newPassword&& <p className="text-xs font-body text-red-500">{errors.newPassword.message}</p>}
			<div className="font-title text-md mt-8 dark:text-background">Confirm Password</div>
			<input {...register("confirmPassword", {
					required: "Please confirm your password",
					validate: value => value === password || "Passwords do not match"})}
					type="password"
					placeholder="Confirm password"
					className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
				{errors.confirmPassword&& <p className="text-xs font-body text-red-500">{errors.confirmPassword.message}</p>}
			<button type="submit" className="border-black border-2 p-2 max-w-sm bg-brown mt-8 rounded-lg text-md font-title">Save Changes</button>
		</form >

		)
}