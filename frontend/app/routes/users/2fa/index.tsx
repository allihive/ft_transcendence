import { type JSX } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLoaderData } from "react-router";
import { setupTwoFactorAuth } from "~/api/auth/setupTwoFactorAuth";
import type { SetupTwoFactorAuth } from "~/api/types";
import type { Route } from "./+types/index";
import { ActivationForm } from "./ActivationForm";

export async function clientLoader(): Promise<SetupTwoFactorAuth> {
	return setupTwoFactorAuth();
}

export default function TwoFactorAuth(): JSX.Element {
	const { t } = useTranslation();
	const { qrCode } = useLoaderData<typeof clientLoader>();

	return (
		<>
			<h1>{t("2fa.setupTitle")}</h1>
			<p>{t("2fa.requirement")}</p>
			<div className="flex flex-row items-center gap-4">
				<img src={qrCode} alt="QR code" />
				<div>
					<p>{t("2fa.instruction")}</p>
					<ActivationForm />
				</div>
			</div>
		</>
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
