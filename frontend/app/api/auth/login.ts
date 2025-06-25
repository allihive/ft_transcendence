import { fetchJson } from "../client";
import type { User } from "../types";

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password })
	});
};

// export const loginWithGoogle = async (email: string, password: string): Promise<User> => {
// 	const user: User = {}
// };
