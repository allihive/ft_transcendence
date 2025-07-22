// src/modules/tournament/tournament.repository.ts
import { EntityManager, RequiredEntityData, EntityData } from '@mikro-orm/core';
import { TournamentGame, TournamentStatus } from './entities/tournament.entity';
import { NotFoundException } from "../../common/exceptions/NotFoundException";

export class TournamentGameRepository {
	async createTournamentGame(em: EntityManager, tournamentGameData: RequiredEntityData<TournamentGame>): Promise<TournamentGame> {
		const tournamentGame = em.create(TournamentGame, tournamentGameData);
		await em.persistAndFlush(tournamentGame);
		return tournamentGame;
	}

	async updateTournamentGame(em: EntityManager, tournamentId: string, tournamentData: EntityData<TournamentGame>) {
		const tournament = await em.findOne(TournamentGame, { id: tournamentId });
		if (!tournament) {
			throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
		}
		em.assign(tournament, tournamentData);
		await em.flush();
		return tournament;
	}

	// ============ Tournament Retrieval Functions ============
	
	async findTournamentById(em: EntityManager, tournamentId: string): Promise<TournamentGame | null> {
		return await em.findOne(TournamentGame, { id: tournamentId });
	}

	async findAllTournaments(em: EntityManager, where: Partial<TournamentGame> = {}): Promise<TournamentGame[]> {
		return await em.find(TournamentGame, where, { orderBy: { createdAt: 'DESC' } });
	}
	
	// ============ Tournament Status Management ============
	
	async updateTournamentBracket(em: EntityManager, tournamentId: string, bracket: any): Promise<TournamentGame> {
		const tournament = await em.findOne(TournamentGame, { id: tournamentId });
		if (!tournament) {
			throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
		}
		tournament.bracket = bracket;
		await em.flush();
		return tournament;
	}

	// ============ Tournament Completion and Cleanup ============
	
	async deleteTournament(em: EntityManager, tournamentId: string): Promise<void> {
		const tournament = await em.findOne(TournamentGame, { id: tournamentId });
		if (!tournament) {
			throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
		}
		await em.removeAndFlush(tournament);
	}

	async isTournamentCreator(em: EntityManager, tournamentId: string, userId: string): Promise<boolean> {
		const tournament = await this.findTournamentById(em, tournamentId);
		return tournament?.creatorId === userId;
	}
}