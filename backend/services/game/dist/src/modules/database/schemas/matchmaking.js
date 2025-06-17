"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MATCHMAKING_TABLE_SQL = void 0;
exports.MATCHMAKING_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS matchmaking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playerId INTEGER NOT NULL,
  score INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ONLINE', 'OFFLINE', 'IN_GAME')),
  updatedAt TEXT NOT NULL
);
`;
//# sourceMappingURL=matchmaking.js.map