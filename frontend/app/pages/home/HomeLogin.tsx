import { useState } from "react";
import { useNavigate } from "react-router";
import Login from '../../components/signIn';
import { FaGoogle } from "react-icons/fa";
import controller from './assets/controller.png'
import orangeCircle from './assets/orangeCircle.png'
import lines from './assets/3lines.png'

//things to fix later: handle submit click, if success -> navigate to tournament page
//if failure give wrong name or password
//will have to check with the data base if it's correct

export function HomeLogin() {
	const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);
	const navigate = useNavigate();

	const handleGoogleLoginSuccess = (userInfo: any) => {
		console.log('Final user info:', userInfo);
		setShowGoogleSignIn(false);
	};
	const handleGoogleClick = () => setShowGoogleSignIn(true);
	const handleSubmitClick = () => navigate("/tournament");
	const handleNewUser = () => navigate("/users");

	return (
		<div className="flex flex-col justify-center items-center w-full pb-16 pt-8">
		<div className="w-[600px] h-[450px] relative bg-pop border-4 border-black rounded-md shadow-md justify-center items-center pb-16 space-y-4">
			<div className="flex flex-col justify-center items-center mt-4 font-title">
				<input
					type="text"
					placeholder="Username"
					className="p-2 border-2 border-black rounded-lg mt-4 " />
				<input
					type="password"
					placeholder="Password"
					className="p-2 border-2 border-black rounded-lg mt-4" />
				<button onClick={handleSubmitClick} className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4">Submit</button>
				<div className="flex-grow mx-8 mt-2 border-t border-black dark:border-white"></div>
				{showGoogleSignIn && <Login onLoginSuccess={handleGoogleLoginSuccess} />}
				<div className="flex flex-grow justify-center items-center mx-8 mt-2 border-t border-black ">
					<button onClick={handleGoogleClick} className="flex justify-center items-center flex-col px-4 py-2 mt-2">
						<FaGoogle size={50} className="border px-4 rounded-full " />
						<p className="text-sm font-title border border-black px-4 py-2 rounded-xl  mt-2">
							Sign in with Google</p>
					</button>
				</div>
				<button onClick={handleNewUser} className="border border-black px-6 py-2 rounded-lg text-black mt-4">New User</button>
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
					<p className="text-black dark:text-background text-center font-body">Timmo</p>
				</div>
				<div className="flex flex-col items-center">
					<img src={orangeCircle} alt="orangeCircle" className="w-32 h-auto" />
					<img src={lines} alt="3 lines" className="w-32 h-auto mt-10" />
				</div>
			</div>
			</div>
	</div>
	);
}

export default HomeLogin;

