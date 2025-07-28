import { fetchJson } from "../client";
import type { UserStats } from "../types";

//added 28.7
// Interface matching backend MatchResultDto
export interface MatchResult {
	winnerId: string | null;
	loserId: string | null;
	winnerScore: number;
	loserScore: number;
}

// Interface matching backend CreateGameHistoryDto
export interface CreateGameHistory {
	winnerId: string | null;
	loserId: string | null;
	winnerScore: number;
	loserScore: number;
	local: boolean;
	winnerName?: string; // For local games
	loserName?: string;  // For local games
}

export const upsertUserStats = async (userId: string, won: boolean): Promise<UserStats | null> => {
	return fetchJson<UserStats>(`${import.meta.env.VITE_API_BASE_URL}/api/stats/users`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userId, won })
	});
};

// added 28.7
// Update user ratings based on match result
export const updateUserRating = async (matchResult: MatchResult): Promise<UserStats | null> => {
	return fetchJson<UserStats>(`${import.meta.env.VITE_API_BASE_URL}/api/stats/update-rating`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(matchResult)
	});
};

//record game played
export const recordGame = async (createGameHistory: CreateGameHistory): Promise<void> => {
	await fetchJson(`${import.meta.env.VITE_API_BASE_URL}/api/history`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(createGameHistory)
	});
};
