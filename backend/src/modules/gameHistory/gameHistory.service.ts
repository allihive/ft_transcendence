// src/modules/gameHistory/gameHistory.service.ts
import { EntityManager, RequiredEntityData, UniqueConstraintViolationException } from '@mikro-orm/core';
import { GameHistoryRepository } from './gameHistory.repository';
import { GameHistory } from './entities/gameHistory.entity';
import { CreateGameHistoryDto, GetPlayerHistoryParamsDto, GetPlayerHistoryQueryDto, PlayerGameResultDto } from './gameHistory.dto';
import { ConflictException } from '../../common/exceptions/ConflictException';

export class GameHistoryService {
	constructor(
		private readonly gameHistoryRepository: GameHistoryRepository
	) { }

	async getPlayerHistory(
		em: EntityManager,
		params: GetPlayerHistoryParamsDto,
		query: GetPlayerHistoryQueryDto
	): Promise<{ games: PlayerGameResultDto[], total: number, page: number, totalPages: number }> {
		try {
			const { playerId } = params;
			const { limit, page } = query;

			// Get game history from repository
			const [gameHistory, total] = await this.gameHistoryRepository.getPlayerHistory(
				em,
				playerId,
				page,
				limit
			);
			// Format the results based on your GameHistory entity structure
			const formattedResults: PlayerGameResultDto[] = gameHistory.map(game => {
				const playerWon = game.winnerId === playerId;

				return {
					// date: game.createdAt!.toISOString(),
					opponent: playerWon ? game.loserId : game.winnerId,
					playerScore: playerWon ? game.winnerScore : game.loserScore,
					opponentScore: playerWon ? game.loserScore : game.winnerScore,
					result: playerWon ? 'WIN' : 'LOSS',
				};
			});
			// Calculate pagination info
			const totalPages = Math.ceil(total / limit);
			return {
				games: formattedResults,
				total,
				page,
				totalPages
			};
		} catch (error) {
			console.error(`Error retrieving game history for player ${params.playerId}:`, error);
			throw error;
		}
	}

	async createGameHistory(em: EntityManager, createGameHistoryDto: CreateGameHistoryDto): Promise<GameHistory> {
		const data: RequiredEntityData<GameHistory> = {
			winnerId: createGameHistoryDto.winnerId,
			loserId: createGameHistoryDto.loserId,
			winnerScore: createGameHistoryDto.winnerScore,
			loserScore: createGameHistoryDto.loserScore
		};

		try {
			return this.gameHistoryRepository.createGameHistory(em, data);
		} catch (error) {
			if (error instanceof UniqueConstraintViolationException) {
				throw new ConflictException(error.message);
			}
			throw error;
		}
	}
}
// async getPlayerStats(playerId: string): Promise<{
// 	totalGames: number;
// 	wins: number;
// 	losses: number;
// 	winRate: number;
// 	averageScore: number;
// }> {
// 	try {
// 		return await this.gameHistoryRepository.getPlayerStats(playerId);
// 	} catch (error) {
// 		console.error(`Error retrieving player stats for player ${playerId}:`, error);
// 		throw error;
// 	}
// }

// async getRecentMatches(page: number = 1, limit: number = 10): Promise<GameHistory[]> {
// 	try {
// 		const offset = (page - 1) * limit;
// 		return await this.gameHistoryRepository.getRecentMatches(offset, limit);
// 	} catch (error) {
// 		console.error('Error retrieving recent matches:', error);
// 		throw error;
// 	}
// }

// private formatDate(date: Date): string {
// 	return date.toLocaleDateString('en-US', {
// 		year: 'numeric',
// 		month: 'short',
// 		day: 'numeric',
// 		hour: '2-digit',
// 		minute: '2-digit',
// 	});
// }
