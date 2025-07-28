import { NavLink, redirect, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { useAuth } from "~/stores/useAuth";
import { CreditsBanner } from "~/components/credits-banner/CreditsBanner";
import { UserLoginForm } from "~/components/forms/user/login/UserLoginForm";
import { useTranslation } from "react-i18next";
import type { SuccessHandler } from "~/components/forms/user/login/types";

export async function clientLoader(): Promise<void> {
	if (useAuth.getState().user) {
		throw redirect("/");
	}
}

export default function Login() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const setUser = useAuth((state) => state.setUser);

	const successHandler: SuccessHandler = (user) => {
		setUser(user);

		if (user) {
			navigate("/");
		}
	};

	return (
		<div className="flex flex-col justify-center items-center w-full pb-16 pt-8">
			<div className="w-[600px] h-[420px] relative bg-pop border-4 border-black rounded-md shadow-md justify-center items-center pb-16 space-y-4">
				<UserLoginForm
					onSuccess={successHandler}
					onFailure={(error) => toast.error(error.message)}
				/>


				<div className="flex flex-grow justify-center items-center mx-8 mt-2 ">
					<NavLink
						to="/register"
						className="border font-title border-black px-6 py-2 rounded-lg text-black mt-4"
					>
						{t('newUser')}
					</NavLink>
				</div>
			</div>

			<CreditsBanner />
		</div>
	);
}