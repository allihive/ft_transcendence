import { fetchJson } from "../client";
import type { UserStats } from "../types";

export const upsertUserStats = async (userId: string, won: boolean): Promise<UserStats | null> => {
	return fetchJson<UserStats>(`${import.meta.env.VITE_API_BASE_URL}/api/stats/users`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userId, won })
	});
};
