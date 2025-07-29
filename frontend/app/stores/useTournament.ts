import { create } from 'zustand';

import type { Tournament, CreateTournamentDto, RecordTournamentResultsDto } from '../api/tournament/types';
import { recordTournamentResults } from '../api/tournament/tournament';

interface TournamentPlayer {
	id: string;
	email: string;
	name: string;
	username: string;
	avatarUrl?: string;
	joinedAt: string;
	stats?: {
		matchesPlayed: number;
		matchesWon: number;
		matchesLost: number;
		winRate: number;
		rating: number;
	};
}

interface BracketMatch {
	id: string;
	roundNumber: number;
	matchNumber: number;
	player1: TournamentPlayer | null;
	player2: TournamentPlayer | null;
	winner: TournamentPlayer | null;
	status: 'pending' | 'in_progress' | 'completed';
	nextMatchId?: string;
	finalScore?: string;
	gamesWon: {
		player1: number;
		player2: number;
	};
	requiredWins: number;
}

interface TournamentBracket {
	tournamentId: string;
	matches: BracketMatch[];
	rounds: number;
	isGenerated: boolean;
}

interface TournamentWithPlayers extends Tournament {
	players: TournamentPlayer[];
	bracket?: TournamentBracket;
}

interface TournamentStore {
	tournaments: TournamentWithPlayers[];
	loading: boolean;
	createTournament: (tournamentData: CreateTournamentDto, creator: string, creatorPlayer?: TournamentPlayer) => Promise<TournamentWithPlayers>;
	joinTournament: (tournamentId: string, player: TournamentPlayer) => Promise<TournamentWithPlayers | null>;
	startTournament: (tournamentId: string) => Promise<TournamentWithPlayers | null>;
	updateMatchResult: (tournamentId: string, matchId: string, winner: TournamentPlayer, finalScore?: string) => TournamentWithPlayers | null;
	getTournaments: () => TournamentWithPlayers[];
	getTournamentById: (tournamentId: string) => TournamentWithPlayers | null;
	submitTournamentResults: (tournamentId: string) => Promise<void>;
}

// Bracket generation functions
const generateBracketForFourPlayers = (players: TournamentPlayer[], bestOf: number): BracketMatch[] => {
	const shuffled = [...players].sort(() => Math.random() - 0.5);

	const matches: BracketMatch[] = [
		// Semifinals
		{
			id: 'match-1',
			roundNumber: 1,
			matchNumber: 1,
			player1: shuffled[0],
			player2: shuffled[1],
			winner: null,
			status: 'pending',
			nextMatchId: 'match-3',
			gamesWon: { player1: 0, player2: 0 },
			requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
		},
		{
			id: 'match-2',
			roundNumber: 1,
			matchNumber: 2,
			player1: shuffled[2],
			player2: shuffled[3],
			winner: null,
			status: 'pending',
			nextMatchId: 'match-3',
			gamesWon: { player1: 0, player2: 0 },
			requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
		},
		// Final
		{
			id: 'match-3',
			roundNumber: 2,
			matchNumber: 1,
			player1: null, // Winner of match-1
			player2: null, // Winner of match-2
			winner: null,
			status: 'pending',
			gamesWon: { player1: 0, player2: 0 },
			requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
		}
	];

	return matches;
};

