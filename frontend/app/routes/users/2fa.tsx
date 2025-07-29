import { useState, type JSX } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { NavLink, useLoaderData } from "react-router";
import { activateTwoFactorAuth } from "~/api/auth/activate-2fa";
import { setupTwoFactorAuth } from "~/api/auth/setupTwoFactorAuth";
import type { SetupTwoFactorAuth } from "~/api/types";
import { TotpForm } from "~/components/forms/user/login/TotpForm";
import type { TotpSubmitHandler } from "~/components/forms/user/login/types";
import { useAuth } from "~/stores/useAuth";
import type { Route } from "./+types/2fa";

export async function clientLoader(): Promise<SetupTwoFactorAuth> {
	return setupTwoFactorAuth();
}

export default function TwoFactorAuth(): JSX.Element {
	const { t } = useTranslation();
	const { qrCode } = useLoaderData<typeof clientLoader>();
	const user = useAuth((state) => state.user);
	const setUser = useAuth((state) => state.setUser);
	const [isSubmitting, setSubmitting] = useState<boolean>(false);

	const submitHandler: TotpSubmitHandler = async (toptCode, event) => {
		setSubmitting(true);

		try {
			const activatedUser = await activateTwoFactorAuth(toptCode);

			if (!activatedUser) {
				toast.error("Invalid TOTP code");
				return;
			}

			setUser(activatedUser);
			toast.success("Two-Factor Authentication enabled");
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="max-w-fit mx-auto">
			<h1 className="text-2xl font-title font-bold mb-6">{t("2fa.setupTitle")}</h1>
			<p className="my-4 text-xl">{t("2fa.requirement")}</p>
			<div className="flex flex-row items-center gap-4">
				<img src={qrCode} alt="QR code" />
				<div>
					<p>{t("2fa.instruction")}</p>
					<TotpForm onSubmit={submitHandler} submitTitle={t("activate")} disabled={isSubmitting} />
				</div>
			</div>
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	return (
		<div>
			You have already enabled Two-Factor Authentication
			<NavLink to="/users/profile">Back to profile</NavLink>
		</div>
	);
}
