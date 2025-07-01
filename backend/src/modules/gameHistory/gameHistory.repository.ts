// src/modules/gameHistory/gameHistory.repository.ts
import { EntityRepository } from '@mikro-orm/core';
import { GameHistory } from './entities/gameHistory.entity';

export class GameHistoryRepository extends EntityRepository<GameHistory> {
  /**
   * Get paginated game history for a specific player
   * @param playerId - The player whose history to retrieve
   * @param limit - Maximum number of games to return
   * @returns Promise that resolves to array of game history entries
   */
  async getPlayerHistory(playerId: string, limit: number = 5): Promise<GameHistory[]> {
    return this.find(
      {
        $or: [
          { winnerId: playerId },
          { loserId: playerId }
        ]
      },
      {
        orderBy: { createdAt: 'DESC' },
        limit
      }
    );
  }

  /**
   * Check if a match already exists
   * @param matchId - The match ID to check
   * @returns Promise that resolves to boolean
   */
  async matchExists(matchId: string): Promise<boolean> {
    const count = await this.count({ matchId });
    return count > 0;
  }

  /**
   * Get player statistics (wins, losses, total games)
   * @param playerId - The player whose stats to retrieve
   * @returns Promise that resolves to player statistics
   */
  async getPlayerStats(playerId: string): Promise<{
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    averageScore: number;
  }> {
    const games = await this.find({
      $or: [
        { winnerId: playerId },
        { loserId: playerId }
      ]
    });

    const wins = games.filter(game => game.winnerId === playerId).length;
    const losses = games.length - wins;
    const totalScore = games.reduce((sum, game) => {
      return sum + (game.winnerId === playerId ? game.winnerScore : game.loserScore);
    }, 0);

    return {
      totalGames: games.length,
      wins,
      losses,
      winRate: games.length > 0 ? (wins / games.length) * 100 : 0,
      averageScore: games.length > 0 ? totalScore / games.length : 0
    };
  }

  /**
   * Get recent matches with pagination
   * @param offset - Number of records to skip
   * @param limit - Maximum number of records to return
   * @returns Promise that resolves to array of recent matches
   */
  async getRecentMatches(offset: number = 0, limit: number = 10): Promise<GameHistory[]> {
    return this.find(
      {},
      {
        orderBy: { createdAt: 'DESC' },
        offset,
        limit
      }
    );
  }
}