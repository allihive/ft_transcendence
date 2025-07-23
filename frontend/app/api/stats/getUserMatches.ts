import { fetchJson } from "../client";
import type { getUserMatchHistory, GameHistoryResponse } from "./types";

export const getUserMatches = async (userId: string) : Promise<getUserMatchHistory[] | null> => {
	const response = await fetchJson<GameHistoryResponse>(`${import.meta.env.VITE_API_BASE_URL}/api/history/${userId}`, {method: "GET"});
	// Extract the games array from the response
	return response?.games || [];
}