const generateBracketWithBaskets = (players: TournamentPlayer[], bestOf: number): BracketMatch[] => {
	const playerCount = players.length;
	const isEightPlayers = playerCount === 8;

	// Sort players by rating (highest first)
	const sortedPlayers = [...players].sort((a, b) => {
		const aRating = a.stats?.rating || 0;
		const bRating = b.stats?.rating || 0;
		return bRating - aRating;
	});

	// Create 4 baskets
	const basketSize = Math.floor(playerCount / 4);
	const baskets: TournamentPlayer[][] = [
		sortedPlayers.slice(0, basketSize), // Top players
		sortedPlayers.slice(basketSize, basketSize * 2), // Second tier
		sortedPlayers.slice(basketSize * 2, basketSize * 3), // Third tier
		sortedPlayers.slice(basketSize * 3) // Bottom players
	];

	const matches: BracketMatch[] = [];
	let matchId = 1;

	if (isEightPlayers) {
		// For 8 players: 4 matches, 2 groups of 4
		for (let group = 0; group < 2; group++) {
			const groupPlayers: TournamentPlayer[] = [];
			for (let basket = 0; basket < 4; basket++) {
				if (baskets[basket].length > 0) {
					const randomIndex = Math.floor(Math.random() * baskets[basket].length);
					groupPlayers.push(baskets[basket].splice(randomIndex, 1)[0]);
				}
			}
			const shuffled = groupPlayers.sort(() => Math.random() - 0.5);
			for (let i = 0; i < 2; i++) {
				const player1 = shuffled[i * 2];
				const player2 = shuffled[i * 2 + 1];
				const semifinalId = group === 0 ? 'match-5' : 'match-6';
				matches.push({
					id: `match-${matchId}`,
					roundNumber: 1,
					matchNumber: matchId,
					player1,
					player2,
					winner: null,
					status: 'pending',
					nextMatchId: semifinalId,
					gamesWon: { player1: 0, player2: 0 },
					requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
				});
				matchId++;
			}
		}
		// Semifinals (match-5 and match-6)
		matches.push({
			id: 'match-5',
			roundNumber: 2,
			matchNumber: 1,
			player1: null, // Winner of match-1
			player2: null, // Winner of match-2
			winner: null,
			status: 'pending',
			nextMatchId: 'match-7',
			gamesWon: { player1: 0, player2: 0 },
			requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
		});
		matches.push({
			id: 'match-6',
			roundNumber: 2,
			matchNumber: 2,
			player1: null, // Winner of match-3
			player2: null, // Winner of match-4
			winner: null,
			status: 'pending',
			nextMatchId: 'match-7',
			gamesWon: { player1: 0, player2: 0 },
			requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
		});
		// Final (match-7)
		matches.push({
			id: 'match-7',
			roundNumber: 3,
			matchNumber: 1,
			player1: null, // Winner of match-5
			player2: null, // Winner of match-6
			winner: null,
			status: 'pending',
			gamesWon: { player1: 0, player2: 0 },
			requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
		});
	} else {
		// For 16 players: 8 matches, 4 groups of 4
		for (let group = 0; group < 4; group++) {
			const groupPlayers: TournamentPlayer[] = [];
			for (let basket = 0; basket < 4; basket++) {
				if (baskets[basket].length > 0) {
					const randomIndex = Math.floor(Math.random() * baskets[basket].length);
					groupPlayers.push(baskets[basket].splice(randomIndex, 1)[0]);
				}
			}
			const shuffled = groupPlayers.sort(() => Math.random() - 0.5);
			for (let i = 0; i < 2; i++) {
				const player1 = shuffled[i * 2];
				const player2 = shuffled[i * 2 + 1];
				const quarterfinalId = `match-${9 + Math.floor((group * 2 + i) / 2)}`;
				matches.push({
					id: `match-${matchId}`,
					roundNumber: 1,
					matchNumber: matchId,
					player1,
					player2,
					winner: null,
					status: 'pending',
					nextMatchId: quarterfinalId,
					gamesWon: { player1: 0, player2: 0 },
					requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
				});
				matchId++;
			}
		}
		// Quarterfinals (match-9, match-10, match-11, match-12)
		for (let i = 0; i < 4; i++) {
			const semifinalId = i < 2 ? 'match-13' : 'match-14';
			matches.push({
				id: `match-${9 + i}`,
				roundNumber: 2,
				matchNumber: i + 1,
				player1: null,
				player2: null,
				winner: null,
				status: 'pending',
				nextMatchId: semifinalId,
				gamesWon: { player1: 0, player2: 0 },
				requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
			});
		}
		// Semifinals (match-13, match-14)
		matches.push({
			id: 'match-13',
			roundNumber: 3,
			matchNumber: 1,
			player1: null, // Winner of match-9
			player2: null, // Winner of match-10
			winner: null,
			status: 'pending',
			nextMatchId: 'match-15',
			gamesWon: { player1: 0, player2: 0 },
			requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
		});
		matches.push({
			id: 'match-14',
			roundNumber: 3,
			matchNumber: 2,
			player1: null, // Winner of match-11
			player2: null, // Winner of match-12
			winner: null,
			status: 'pending',
			nextMatchId: 'match-15',
			gamesWon: { player1: 0, player2: 0 },
			requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
		});
		// Final (match-15)
		matches.push({
			id: 'match-15',
			roundNumber: 4,
			matchNumber: 1,
			player1: null, // Winner of match-13
			player2: null, // Winner of match-14
			winner: null,
			status: 'pending',
			gamesWon: { player1: 0, player2: 0 },
			requiredWins: Math.ceil(bestOf / 2) // Calculate required wins from bestOf
		});
	}
	return matches;
};

