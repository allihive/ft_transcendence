"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_HISTORY_TABLE_SQL = void 0;
exports.GAME_HISTORY_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS game_history (
	matchId TEXT PRIMARY KEY,
	winnerId INTEGER NOT NULL,
	loserId INTEGER NOT NULL,
	winnerScore INTEGER NOT NULL,
	loserScore INTEGER NOT NULL,
	createdAt TEXT NOT NULL
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_game_history_winner ON game_history(winnerId);
CREATE INDEX IF NOT EXISTS idx_game_history_loser ON game_history(loserId);
`;
//# sourceMappingURL=gameHistory.js.map