import { fetchJson } from "../client";
import type { User } from "../types";

export const login = async (email: string, password: string): Promise<User> => {
	const user = await fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password })
	});

	return user!;
};

export const loginWithGoogle = async (credential: string): Promise<User> => {
	const user = await fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ idToken: credential })
	});
	
	return user!;
};
