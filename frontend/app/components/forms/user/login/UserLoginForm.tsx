import { useState, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { login, loginWithGoogle } from "~/api/auth/login";
import { verifyTwoFactor } from "~/api/auth/verify";
import { GoogleLoginButton } from "~/components/buttons/google-login/GoogleLoginButton";
import { CredentialsForm } from "./CredentialsForm";
import { TotpForm } from "./TotpForm";
import type { User } from "~/api/types";
import type { GoogleLoginHandler } from "~/components/buttons/google-login/types";
import type { SubmitHandler, TotpSubmitHandler, UserLoginFormProps } from "./types";

export function UserLoginForm({ onSuccess, onFailure, onSubmitStateChange }: UserLoginFormProps): JSX.Element {
	const { t } = useTranslation();
	const [isProcessing, setProcessing] = useState<boolean>(false);
	const [isTwoFactorRequired, setTwoFactorRequired] = useState<boolean>(false);

	const submit = async (callback: () => Promise<User | null>): Promise<User | null | undefined> => {
		setProcessing(true);
		onSubmitStateChange?.(true);

		try {
			const user = await callback();
			return user;
		} catch (error) {
			onFailure(error as Error);
			return undefined;
		} finally {
			setProcessing(false);
			onSubmitStateChange?.(false);
		}
	};

	const submitHandler: SubmitHandler = async (data, event) => {
		const user = await submit(async () => login(data.email, data.password));

		if (user && "twoFactorAuthRequired" in user) {
			setTwoFactorRequired(true);
			return;
		}

		if (user !== undefined) {
			onSuccess(user);
		}
	};

	const totpSubmitHandler: TotpSubmitHandler = async (toptCode, event) => {
		const user = await submit(async () => verifyTwoFactor(toptCode));

		if (user !== undefined) {
			onSuccess(user);
		}
	};

	const googleLoginHandler: GoogleLoginHandler = async (credential) => {
		const user = await submit(async () => loginWithGoogle(credential));

		if (user !== undefined) {
			onSuccess(user);
		}
	};

	if (isTwoFactorRequired) {
		return <TotpForm disabled={isProcessing} submitTitle={t("send")} onSubmit={totpSubmitHandler} />;
	}

	return (
		<div className="flex flex-col items-center">
			<CredentialsForm disabled={isProcessing} onSumit={submitHandler} />
			<div className="flex items-center justify-center w-full px-8 my-4">
				<div className="flex-grow max-w-xl mx-8 border-t border-black"></div>
				<span className="px-4 text-black font-title">OR</span>
				<div className="flex-grow max-w-2xl mx-8 border-t border-black"></div>
			</div>
			<GoogleLoginButton clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`} onLogin={googleLoginHandler} />
		</div>
	);
}
