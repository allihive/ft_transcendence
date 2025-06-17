"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbReady = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const matchmaking_1 = require("./schemas/matchmaking");
const gameHistory_1 = require("./schemas/gameHistory");
const db = new sqlite3_1.default.Database('mydb.sqlite');
// This runs the SQL to create both tables if they don't exist
exports.dbReady = new Promise((resolve, reject) => {
    // Create matchmaking table first
    db.run(matchmaking_1.MATCHMAKING_TABLE_SQL, (err) => {
        if (err) {
            console.error('Failed to create matchmaking table:', err);
            reject(err);
            return;
        }
        console.log('Matchmaking table is ready!');
        // Then create game history table
        db.run(gameHistory_1.GAME_HISTORY_TABLE_SQL, (err) => {
            if (err) {
                console.error('Failed to create game_history table:', err);
                reject(err);
            }
            else {
                console.log('Game history table is ready!');
                resolve();
            }
        });
    });
});
exports.default = db;
//# sourceMappingURL=index.js.map