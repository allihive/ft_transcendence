import { useState, type JSX } from "react"
import { useNavigate } from "react-router"
import { FaGoogle } from "react-icons/fa";

export function NewUsersPage(): JSX.Element {
	const navigate = useNavigate();
	const handleSubmitClick = () => navigate("/users/profile")

	return (
		<>
			<div className="flex items-center justify-center w-full px-8 my-4">
				<div className="flex-grow max-w-xl mx-8 border-t border-black dark:border-white"></div>
				<span className="px-4 text-black dark:text-background font-title">New User</span>
				<div className="flex-grow max-w-2xl mx-8 border-t border-black dark:border-white"></div>

			</div>
			<div className="flex flex-col justify-center items-center mt-10 font-title">
				<input
					type="text"
					placeholder="Name"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				<input
					type="test"
					placeholder="Email"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				<input
					type="text"
					placeholder="Username"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				<input
					type="password"
					placeholder="Password"
					className="p-2 border-2 border-black bg-lightOrange hover:bg-darkOrange rounded-lg mt-4">
				</input>
				<button onClick={handleSubmitClick} className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4">Enter</button>
			</div>
			<div className="flex flex-grow justify-center items-center mx-8 mt-10 border-t border-black dark:border-background ">
				<button className="flex justify-center items-center flex-col px-4 py-2 mt-10">
					<FaGoogle size={80} className="border dark:border-background px-4 rounded-full dark:fill-background" />
					<p className="text-lg font-title border border-black dark:border-background px-4 py-2 rounded-xl dark:text-background mt-8">
						Create user with Google</p>
				</button>
			</div>
		</>
	)
}