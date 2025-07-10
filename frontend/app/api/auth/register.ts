import { fetchJson } from "../client";
import type { User, UserRegisterData } from "../types";

export const register = async (userRegisterData: UserRegisterData): Promise<User> => {
	const user = await fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userRegisterData)
	});
	
	return user!;
};
