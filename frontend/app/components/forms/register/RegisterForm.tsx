import { useState, type JSX } from "react";
import { useForm } from "react-hook-form";
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
		try {
			const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			const result = await response.json();
			console.log("Success:", result);
		} catch (error) {
			console.error("Error submitting form:", error);
		}
	};

	return (
		<>
			<div className="flex items-center justify-center w-full px-8 my-4">
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
				<span className="px-4 text-black dark:text-background font-title">New User</span>
				<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>

			</div>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col justify-center items-center mt-10 font-title"
			>
				<input
					{...register("name", { required: "name" })}
					type="text"
					placeholder="Name"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4"
				/>
				{errors.name ? <p className="text-xs font-body">{errors.name.message}</p> : null}

				<input
					{
						...register("email", {
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
				{errors.email && <p className="text-xs font-body">{errors.email.message}</p>}

				<input {...register("username", {
					required: {
						message: "Username is required",
						value: true
					},
					pattern: {
						value: /^[a-zA-Z0-9_]+$/,
						message: "Uppercase, lowercase, numbers, and underscore(_) accepted",
					},
					minLength: {
						value: 6,
						message: "Username must have 6 characters",
					}
				})}
					type="text"
					placeholder="Username"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4"
				/>
				{errors.username && <p className="text-xs font-body">{errors.username.message}</p>}

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
				{errors.password && <p className="text-xs font-body">{errors.password.message}</p>}

				<input {...register("confirmPassword", {
					required: "Please confirm your password",
					validate: value => value === password || "Passwords do not match"
				})}
					type="password"
					placeholder="Confirm password"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				{errors.confirmPassword && <p className="text-xs font-body">{errors.confirmPassword.message}</p>}
				
				<button type="submit" className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4">Enter</button>
			</form>
		</>
	);
}