// src/module/tournament/tournament.service.ts
import { EntityData, EntityManager, RequiredEntityData, UniqueConstraintViolationException } from "@mikro-orm/core";
import { ConflictException } from "../../common/exceptions/ConflictException";
import { NotFoundException } from "../../common/exceptions/NotFoundException";
import { randomUUID } from "crypto";
import { TournamentGameRepository } from "./tournament.repository";
import { TournamentStatus, TournamentSize, TournamentGame } from "./entities/tournament.entity";
import { CreateTournamentDto, JoinTournamentDto, LeaveTournamentDto, RecordTournamentResultsDto } from "./tournament.dto";
import { GameHistoryService } from "../gameHistory/gameHistory.service";

/**
 * will help create the tournament populate the first round of the matches based on rating calculation and then send it frontend
 * receive the data from frontend when the tournament is finished
 */
export class TournamentGameService {
	constructor(
		private readonly tournamentGameRepository: TournamentGameRepository,
		private readonly gameHistoryService: GameHistoryService
	) { }

	async findTournamentById(em: EntityManager, tournamentId: string): Promise<TournamentGame | null> {
		return this.tournamentGameRepository.findTournamentById(em, tournamentId)
	}

	async findAllTournamentGames(em: EntityManager, where: Partial<TournamentGame>): Promise<TournamentGame[] | null> {
		return this.tournamentGameRepository.findAllTournaments(em, where);
	}

	// Convenience methods for common queries
	async findTournamentsByStatus(em: EntityManager, status: TournamentStatus): Promise<TournamentGame[]> {
		return this.tournamentGameRepository.findAllTournaments(em, { tournamentStatus: status });
	}

	async findTournamentsByCreator(em: EntityManager, creatorId: string): Promise<TournamentGame[]> {
		return this.tournamentGameRepository.findAllTournaments(em, { creatorId });
	}

	async findTournamentsBySize(em: EntityManager, size: TournamentSize): Promise<TournamentGame[]> {
		return this.tournamentGameRepository.findAllTournaments(em, { tournamentSize: size });
	}

	async findOpenTournaments(em: EntityManager): Promise<TournamentGame[]> {
		return this.findTournamentsByStatus(em, TournamentStatus.OPEN);
	}

	async createTournamentGame(em: EntityManager, createTournamentDto: CreateTournamentDto): Promise<TournamentGame> {
		// Calculate number of rounds based on tournament size
		const numOfRounds = Math.log2(createTournamentDto.tournamentSize);

		const tournamentData: RequiredEntityData<TournamentGame> = {
			creatorId: createTournamentDto.creatorId,
			tournamentSize: createTournamentDto.tournamentSize,
			name: createTournamentDto.name, // Optional from DTO, can be undefined
			players: [createTournamentDto.creatorId], // Creator is first player
			tournamentStatus: TournamentStatus.OPEN, // Default status
			numOfRounds: numOfRounds // Calculated based on tournament size
		};

		try {
			return await this.tournamentGameRepository.createTournamentGame(em, tournamentData);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) {
				throw new ConflictException(error.message);
			}
			throw error;
		}
	}

async joinTournamentGame(em: EntityManager, tournamentId: string, joinTournamentDto: JoinTournamentDto): Promise<TournamentGame> {
    const tournament = await this.tournamentGameRepository.findTournamentById(em, tournamentId);
    if (!tournament) {
        throw new NotFoundException("Tournament not found");
    }
    if (tournament.tournamentStatus === TournamentStatus.FULL) {
        throw new ConflictException("Tournament is already full");
    }
    if (!tournament.players.includes(joinTournamentDto.playerId)) {
        tournament.players.push(joinTournamentDto.playerId);
        await em.persistAndFlush(tournament);
        
        // Check and update capacity after adding player
        return await this.checkTournamentCapacity(em, tournamentId);
    }
    return tournament;
}

	async leaveTournamentGame(em: EntityManager, tournamentId: string, leaveTournamentDto: LeaveTournamentDto): Promise<TournamentGame> {
		const tournament = await this.tournamentGameRepository.findTournamentById(em, tournamentId);
		if (!tournament) {
			throw new NotFoundException("Tournament not found");
		}
		// Remove the player from the players array
		tournament.players = tournament.players.filter(playerId => playerId !== leaveTournamentDto.playerId);
		
		await em.persistAndFlush(tournament);
		return tournament;
	}
	
	async checkTournamentCapacity(em: EntityManager, tournamentId: string): Promise<TournamentGame> {
		const tournament = await this.tournamentGameRepository.findTournamentById(em, tournamentId);
		if (!tournament) {
			throw new NotFoundException("Tournament not found");
		}
		if (tournament.players.length >= tournament.tournamentSize) {
			tournament.tournamentStatus = TournamentStatus.FULL;
			await em.persistAndFlush(tournament);
		}
		return tournament;
	}

	async startTournamentGame(em: EntityManager, tournamentId: string, playerId: string): Promise<TournamentGame> {
		const tournament = await this.tournamentGameRepository.findTournamentById(em, tournamentId);
		if (!tournament) {
			throw new NotFoundException("Tournament not found");
		}
		// Only creator can start the tournament
		if (tournament.creatorId !== playerId) {
			throw new ConflictException("Only the tournament creator can start the tournament");
		}
		// Check if tournament is full and ready to start
		if (tournament.tournamentStatus !== TournamentStatus.FULL) {
			throw new ConflictException("Tournament must be full before starting");
		}
		// Update tournament status to IN_PROGRESS
		tournament.tournamentStatus = TournamentStatus.IN_PROGRESS;
		await em.persistAndFlush(tournament);

		return tournament;
	}
	async recordTournamentResults(em: EntityManager, recordTournamentDto: RecordTournamentResultsDto): Promise<TournamentGame> {
		const { tournamentId, winnerId, matches } = recordTournamentDto;
		
		const tournament = await this.tournamentGameRepository.findTournamentById(em, tournamentId);
		if (!tournament) {
			throw new NotFoundException("Tournament not found");
		}

		// Check if tournament is in progress
		if (tournament.tournamentStatus !== TournamentStatus.IN_PROGRESS) {
			throw new ConflictException("Tournament is not in progress");
		}

		// Validate that winner is one of the tournament players
		if (!tournament.players.includes(winnerId)) {
			throw new ConflictException("Winner must be a tournament participant");
		}

		// Record each match in game history
		for (const match of matches) {
			await this.gameHistoryService.createGameHistory(em, {
				winnerId: match.winnerId,
				loserId: match.loserId,
				winnerScore: match.winnerScore,
				loserScore: match.loserScore,
				local: false // Tournament games are not local
			});
		}

		// Update tournament with winner and bracket
		tournament.winnerId = winnerId;
		tournament.tournamentStatus = TournamentStatus.COMPLETED;
		tournament.bracket = {
			matches: matches,
			winner: winnerId,
			completedAt: new Date()
		};

		await em.persistAndFlush(tournament);
		return tournament;
	}
}