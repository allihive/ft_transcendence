import { useState, type JSX } from "react"
import { useForm } from "react-hook-form"
import type { SubmitHandler } from "react-hook-form";
import { FaGoogle } from "react-icons/fa";
import GoogleSignup from './googleSignup';
import { register as registerApi } from "app/api/auth/register"
import { useNavigate } from "react-router";


type FormValues = {
	name: string;
	email: string;
	username: string;
	avatarUrl?: string;
	password: string;
	confirmPassword: string;
}
/*import fs from "fs"; to save information to a json file, but this is backend
import express from "express";*/

export function NewUsersPage(): JSX.Element {
	const [showGoogleSignUp, setShowGoogleSignUp] = useState(false);
	const navigate = useNavigate();
	
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<FormValues>();

	const password = watch("password");

	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		try {
			const result = await registerApi ({
				email: data.email,
				username: data.username,
				password: data.password,
				name: data.name,
				avatarUrl: data.avatarUrl,
			})
			console.log("Success:", result);
			alert("New User created!");
			navigate("/play");
		} catch (error) {
			console.error("Error submitting form:", error);
		}
	};

	const handleGoogleSignupSuccess = (user: any) => {
		console.log("✅ Signup success:", user);
		setShowGoogleSignUp(false);
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
					{...register("avatarUrl")}
					type="file"
					accept="image/*"
					placeholder="image"
					className="p-2 border-2 font-body max-w-xl border-black dark:border-background dark:text-background rounded-lg mt-4" />
				{errors.avatarUrl && <p className="text-xs font-body text-red-500">{errors.avatarUrl.message}</p>}
				<input {...register("name", {required: "name"})}
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
					}})
				}
					type="password"
					placeholder="Password"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				{errors.password&& <p className="text-xs font-body text-red-500">{errors.password.message}</p>}
				<input {...register("confirmPassword", {
					required: "Please confirm your password",
					validate: value => value === password || "Passwords do not match"})}
					type="password"
					placeholder="Confirm password"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				{errors.confirmPassword&& <p className="text-xs font-body text-red-500">{errors.confirmPassword.message}</p>}
				<button type="submit" className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4">Enter</button>
			</form>
			<div className="flex flex-grow justify-center items-center mx-8 mt-10 border-t border-black dark:border-background ">
			<button
				onClick={() => setShowGoogleSignUp(true)}
				className="flex justify-center items-center flex-col px-4 py-2 mt-10"
			>
				<FaGoogle
					size={80}
					className="border dark:border-background px-4 rounded-full dark:fill-background"
				/>
				<p className="text-lg font-title border border-black dark:border-background px-4 py-2 rounded-xl dark:text-background mt-8">
					Create user with Google
				</p>
			</button>

			{showGoogleSignUp && (
				<GoogleSignup
					onSignupSuccess={handleGoogleSignupSuccess}
					onSignupFailure={(errMsg) => alert(errMsg)}
				/>
			)}
			</div>
		</>
	)
}