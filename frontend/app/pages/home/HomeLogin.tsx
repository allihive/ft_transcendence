import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import GoogleLogin  from '../users/googleLogin';
import { FaGoogle } from "react-icons/fa";
import controller from './assets/controller.png'
import orangeCircle from './assets/orangeCircle.png'
import lines from './assets/3lines.png'

//things to fix later: handle submit click, if success -> navigate to tournament page
//if failure give wrong name or password
//will have to check with the data base if it's correct
type FormValues = {
	email: string;
	password: string;
}


export function HomeLogin() {
	const [showGoogleLogin, setShowGoogleLogin] = useState(false);
	const navigate = useNavigate();
	
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>();

	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		try {
			const response = await fetch("/api/submit", {
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
	
	const handleGoogleClick = () => setShowGoogleLogin(true);

	const handleSubmitClick = () => navigate("/tournament");
	const handleNewUser = () => navigate("/register");

	return (
		<>
		<div className="flex flex-col justify-center items-center w-full pb-16 pt-8">
			<div className="w-[600px] h-[450px] relative bg-pop border-4 border-black rounded-md shadow-md justify-center items-center pb-16 space-y-4">
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
						}})
					}
						type="password"
						placeholder="Password"
						className="p-2 border-2 border-black rounded-lg mt-4" />
						{errors.password && <p className="text-xs font-body">{errors.password.message}</p>}
					<button type="submit" className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4">Submit</button>
				</form>
				{/*GOOGLE LOG IN*/}
				<div className="flex-grow mx-8 mt-2 border-t border-black dark:border-white"></div>

				<div className="flex flex-grow justify-center items-center mx-8 mt-2 border-t border-black">
					<button
						onClick={() => setShowGoogleLogin(true)}
						className="flex items-center gap-2 border px-4 py-2 rounded"
					>
						<FaGoogle />
						<span>Log in with Google</span>
					</button>
				</div>

				{showGoogleLogin && (
					<GoogleLogin
						onLoginSuccess={(user) => {
							console.log("✅ Logged in user:", user);
							// Do whatever you want here
						}}
						onLoginFailure={(errMsg) => {
							console.log("Backend error response:", errMsg);
							if (errMsg === "user_not_found") {
								if (confirm("No account found. Would you like to sign up?")) {
									navigate("/users/profile");
								}
							} else {
								alert(errMsg);
							}
						}}
					/>
				)}
				{/*HANDLE NEW USER*/}
				<div className="flex flex-grow justify-center items-center mx-8 mt-2 ">
					<button onClick={handleNewUser} className="border font-title border-black px-6 py-2 rounded-lg text-black mt-4">New User</button>
				</div>
			</div>
		</div>
		<div className="flex-1 p-6 flex flex-col items-center justify-center">
			<div className="flex items-center mt-8 justify-center">
				<h1 className="text-black dark:text-darkOrange font-title text-3xl h-full ">Transcendence</h1>
			</div>
			<div className="flex flex-row items-start space-x-30">
				<img src={controller} alt="up-down-arrows" className="w-32 h-auto" />
				<div className="flex flex-col items-center mt-8 justify-center border-2 border-black dark:border-background rounded-lg p-4">
					<h3 className="text-black dark:text-background font-title text-2xl h-full ">Made By</h3>
					<p className="text-black dark:text-background text-center font-body">Alice</p>
					<p className="text-black dark:text-background text-center font-body">Sumin</p>
					<p className="text-black dark:text-background text-center font-body">Hoang</p>
					<p className="text-black dark:text-background text-center font-body">Joseph</p>
					<p className="text-black dark:text-background text-center font-body">Timo</p>
				</div>
				<div className="flex flex-col items-center">
					<img src={orangeCircle} alt="orangeCircle" className="w-32 h-auto" />
					<img src={lines} alt="3 lines" className="w-32 h-auto mt-10" />
				</div>
			</div>
			</div>
		</>
	);
}

export default HomeLogin;