export const useTournament = create<TournamentStore>((set, get) => ({
	tournaments: [],
	loading: false,

	createTournament: async (tournamentData: CreateTournamentDto, creator: string, creatorPlayer?: TournamentPlayer) => {
		set({ loading: true });
		// Simulate API delay - original 
		await new Promise(resolve => setTimeout(resolve, 500));

		// Use provided creator player or create a default one
		const finalCreatorPlayer: TournamentPlayer = creatorPlayer || {
			id: creator.toLowerCase().replace(/\s+/g, ''), // Use creator name as ID for now
			email: `${creator.toLowerCase().replace(/\s+/g, '')}@example.com`,
			name: creator,
			username: creator.toLowerCase().replace(/\s+/g, ''),
			avatarUrl: '/files/default-avatar.png',
			joinedAt: new Date().toISOString(),
			stats: {
				matchesPlayed: 0,
				matchesWon: 0,
				matchesLost: 0,
				winRate: 0,
				rating: 50 // Default rating for new users
			}
		};

		const newTournament: TournamentWithPlayers = {
			id: Date.now().toString(),
			name: tournamentData.name,
			creator: creator,
			participants: 1, // Creator is first participant
			maxParticipants: tournamentData.maxParticipants,
			bestOf: tournamentData.bestOf,
			status: 'waiting',
			createdAt: new Date().toISOString().split('T')[0],
			players: [finalCreatorPlayer]
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

	startTournament: async (tournamentId: string) => {
		set({ loading: true });

		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 500));

		const { tournaments } = get();
		const tournamentIndex = tournaments.findIndex(t => t.id === tournamentId);

		if (tournamentIndex === -1) {
			set({ loading: false });
			return null;
		}

		const tournament = tournaments[tournamentIndex];

		// Check if tournament is ready to start
		if (tournament.participants < tournament.maxParticipants || tournament.status !== 'waiting') {
			set({ loading: false });
			return null;
		}

		// Generate bracket based on player count
		let matches: BracketMatch[] = [];
		let rounds = 0;

		if (tournament.players.length === 4) {
			matches = generateBracketForFourPlayers(tournament.players, tournament.bestOf);
			rounds = 2; // Semifinals + Final
		} else if (tournament.players.length === 8) {
			matches = generateBracketWithBaskets(tournament.players, tournament.bestOf);
			rounds = 3; // Quarterfinals + Semifinals + Final
		} else if (tournament.players.length === 16) {
			matches = generateBracketWithBaskets(tournament.players, tournament.bestOf);
			rounds = 4; // Round of 16 + Quarterfinals + Semifinals + Final
		}

		const bracket: TournamentBracket = {
			tournamentId,
			matches,
			rounds,
			isGenerated: true
		};

		const updatedTournaments = [...tournaments];
		updatedTournaments[tournamentIndex] = {
			...updatedTournaments[tournamentIndex],
			status: 'in-progress',
			bracket
		};

		set({
			tournaments: updatedTournaments,
			loading: false
		});

		return updatedTournaments[tournamentIndex];
	},

	getTournaments: () => {
		return get().tournaments;
	},

	getTournamentById: (tournamentId: string) => {
		const { tournaments } = get();
		return tournaments.find(t => t.id === tournamentId) || null;
	},

	updateMatchResult: (tournamentId: string, matchId: string, winner: TournamentPlayer, finalScore?: string) => {
		const { tournaments } = get();
		const tournamentIndex = tournaments.findIndex(t => t.id === tournamentId);

		if (tournamentIndex === -1) {
			console.error('Tournament not found');
			return null;
		}

		const tournament = tournaments[tournamentIndex];

		if (!tournament.bracket) {
			console.error('Tournament has no bracket');
			return null;
		}

		const updatedTournaments = [...tournaments];
		const updatedTournament = { ...updatedTournaments[tournamentIndex] };
		const updatedBracket: TournamentBracket = {
			...updatedTournament.bracket!,
			matches: updatedTournament.bracket!.matches || [],
		};
		const updatedMatches = [...updatedBracket.matches];

		// Find the match to update
		const matchIndex = updatedMatches.findIndex(m => m.id === matchId);

		if (matchIndex === -1) {
			console.error('Match not found in bracket');
			return null;
		}

		const match = { ...updatedMatches[matchIndex] };

		// Update games won for the winner
		if (winner.id === match.player1?.id) {
			match.gamesWon.player1++;
		} else if (winner.id === match.player2?.id) {
			match.gamesWon.player2++;
		}

		// Check if series is complete
		const p1Wins = match.gamesWon.player1;
		const p2Wins = match.gamesWon.player2;
		const requiredWins = match.requiredWins;

		if (p1Wins >= requiredWins || p2Wins >= requiredWins) {
			// Series is complete
			const seriesWinner = p1Wins >= requiredWins ? match.player1! : match.player2!;
			match.winner = seriesWinner;
			match.status = 'completed';
			if (finalScore) {
				match.finalScore = finalScore;
			}

			// Advance winner to next round if there is a next match
			if (match.nextMatchId) {
				const nextMatchIndex = updatedMatches.findIndex(m => m.id === match.nextMatchId);
				if (nextMatchIndex !== -1) {
					const nextMatch = { ...updatedMatches[nextMatchIndex] };

					// Find the complete player data from the tournament's players list
					const fullWinnerData = updatedTournament.players.find(p => p.id === seriesWinner.id) || seriesWinner;

					// Determine which slot the winner should fill based on bracket structure
					let targetSlot: 'player1' | 'player2' = 'player1';

					// 8-player tournament bracket logic
					if (match.nextMatchId === 'match-5') {
						targetSlot = (match.id === 'match-1') ? 'player1' : 'player2';
					} else if (match.nextMatchId === 'match-6') {
						targetSlot = (match.id === 'match-3') ? 'player1' : 'player2';
					} else if (match.nextMatchId === 'match-7') {
						targetSlot = (match.id === 'match-5') ? 'player1' : 'player2';
					}
					// 16-player tournament bracket logic
					else if (match.nextMatchId === 'match-9') {
						targetSlot = (match.id === 'match-1') ? 'player1' : 'player2';
					} else if (match.nextMatchId === 'match-10') {
						targetSlot = (match.id === 'match-3') ? 'player1' : 'player2';
					} else if (match.nextMatchId === 'match-11') {
						targetSlot = (match.id === 'match-5') ? 'player1' : 'player2';
					} else if (match.nextMatchId === 'match-12') {
						targetSlot = (match.id === 'match-7') ? 'player1' : 'player2';
					} else if (match.nextMatchId === 'match-13') {
						targetSlot = (match.id === 'match-9') ? 'player1' : 'player2';
					} else if (match.nextMatchId === 'match-14') {
						targetSlot = (match.id === 'match-11') ? 'player1' : 'player2';
					} else if (match.nextMatchId === 'match-15') {
						targetSlot = (match.id === 'match-13') ? 'player1' : 'player2';
					} else {
						targetSlot = !nextMatch.player1 ? 'player1' : 'player2';
					}

					nextMatch[targetSlot] = fullWinnerData;
					updatedMatches[nextMatchIndex] = nextMatch;
				}
			}
		} else {
			// Series continues
			match.status = 'in_progress';
		}

		// Update the match in the array first
		updatedMatches[matchIndex] = match;

		// Check if tournament is complete (final match completed) - moved outside series logic
		const finalMatches = updatedMatches.filter(m => !m.nextMatchId);
		const allFinalsComplete = finalMatches.every(m => m.status === 'completed');

		if (allFinalsComplete) {
			updatedTournament.status = 'completed';

			// Automatically submit tournament results to backend when tournament completes
			setTimeout(async () => {
				try {
					await get().submitTournamentResults(tournamentId);
				} catch (error) {
					console.error('Failed to submit tournament results:', error);
				}
			}, 2000);
		}

		updatedBracket.matches = updatedMatches;
		updatedTournament.bracket = updatedBracket;
		updatedTournaments[tournamentIndex] = updatedTournament;

		set({ tournaments: updatedTournaments });

		return updatedTournament;
	},

	submitTournamentResults: async (tournamentId: string) => {
		const { tournaments } = get();
		const tournament = tournaments.find(t => t.id === tournamentId);

		if (!tournament || !tournament.bracket || tournament.status !== 'completed') {
			console.error('Tournament not found or not completed');
			return;
		}

		// Get all completed matches
		const completedMatches = tournament.bracket.matches.filter(m => m.status === 'completed');

		if (completedMatches.length === 0) {
			console.error('No completed matches found');
			return;
		}

		// Find overall tournament winner (winner of final match)
		const finalMatches = completedMatches.filter(m => !m.nextMatchId);
		const tournamentWinner = finalMatches[0]?.winner;

		if (!tournamentWinner) {
			console.error('Tournament winner not found');
			return;
		}

		// Convert matches to backend format
		const matchResults = completedMatches.map(match => {
			if (!match.player1 || !match.player2 || !match.winner) {
				throw new Error(`Incomplete match data for ${match.id}`);
			}

			// Parse finalScore (e.g., "5-3" or "3-1")
			let winnerScore = 5; // Default to max
			let loserScore = 0;

			if (match.finalScore) {
				const scores = match.finalScore.split('-').map(Number);
				if (scores.length === 2 && !isNaN(scores[0]) && !isNaN(scores[1])) {
					// Determine which score belongs to winner
					if (match.winner.id === match.player1.id) {
						winnerScore = scores[0];
						loserScore = scores[1];
					} else {
						winnerScore = scores[1];
						loserScore = scores[0];
					}
				}
			}

			// Determine loser (the player who didn't win)
			const loser = match.winner.id === match.player1.id ? match.player2 : match.player1;

			return {
				player1Id: match.player1.id,
				player2Id: match.player2.id,
				winnerId: match.winner.id,
				loserId: loser.id,
				winnerScore,
				loserScore,
				round: match.roundNumber,
				matchNumber: match.matchNumber
			};
		});

		// Prepare payload for backend
		const payload: RecordTournamentResultsDto = {
			// tournamentId,
			creatorId: tournament.creator,
			name: tournament.name,
			tournamentSize: tournament.maxParticipants,
			winnerId: tournamentWinner.id,
			matches: matchResults
		};

		try {
			// TODO: API call to backend
			// const response = await fetch('/api/tournaments/results', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(payload)
			// });

			// Simulate API delay
			// added 25.7 - Use the dedicated API function instead of direct fetch

			console.log ("PAYLOAD=", payload);

			const result = await recordTournamentResults(payload);
			console.log('✅ Tournament results submitted successfully:', result);

		} catch (error) {
			console.error('❌ Failed to submit tournament results:', error);
			throw error;
		}
	}
})); 