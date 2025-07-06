import { NavLink, redirect, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { useAuth } from "~/stores/useAuth";
import { CreditsBanner } from "~/components/credits-banner/CreditsBanner";
import { UserLoginForm } from "~/components/forms/user/login/UserLoginForm";
import { GoogleLoginButton } from "~/components/buttons/google-login/GoogleLoginButton";
import type { LoginHandler } from "~/components/forms/user/login/types";
import type { GoogleLoginHandler } from "~/components/buttons/google-login/types";

export async function clientLoader(): Promise<void> {
	if (useAuth.getState().user) {
		throw redirect("/");
	}
}

export default function Login() {
	const navigate = useNavigate();
	const login = useAuth((state) => state.login);
	const loginWithGoogle = useAuth((state) => state.loginWithGoogle);

	const loginHandler: LoginHandler = async (data) => {
		try {
			await login(data.email, data.password);
			navigate("/");
		} catch (error) {
			toast.error((error as Error).message);
		}
	};

	const googleLoginHandler: GoogleLoginHandler = async (credential) => {
		try {
			const user = await loginWithGoogle(credential);
			navigate("/");
		} catch (error) {
			toast.error((error as Error).message);
		}
	};

	return (
		<div className="flex flex-col justify-center items-center w-full pb-16 pt-8">
			<div className="w-[600px] h-[450px] relative bg-pop border-4 border-black rounded-md shadow-md justify-center items-center pb-16 space-y-4">
				<UserLoginForm onLogin={loginHandler} />

				<div className="flex flex-grow justify-center items-center mx-8 mt-4 border-t border-black">
					<GoogleLoginButton
						clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}
						onLogin={googleLoginHandler}
					/>
				</div>

				<div className="flex flex-grow justify-center items-center mx-8 mt-2 ">
					<NavLink
						to="/register"
						className="border font-title border-black px-6 py-2 rounded-lg text-black mt-4"
					>
						Register New User
					</NavLink>
				</div>
			</div>

			<CreditsBanner />
		</div>
	);
}