export interface Tournament {
	id: string;
	name: string;
	creator: string;
	participants: number;
	maxParticipants: number;
	bestOf: number;
	status: 'waiting' | 'in-progress' | 'completed';
	createdAt: string;
}

export interface CreateTournamentDto {
	name: string;
	maxParticipants: number;
	bestOf: number;
}

export interface JoinTournamentDto {
	tournamentId: string;
	playerId: string;
}

export interface TournamentResponse {
	success: boolean;
	data?: Tournament;
	message?: string;
}

export interface TournamentsResponse {
	success: boolean;
	data?: Tournament[];
	message?: string;
}

//29.7 
export interface RecordTournamentResultsDto {
	creatorId: string;
	name: string;
	tournamentSize: number;
	winnerId: string;
	matches: {
		player1Id: string;
		player2Id: string;
		winnerId: string;
		loserId: string;
		winnerScore: number;
		loserScore: number;
		round: number;
		matchNumber: number;
	}[];
}