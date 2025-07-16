import { create } from 'zustand';
import type { Tournament, CreateTournamentDto } from '~/api/tournament/types';

interface TournamentPlayer {
	id: string;
	email: string;
	name: string;
	username: string;
	avatarUrl?: string;
	joinedAt: string;
}

interface TournamentWithPlayers extends Tournament {
	players: TournamentPlayer[];
}

interface TournamentStore {
	tournaments: TournamentWithPlayers[];
	loading: boolean;
	createTournament: (tournamentData: CreateTournamentDto, creator: string) => Promise<TournamentWithPlayers>;
	joinTournament: (tournamentId: string, player: TournamentPlayer) => Promise<TournamentWithPlayers | null>;
	getTournaments: () => TournamentWithPlayers[];
}

export const useTournament = create<TournamentStore>((set, get) => ({
	tournaments: [],
	loading: false,

	createTournament: async (tournamentData: CreateTournamentDto, creator: string) => {
		set({ loading: true });
		
		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 500));
		
		const newTournament: TournamentWithPlayers = {
			id: Date.now().toString(),
			name: tournamentData.name,
			creator: creator,
			participants: 1, // Creator is first participant
			maxParticipants: tournamentData.maxParticipants,
			bestOf: tournamentData.bestOf,
			status: 'waiting',
			createdAt: new Date().toISOString().split('T')[0],
			players: [
				{
					id: 'creator-id', // This would come from the logged-in user
					email: 'creator@example.com',
					name: creator,
					username: creator.toLowerCase().replace(/\s+/g, ''),
					avatarUrl: '/files/default-avatar.png',
					joinedAt: new Date().toISOString()
				}
			]
		};

		set(state => ({
			tournaments: [...state.tournaments, newTournament],
			loading: false
		}));

		return newTournament;
	},

	joinTournament: async (tournamentId: string, player: TournamentPlayer) => {
		set({ loading: true });
		
		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 300));
		
		const { tournaments } = get();
		const tournamentIndex = tournaments.findIndex(t => t.id === tournamentId);
		
		if (tournamentIndex === -1) {
			set({ loading: false });
			return null;
		}

		// Check if player is already in the tournament
		const tournament = tournaments[tournamentIndex];
		const isAlreadyJoined = tournament.players.some(p => p.id === player.id);
		
		if (isAlreadyJoined) {
			set({ loading: false });
			return tournament; // Already joined
		}

		// Check if tournament is full
		if (tournament.players.length >= tournament.maxParticipants) {
			set({ loading: false });
			return null; // Tournament is full
		}

		const updatedTournaments = [...tournaments];
		updatedTournaments[tournamentIndex] = {
			...updatedTournaments[tournamentIndex],
			participants: updatedTournaments[tournamentIndex].players.length + 1,
			players: [...updatedTournaments[tournamentIndex].players, player]
		};

		set({
			tournaments: updatedTournaments,
			loading: false
		});

		return updatedTournaments[tournamentIndex];
	},

	getTournaments: () => {
		return get().tournaments;
	}
})); 