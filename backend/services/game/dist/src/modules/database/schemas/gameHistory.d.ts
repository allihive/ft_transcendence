export interface GameHistoryEntry {
    matchId: string;
    winnerId: number;
    loserId: number;
    winnerScore: number;
    loserScore: number;
    createdAt: string;
}
export declare const GAME_HISTORY_TABLE_SQL = "\nCREATE TABLE IF NOT EXISTS game_history (\n\tmatchId TEXT PRIMARY KEY,\n\twinnerId INTEGER NOT NULL,\n\tloserId INTEGER NOT NULL,\n\twinnerScore INTEGER NOT NULL,\n\tloserScore INTEGER NOT NULL,\n\tcreatedAt TEXT NOT NULL\n);\n\n-- Create indexes for efficient queries\nCREATE INDEX IF NOT EXISTS idx_game_history_winner ON game_history(winnerId);\nCREATE INDEX IF NOT EXISTS idx_game_history_loser ON game_history(loserId);\n";
//# sourceMappingURL=gameHistory.d.ts.map