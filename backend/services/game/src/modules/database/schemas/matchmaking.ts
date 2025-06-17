export interface MatchmakingEntry {
	id: number;
	playerId: number;
	score: number;
	status: 'ONLINE' | 'OFFLINE' | 'IN_GAME';
	updatedAt: string; // ISO timestamp of last status update
}

export const MATCHMAKING_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS matchmaking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playerId INTEGER NOT NULL,
  score INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ONLINE', 'OFFLINE', 'IN_GAME')),
  updatedAt TEXT NOT NULL
);
`;