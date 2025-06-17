"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertGameResult = insertGameResult;
exports.getPlayerHistory = getPlayerHistory;
const index_1 = __importDefault(require("../index"));
/**
 * Insert a new game result into the database
 *
 * @param gameResult - The game result data to insert
 * @returns Promise that resolves when insertion is complete
 */
function insertGameResult(gameResult) {
    return new Promise((resolve, reject) => {
        const query = `
			INSERT INTO game_history (matchId, winnerId, loserId, winnerScore, loserScore, createdAt)
			VALUES (?, ?, ?, ?, ?, ?)
		`;
        index_1.default.run(query, [
            gameResult.matchId,
            gameResult.winnerId,
            gameResult.loserId,
            gameResult.winnerScore,
            gameResult.loserScore,
            gameResult.createdAt
        ], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
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
function getPlayerHistory(playerId, limit = 5) {
    return new Promise((resolve, reject) => {
        const query = `
			SELECT matchId, winnerId, loserId, winnerScore, loserScore, createdAt
			FROM game_history
			WHERE winnerId = ? OR loserId = ?
			ORDER BY createdAt DESC
			LIMIT ?
		`;
        index_1.default.all(query, [playerId, playerId, limit], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
//# sourceMappingURL=gameHistory.repository.js.map