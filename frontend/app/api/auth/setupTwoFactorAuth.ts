import { fetchJson } from "../client";
import type { SetupTwoFactorAuth } from "../types";

export const setupTwoFactorAuth = async (): Promise<SetupTwoFactorAuth> => {
	const twoFactorAuth = await fetchJson<SetupTwoFactorAuth>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/setup-2fa`, {
		method: "POST",
	});

	return twoFactorAuth!;
};
