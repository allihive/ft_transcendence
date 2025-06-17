import { GameHistoryEntry } from "../schemas/gameHistory";
/**
 * Insert a new game result into the database
 *
 * @param gameResult - The game result data to insert
 * @returns Promise that resolves when insertion is complete
 */
export declare function insertGameResult(gameResult: GameHistoryEntry): Promise<void>;
/**
 * Get game history for a specific player
 *
 * Retrieves games where the player was either the winner or loser,
 * sorted by most recent first.
 *
 * @param playerId - The player whose history to retrieve
 * @param limit - Maximum number of games to return
 * @returns Promise that resolves to array of game history entries
 */
export declare function getPlayerHistory(playerId: number, limit?: number): Promise<GameHistoryEntry[]>;
//# sourceMappingURL=gameHistory.repository.d.ts.map