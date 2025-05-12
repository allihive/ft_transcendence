import { useState } from "react";
import { useNavigate } from "react-router";
import Login from '../../components/signIn';
import { FaGoogle } from "react-icons/fa";

//things to fix later: handle submit click, if success -> navigate to tournament page
//if failure give wrong name or password
//will have to check with the data base if it's correct

function BlueBox() {
	const [showLogin, setShowLogin] = useState(false);
	const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);
	const [showRegularSignIn, setShowRegularSignin] = useState(false);
	const navigate = useNavigate();

	const handleGoogleLoginSuccess = (userInfo: any) => {
		console.log('Final user info:', userInfo);
		setShowLogin(false);
		setShowGoogleSignIn(false);
	};

	const handleLoginClick = () => setShowLogin(true);
	const handlePlayClick = () => navigate("/play");
	const handleGoogleClick = () => setShowGoogleSignIn(true);
	const handleSubmitClick = () => navigate("/tournament");
	const handleNewUser = () => navigate("/users");

	return (
		<div className="w-[600px] h-[450px] relative bg-pop border-4 border-black rounded-md shadow-md space-y-4">

			{showLogin ? (
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
			) : (
				<div className="absolute top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-4">
					<button onClick={handlePlayClick} className="text-black text-center pt-4 pb-4 px-6 text-2xl font-title border-2 border-black rounded-lg">Play</button>
					<button onClick={handleLoginClick} className="text-black text-center pt-4 pb-4 px-6 text-2xl font-title border-2 border-black rounded-lg">Login</button>
				</div>)}

		</div>
	);
}

export default BlueBox;

