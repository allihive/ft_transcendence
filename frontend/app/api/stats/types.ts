export type getUserStatsProps = {
	userId: string;
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    winRate: number;
}

export type getUserMatchHistory = {
	// matchId: string,
	date: string;
	opponent?: string; // Optional UUID string for opponent, undefined for local games
	opponentName?: string; // Display name for local opponents
	playerScore: number;
	opponentScore: number;
	result: 'WIN' | 'LOSS';
	isLocal: boolean; // Indicate if this was a local game
}

export type GameHistoryResponse = {
	games: getUserMatchHistory[];
	total: number;
	page: number;
	totalPages: number;
}