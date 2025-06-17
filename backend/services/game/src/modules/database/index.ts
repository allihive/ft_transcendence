import sqlite3 from 'sqlite3';
import { MATCHMAKING_TABLE_SQL } from './schemas/matchmaking';
import { GAME_HISTORY_TABLE_SQL } from './schemas/gameHistory';

const db = new sqlite3.Database('mydb.sqlite');

// This runs the SQL to create both tables if they don't exist
export const dbReady = new Promise<void>((resolve, reject) => {
  // Create matchmaking table first
  db.run(MATCHMAKING_TABLE_SQL, (err) => {
    if (err) {
      console.error('Failed to create matchmaking table:', err);
      reject(err);
      return;
    }
    console.log('Matchmaking table is ready!');
    
    // Then create game history table
    db.run(GAME_HISTORY_TABLE_SQL, (err) => {
      if (err) {
        console.error('Failed to create game_history table:', err);
        reject(err);
      } else {
        console.log('Game history table is ready!');
        resolve();
      }
    });
  });
});

export default db;