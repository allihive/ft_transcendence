import { fetchJson } from '../client';
import type { CreateTournamentDto, JoinTournamentDto, TournamentResponse, TournamentsResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function createTournament(tournamentData: CreateTournamentDto): Promise<TournamentResponse> {
	try {
		const response = await fetchJson(`${API_BASE_URL}/tournaments`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(tournamentData),
		});
		return response;
	} catch (error) {
		console.error('Failed to create tournament:', error);
		throw error;
	}
}

export async function getTournaments(): Promise<TournamentsResponse> {
	try {
		const response = await fetchJson(`${API_BASE_URL}/tournaments`);
		return response;
	} catch (error) {
		console.error('Failed to get tournaments:', error);
		throw error;
	}
}

export async function joinTournament(joinData: JoinTournamentDto): Promise<TournamentResponse> {
	try {
		const response = await fetchJson(`${API_BASE_URL}/tournaments/${joinData.tournamentId}/join`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ playerId: joinData.playerId }),
		});
		return response;
	} catch (error) {
		console.error('Failed to join tournament:', error);
		throw error;
	}
}

export async function getTournament(tournamentId: string): Promise<TournamentResponse> {
	try {
		const response = await fetchJson(`${API_BASE_URL}/tournaments/${tournamentId}`);
		return response;
	} catch (error) {
		console.error('Failed to get tournament:', error);
		throw error;
	}
} 