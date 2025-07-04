import { fetchJson } from "../client";
import type { User } from "../types";

export const register = async ({ email, name, username, password, avatarUrl }: {
	email: string,
	name?: string,
	username: string,
	password: string,
	avatarUrl?: string
}): Promise<User> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email,
			...(name ? { name } : {}),
			password,
			...(avatarUrl ? { avatarUrl } : {})
		})
	});
};
