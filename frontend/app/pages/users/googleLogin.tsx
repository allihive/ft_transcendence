import { useEffect } from "react";

// declare global {
// 	interface Window {
// 		google: any;
// 	}
// }

interface GoogleLoginProps {
	onLoginSuccess: (user: any) => void;
	onLoginFailure?: (message: string) => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onLoginSuccess, onLoginFailure }) => {
	useEffect(() => {
		if (!window.google) return;

		window.google.accounts.id.initialize({
			client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
			callback: async (response: any) => {
				const token = response.credential;
				if (!token) {
					onLoginFailure?.("No credential returned.");
					return;
				}
				const payload = JSON.parse(atob(token.split('.')[1]));

				try {
					const res = await fetch("http://localhost:3000/api/auth/google", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							mode: "login",
							idToken: token,
							googleId: payload.sub,
							email: payload.email,
						}),
					});

					if (!res.ok) {
						const error = await res.json();
						if (error.reason === 'user_not_found') {
							onLoginFailure?.("user_not_found");
						} else {
							onLoginFailure?.(error.message || "Login failed.");
						}
						return;
					}

					const result = await res.json();
					onLoginSuccess(result);
				} catch (err) {
					console.error("❌ Google login error:", err);
					onLoginFailure?.("Login failed. Please try again.");
				}
			},
		});

		window.google.accounts.id.renderButton(
			document.getElementById("googleSignInDiv"),
			{ theme: "outline", size: "large" }
		);
	}, [onLoginSuccess, onLoginFailure]);

	return (
		<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-md z-10">
			<div id="googleSignInDiv" className="flex justify-center" />
		</div>
	);
};

export default GoogleLogin;
