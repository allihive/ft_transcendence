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

//25.7 added this. I know you had the interface in useTournament page already but I thought this would be cleaner?
export interface RecordTournamentResultsDto {
	tournamentId: string;
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