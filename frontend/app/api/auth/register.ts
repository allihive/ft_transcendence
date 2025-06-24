import { fetchJson } from "../client";
import type { User } from "../types";

export const register = async ({ email, name, password, avatarUrl }: {
	email: string,
	name?: string,
	password: string,
	avatarUrl?: string
}): Promise<User> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
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
