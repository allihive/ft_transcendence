import { useState, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { login, loginWithGoogle } from "~/api/auth/login";
import { GoogleLoginButton } from "~/components/buttons/google-login/GoogleLoginButton";
import { CredentialsForm } from "./CredentialsForm";
import type { User } from "~/api/types";
import type { GoogleLoginHandler } from "~/components/buttons/google-login/types";
import type { SubmitHandler, UserVerificationFormProps } from "./types";

export function UserVerificationForm({ onSuccess, onFailure, onSubmitStateChange}: UserVerificationFormProps): JSX.Element {
	const { t } = useTranslation();
	const [isProcessing, setProcessing] = useState<boolean>(false);

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
			onSubmitStateChange?.(true);
		}
	};

	const submitHandler: SubmitHandler = async (data, event) => {
		const user = await submit(async () => login(data.email, data.password, true));

		if (user !== undefined) {
			onSuccess(user);
		}
	};

	const googleLoginHandler: GoogleLoginHandler = async (credential) => {
		const user = await submit(async () => loginWithGoogle(credential, true));

		if (user !== undefined) {
			onSuccess(user);
		}
	};

	return (
		<div className="flex flex-col items-center">
			<CredentialsForm disabled={isProcessing} onSumit={submitHandler} />
			<div className="text-center text-sm text-gray-500">or</div>
			<GoogleLoginButton clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`} onLogin={googleLoginHandler} />
		</div>
	);
}
