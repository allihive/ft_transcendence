import { fetchJson } from "../client";
import type { User } from "../types";

export const activateTwoFactorAuth = async (totpCode: number): Promise<User | null> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/activate-2fa`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ totpCode })
	});
};
