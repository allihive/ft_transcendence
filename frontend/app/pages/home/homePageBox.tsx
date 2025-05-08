import { useState } from "react";
import { useNavigate } from "react-router";
import Login from '../../components/signIn';

//things to fix later: handle submit click, if success -> navigate to tournament page
	//if failure give wrong name or password
	//will have to check with the data base if it's correct

function BlueBox() {
	const [showLogin, setShowLogin] = useState(false);
	const [showGoogleSignIn, setShowGoogleSignIn] =  useState(false);
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
		<div className="w-[600px] h-[400px] relative bg-pop border-4 border-black rounded-md shadow-md space-y-4">
		
		{showLogin ? (
			<div className="flex flex-col justify-center items-center mt-10 font-title">
				<input
					type="text"
					placeholder="Username"
					className="p-2 border-2 border-black rounded-lg mt-4 "/>
				<input
					type="password"
					placeholder="Password"
					className="p-2 border-2 border-black rounded-lg mt-4" />
				<button onClick={handleSubmitClick} className="border-2 border-black bg-brown px-6 py-2 rounded-lg text-black mt-4">Submit</button>
				{showGoogleSignIn && <Login onLoginSuccess={handleGoogleLoginSuccess} />}
				<button onClick={handleGoogleClick} className="border-2 border-black rounded-lg mt-4">
				Sign in with Google
				</button>
				<button onClick={handleNewUser} className="border-2 border-black px-6 py-2 rounded-lg text-black mt-10">New User</button>
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

