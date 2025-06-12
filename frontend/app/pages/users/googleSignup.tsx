import { useEffect, useState } from "react";

declare global {
	interface Window {
		google: any;
	}
}

interface GoogleSignupProps {
	onSignupSuccess: (user: any) => void;
	onSignupFailure?: (message: string) => void;
}

const GoogleSignup: React.FC<GoogleSignupProps> = ({ onSignupSuccess, onSignupFailure }) => {
	const [userInfo, setUserInfo] = useState<any>(null);
	const [username, setUsername] = useState("");
	const [showForm, setShowForm] = useState(false);

	useEffect(() => {
		if (!window.google) return;

		window.google.accounts.id.initialize({
			client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
			callback: (response: any) => {
				const token = response.credential;
				if (!token) {
					onSignupFailure?.("No credential returned.");
					return;
				}
				const payload = JSON.parse(atob(token.split('.')[1]));
				setUserInfo({ ...payload, idToken: token });
				setShowForm(true);
			},
		});

		window.google.accounts.id.renderButton(
			document.getElementById("googleSignInDiv"),
			{ theme: "outline", size: "large" }
		);
	}, []);

	const handleSubmit = async () => {
		if (!username) {
			alert("Please enter a username.");
			return;
		}

		try {
			const res = await fetch("http://localhost:3000/api/auth/google", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					mode: "signup",
					idToken: userInfo.idToken,
					googleId: userInfo.sub,
					email: userInfo.email,
					username,
				}),
			});

			if (!res.ok) {
				const error = await res.json();
				onSignupFailure?.(error.message || "Signup failed.");
				return;
			}

			const result = await res.json();
			onSignupSuccess(result);
		} catch (err) {
			console.error("❌ Google signup error:", err);
			onSignupFailure?.("Signup failed. Please try again.");
		}
	};

	return (
		<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-md z-10">
			{!showForm ? (
				<div id="googleSignInDiv" className="flex justify-center" />
			) : (
				<div className="p-6 bg-white rounded shadow-md w-80 flex flex-col items-center">
					<h2 className="text-lg font-semibold mb-4">Complete Your Signup</h2>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Choose a username"
						className="border p-2 rounded mb-4 w-full text-sm"
					/>
					<button
						onClick={handleSubmit}
						className="bg-green-600 text-white px-4 py-2 rounded w-full"
					>
						Sign Up with Google
					</button>
				</div>
			)}
		</div>
	);
};

export default GoogleSignup;
