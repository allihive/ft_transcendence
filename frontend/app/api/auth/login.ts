import { fetchJson } from "../client";
import type { User } from "../types";

export const login = async (email: string, password: string): Promise<User> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password })
	});
};

export const loginWithGoogle = async (credential: string): Promise<User> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ idToken: credential })
	});
};
