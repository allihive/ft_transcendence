import { fetchJson } from "../client";

export const logout = async (): Promise<void> => {
	return fetchJson<void>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, { method: "POST" });
};
