/**
 * Represents a player's game result for display purposes
 * Contains all information needed for the frontend game history view
 */
export interface PlayerGameResult {
    matchId: string;
    date: string;
    opponent: number;
    playerScore: number;
    opponentScore: number;
    result: 'WIN' | 'LOSS';
}
/**
 * Game History Service
 *
 * Handles retrieving and formatting game history data for players.
 * Primarily used by the frontend to display recent match history.
 */
export declare class GameHistoryService {
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
    getPlayerGameHistory(playerId: number, limit?: number): Promise<PlayerGameResult[]>;
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
    recordMatch(matchId: string, winnerId: number, loserId: number, winnerScore: number, loserScore: number): Promise<void>;
    /**
     * Format ISO timestamp to user-friendly date string
     *
     * @param isoString - ISO timestamp string from database
     * @returns Formatted date string (e.g., "Jan 15, 2024")
     * @private
     */
    private formatDate;
}
//# sourceMappingURL=gameHistory.service.d.ts.map