// src/modules/gameHistory/gameHistory.service.ts
import { EntityManager } from '@mikro-orm/core';
import { GameHistoryRepository } from './gameHistory.repository';
import { GameHistory } from './entities/gameHistory.entity';
import { PlayerGameResultDto, RecordMatchDto } from './gameHistory.dto';
import { ConflictException } from '../../common/exceptions/ConflictException';
import { BadRequestException } from '../../common/exceptions/BadRequestException';

export class GameHistoryService {
  private readonly gameHistoryRepository: GameHistoryRepository;

  constructor(private readonly em: EntityManager) {
    this.gameHistoryRepository = em.getRepository(GameHistory);
  }

  async getPlayerGameHistory(playerId: string, limit: number = 5): Promise<PlayerGameResultDto[]> {
    try {
      const gameHistory: GameHistory[] = await this.gameHistoryRepository.getPlayerHistory(playerId, limit);

      const formattedResults: PlayerGameResultDto[] = gameHistory.map(game => {
        const playerWon = game.winnerId === playerId;

        return {
          matchId: game.matchId,
          date: this.formatDate(game.createdAt),
          opponent: playerWon ? game.loserId : game.winnerId,
          playerScore: playerWon ? game.winnerScore : game.loserScore,
          opponentScore: playerWon ? game.loserScore : game.winnerScore,
          result: playerWon ? 'WIN' : 'LOSS',
        };
      });

      return formattedResults;
    } catch (error) {
      console.error(`Error retrieving game history for player ${playerId}:`, error);
      throw error;
    }
  }

  async recordMatch(recordMatchDto: RecordMatchDto): Promise<GameHistory> {
    const { matchId, winnerId, loserId, winnerScore, loserScore } = recordMatchDto;

    try {
      const existingMatch = await this.gameHistoryRepository.matchExists(matchId);
      if (existingMatch) {
        throw new ConflictException(`Match with ID ${matchId} has already been recorded`);
      }

      if (winnerId === loserId) {
        throw new BadRequestException('Winner and loser cannot be the same player');
      }

      if (winnerScore <= loserScore) {
        throw new BadRequestException('Winner score must be higher than loser score');
      }

      const gameHistory = new GameHistory({
        matchId,
        winnerId,
        loserId,
        winnerScore,
        loserScore,
      });

      this.em.persist(gameHistory);
      await this.em.flush();

      console.log(`🎮 Game history recorded: Match ${matchId} - Winner: ${winnerId}, Loser: ${loserId}`);
      return gameHistory;
    } catch (error) {
      console.error(`Error recording match ${matchId}:`, error);
      throw error;
    }
  }

  async getPlayerStats(playerId: string): Promise<{
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    averageScore: number;
  }> {
    try {
      return await this.gameHistoryRepository.getPlayerStats(playerId);
    } catch (error) {
      console.error(`Error retrieving player stats for player ${playerId}:`, error);
      throw error;
    }
  }

  async getRecentMatches(page: number = 1, limit: number = 10): Promise<GameHistory[]> {
    try {
      const offset = (page - 1) * limit;
      return await this.gameHistoryRepository.getRecentMatches(offset, limit);
    } catch (error) {
      console.error('Error retrieving recent matches:', error);
      throw error;
    }
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}