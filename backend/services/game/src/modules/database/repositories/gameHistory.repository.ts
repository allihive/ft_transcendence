import db from '../index'
import { GameHistoryEntry } from "../schemas/gameHistory";

/**
 * Insert a new game result into the database
 * 
 * @param gameResult - The game result data to insert
 * @returns Promise that resolves when insertion is complete
 */
export function insertGameResult (gameResult: GameHistoryEntry): Promise<void> {
	return new Promise((resolve, reject) => {
		const query = `
			INSERT INTO game_history (matchId, winnerId, loserId, winnerScore, loserScore, createdAt)
			VALUES (?, ?, ?, ?, ?, ?)
		`;

		db.run(
			query,
			[
				gameResult.matchId,
				gameResult.winnerId,
				gameResult.loserId,
				gameResult.winnerScore,
				gameResult.loserScore,
				gameResult.createdAt
			],
			(err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			}
		);
	});
}

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
export function getPlayerHistory(playerId: number, limit: number = 5): Promise<GameHistoryEntry[]> {
	return new Promise((resolve, reject) => {
		const query = `
			SELECT matchId, winnerId, loserId, winnerScore, loserScore, createdAt
			FROM game_history
			WHERE winnerId = ? OR loserId = ?
			ORDER BY createdAt DESC
			LIMIT ?
		`;

		db.all(query, [playerId, playerId, limit], (err, rows: any[]) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows as GameHistoryEntry[]);
			}
		});
	});
}