import { fetchJson } from "../client";

export const logout = async (): Promise<void> => {
	// Then logout from server
	await fetchJson<void>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, { method: "POST" });
};
