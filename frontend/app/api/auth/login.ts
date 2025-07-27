import { fetchJson } from "../client";
import type { User } from "../types";

export const login = async (email: string, password: string, verifyOnly: boolean = false): Promise<User | null> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login/password`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password, verifyOnly })
	});
};

export const loginWithGoogle = async (credential: string, verifyOnly: boolean = false): Promise<User> => {
	const user = await fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login/google`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ idToken: credential, verifyOnly })
	});

	return user!;
};
