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