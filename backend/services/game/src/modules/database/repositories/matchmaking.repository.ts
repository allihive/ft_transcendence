// import { resolve } from 'path';
import db from '../index';
import { MatchmakingEntry  } from '../schemas/matchmaking'; // so TS knows the struct of the data that the function will return

export function findOnlinePlayers(): Promise<MatchmakingEntry[]> {
	return new Promise((resolve, reject) => {
		db.all(
			"SELECT * FROM matchmaking WHERE status = 'ONLINE'", (err, rows) => {
				if (err)
					reject(err);
				else
					resolve(rows as MatchmakingEntry[]);
			}
		);
	});
}