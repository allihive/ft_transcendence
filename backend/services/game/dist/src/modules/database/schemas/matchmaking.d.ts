export interface MatchmakingEntry {
    id: number;
    playerId: number;
    score: number;
    status: 'ONLINE' | 'OFFLINE' | 'IN_GAME';
    updatedAt: string;
}
export declare const MATCHMAKING_TABLE_SQL = "\nCREATE TABLE IF NOT EXISTS matchmaking (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  playerId INTEGER NOT NULL,\n  score INTEGER NOT NULL,\n  status TEXT NOT NULL CHECK(status IN ('ONLINE', 'OFFLINE', 'IN_GAME')),\n  updatedAt TEXT NOT NULL\n);\n";
//# sourceMappingURL=matchmaking.d.ts.map