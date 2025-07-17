import { fetchJson } from "../client";
import type { User } from "../types";

export const verifyCredentials = async (email: string, password: string): Promise<User | null> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify/password`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password })
	});
};

export const verifyGoogle = async (idToken: string): Promise<User | null> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify/google`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ idToken })
	});
};

export const verifyTwoFactor = async (totp: number): Promise<User | null> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify/2fa`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ totp })
	});
};
