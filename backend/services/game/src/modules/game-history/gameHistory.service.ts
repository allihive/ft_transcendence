//backend/services/game/src/modules/game-history/gameHistory.service.ts
import { getPlayerHistory, insertGameResult } from "../database/repositories/gameHistory.repository";
import { GameHistoryEntry } from "../database/schemas/gameHistory";
import { mockGameHistory } from "./gameHistory.mock"; // ← ✅ Import mock
import dotenv from 'dotenv';

dotenv.config(); // Only needed if not already loaded elsewhere

const USE_MOCK_DATA = process.env.USE_MOCK_GAME_HISTORY === 'true';

/**
 * Represents a player's game result for display purposes
 * Contains all information needed for the frontend game history view
 */
export interface PlayerGameResult {
  matchId: string;           // Unique match identifier
  date: string;             // When the game was played (formatted date)
  opponent: number;         // The opponent's player ID
  playerScore: number;      // This player's score
  opponentScore: number;    // Opponent's score
  result: 'WIN' | 'LOSS';   // Did this player win or lose?
}

/**
 * Game History Service
 * 
 * Handles retrieving and formatting game history data for players.
 * Primarily used by the frontend to display recent match history.
 */

export class GameHistoryService {
	  /**
   * Get the most recent games for a specific player
   * 
   * This method:
   * 1. Retrieves recent games where the player was either winner or loser
   * 2. Formats the data for easy frontend consumption
   * 3. Determines win/loss result from the player's perspective
   * 4. Returns results sorted by most recent first
   * 
   * @param playerId - The player whose game history to retrieve
   * @param limit - Maximum number of games to return (default: 10)
   * @returns Array of formatted game results for display
   */
  async getPlayerGameHistory(playerId: number, limit: number = 5): Promise<PlayerGameResult[]> {
	try {
    console.log('🔍 USE_MOCK_DATA:', USE_MOCK_DATA);
    console.log('🔍 process.env.USE_MOCK_GAME_HISTORY:', process.env.USE_MOCK_GAME_HISTORY);
    // ✅ Use mock data or real DB data
    const gameHistory: GameHistoryEntry[] = USE_MOCK_DATA
      ? mockGameHistory.filter(game => game.winnerId === playerId || game.loserId === playerId)
      : await getPlayerHistory(playerId, limit);
		// translate the database record into readable format
		const formattedResults: PlayerGameResult[] = gameHistory.map(game =>
		{
			//Determine if this player won or not, because how the db is set up, I need to make sure the correct score is matching the winner/loser
			const playerWon = game.winnerId === playerId;
			//Get opponent ID and scores from the player's perspective
			const opponent = playerWon ? game.loserId : game.winnerId;
			const playerScore = playerWon ? game.winnerScore : game.loserScore;
			const opponentScore = playerWon ? game.loserScore : game.winnerScore;

			return {
				matchId: game.matchId,
				date: this.formatDate(game.createdAt),
				opponent: opponent,
				playerScore: playerScore,
				opponentScore: opponentScore,
				result: playerWon ? 'WIN' : 'LOSS'
			};
		});
		
		return formattedResults;
	} catch (error) {
      console.error(`Error retrieving game history for player ${playerId}:`, error);
      throw error;
	}
  }

    /**
   * Record a completed match in the game history
   * 
   * This method should be called from the matchmaking service
   * when a match completes to store the result.
   * 
   * @param matchId - Unique match identifier
   * @param winnerId - Player who won
   * @param loserId - Player who lost  
   * @param winnerScore - Winner's final score
   * @param loserScore - Loser's final score
   */
  async recordMatch(
    matchId: string,
    winnerId: number,
    loserId: number,
    winnerScore: number,
    loserScore: number
  ): Promise<void> {
    try {
      await insertGameResult({
        matchId,
        winnerId,
        loserId,
        winnerScore,
        loserScore,
        createdAt: new Date().toISOString()
      });
      
      console.log(`🎮 Game history recorded: Match ${matchId} - Winner: ${winnerId}, Loser: ${loserId}`);
    } catch (error) {
      console.error(`Error recording match ${matchId}:`, error);
      throw error;
    }
  }

  /**
   * Format ISO timestamp to user-friendly date string
   * 
   * @param isoString - ISO timestamp string from database
   * @returns Formatted date string (e.g., "Jan 15, 2024")
   * @private
   */
  private formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}