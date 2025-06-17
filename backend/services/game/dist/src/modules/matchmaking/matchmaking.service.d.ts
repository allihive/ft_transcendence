import { MatchmakingEntry } from '../database/schemas/matchmaking';
/**
 * Represents a successful match between two players
 * Contains all the information needed to start a game session
 */
export interface MatchResult {
    player1: MatchmakingEntry;
    player2: MatchmakingEntry;
    scoreDifference: number;
    matchId: string;
    isTimeoutMatch?: boolean;
}
export interface MatchmakingConfig {
    matchTimeout: number;
    minPlayersForMatch: number;
}
/**
 * Main Matchmaking Service Class
 *
 * This service handles the entire lifecycle of player matchmaking:
 * 1. Queue management (players joining/leaving)
 * 2. Match creation (finding compatible opponents)
 * 3. Game session tracking (monitoring active matches)
 * 4. Rating updates (adjusting player scores after games)
 * 5. Queue maintenance (cleaning up expired entries)
 *
 * The service uses a skill-based matchmaking system where players with similar
 * ratings are matched together, with flexibility increasing over time to reduce wait times.
 */
export declare class MatchmakingService {
    private config;
    private matchMakingQueue;
    private activeMatches;
    private matchMakingInterval;
    constructor(config?: MatchmakingConfig);
    private startMatchMaking;
    private stopMatchMaking;
    /**
    * Add a player to the matchmaking queue
    *
    * This function:
    * 1. Updates the player's status to 'ONLINE' in the database
    * 2. Adds them to the internal queue with a timestamp
    * 3. Makes them available for matching with other players
    *
    * @param playerId can also be changed to maybe a class called Player?
    * @throws Error if database update fails
    */
    joinQueue(playerId: number): Promise<void>;
    /**
    * Remove a player from the matchmaking queue
    *
    * This function:
    * 1. Updates the player's status to 'OFFLINE' in the database
    * 2. Removes them from the internal queue tracking
    * 3. Prevents them from being matched with other players
    */
    leaveQueue(playerId: number): Promise<void>;
    /**
     * Update a player's status in the database
     * This utility function handles all status transitions:
     * - OFFLINE: Player is not available for matching
     * - ONLINE: Player is available and can be matched
     * - IN_GAME: Player is currently in a match
     */
    private updatePlayerStatus;
    /**
     * Main matchmaking algorithm - finds optimal matches for waiting players
     *
     * This is the core of the matchmaking system. It:
     * 1. Retrieves all online players from the database
     * 2. Filters for players actually in the matchmaking queue
     * 3. Uses a skill-based algorithm to create balanced matches
     * 4. Updates player statuses to 'IN_GAME' for matched players
     * 5. Removes matched players from the queue
     * 6. Tracks active matches for completion handling
     *
     * The algorithm prioritizes:
     * - Skill balance (similar ratings)
     * - Wait time (players waiting longer get priority)
     * - Overall fairness (everyone gets matched eventually)
     *
     * @returns Array of MatchResult objects representing created matches
     * @throws Error if database operations fail
     */
    findMatches(): Promise<MatchResult[]>;
    /**
       * Core matching algorithm - creates optimal player pairings
       *
       * This algorithm implements a greedy approach to find the best possible matches:
       * 1. Sorts players by skill rating for efficient comparison
       * 2. For each player, finds their best possible opponent
       * 3. Uses dynamic criteria that relaxes over time (longer wait = more flexible matching)
       * 4. Ensures each player is only matched once
       * 5. Prioritizes skill balance while considering wait times
       *
       * The algorithm is designed to be:
       * - Fair: Better matches for players who wait longer
       * - Efficient: O(n²) complexity, suitable for reasonable player counts
       * - Balanced: Prioritizes skill similarity while avoiding indefinite waits
       *
       * @param players - Array of available players to match
       * @returns Array of optimal match pairings
       * @private
       */
    private createMatches;
    /**
       * Handle the completion of a match and update player ratings
       *
       * This function processes the end of a game session:
       * 1. Validates that the match exists and is active
       * 2. Calculates new skill ratings based on the match result
       * 3. Updates both players' ratings in the database
       * 4. Sets both players back to 'ONLINE' status (available for new matches)
       * 5. Removes the match from active tracking
       *
       * The rating system is designed to:
       * - Reward wins more when beating higher-skilled opponents
       * - Penalize losses less when losing to higher-skilled opponents
       * - Give bonus points for dominant victories (large score margins)
       * - Maintain rating stability over time
       *
       * @param matchId - Unique identifier of the completed match
       * @param winnerId - Player ID of the match winner
       * @param winnerScore - Final score of the winning player
       * @param loserScore - Final score of the losing player
       * @throws Error if match is not found or database operations fail
       */
    completeMatch(matchId: string, winnerId: number, winnerScore: number, loserScore: number): Promise<void>;
    /**
    * Simple rating calculation based on score difference
    *
    * Rules:
    * - Winner gains: score difference × 100
    * - Loser loses: score difference × 50
    * - Ratings cannot go below 0
    *
    * Example: Player1 (100) beats Player2 (200) with score 11-9
    * - Score difference = |11 - 9| = 2
    * - Player1 gains: 2 × 100 = 200 → new score: 100 + 200 = 300
    * - Player2 loses: 2 × 50 = 100 → new score: 200 - 100 = 100
    *
    * @param winner - The winning player's data
    * @param loser - The losing player's data
    * @param winnerGameScore - Final game score of the winner
    * @param loserGameScore - Final game score of the loser
    * @returns Object containing the new ratings for both players
    */
    private calculateNewScores;
    /**
     * Generate a unique identifier for a match
     *
     * Creates a unique match ID using:
     * - Current timestamp (ensures uniqueness across time)
     * - Random string (ensures uniqueness within the same millisecond)
     *
     * Format: "match_[timestamp]_[randomstring]"
     * Example: "match_1640995200000_x7k9m2p4q"
     *
     * @returns Unique match identifier string
     * @private
     */
    private generateMatchId;
    /**
   * Update a player's skill rating in the database
   *
   * This function is called after matches to update player ratings.
   * It also updates the timestamp to track when the rating was last changed.
   *
   * @param playerId - The player whose rating to update
   * @param newScore - The new skill rating to set
   * @returns Promise that resolves when the database is updated
   * @private
   */
    private updatePlayerScore;
    getPlayerQueueStatus(playerId: number): Promise<{
        inQueue: boolean;
        waitTime: number;
        queueSize: number;
    }>;
    /**
     * Clean up expired queue entries and reset problematic player states
     *
     * This maintenance function should be called periodically to:
     * 1. Remove players who have been waiting too long (likely disconnected)
     * 2. Reset players stuck in invalid states
     * 3. Keep the queue healthy and responsive
     *
     * Players are considered "expired" if they've been in queue for more than
     * 10x the normal timeout period, indicating they've likely disconnected
     * without properly leaving the queue.
     *
     * This function helps prevent:
     * - Ghost players cluttering the queue
     * - Matches being created with disconnected players
     * - Memory leaks from indefinitely growing queue maps
     *
     * @returns Promise that resolves when cleanup is complete
     */
    cleanupQueue(): Promise<void>;
}
//# sourceMappingURL=matchmaking.service.d.ts.map