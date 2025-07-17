import { fetchJson } from "../client";
import type { UserStats } from "../types";

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
	return fetchJson<UserStats>(`${import.meta.env.VITE_API_BASE_URL}/api/stats/users/${userId}`, { method: "GET" });
};
