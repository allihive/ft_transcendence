import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { randomUUID } from "crypto";

@Entity({ tableName: "user_stats" })
@Unique({ properties: ["userId"] })
export class UserStats {
	@PrimaryKey({ type: "uuid" })
	id: string = randomUUID();

	@Property({ type: "uuid", name: "user_id" })
	userId!: string;

	@Property({ type: "int", default: 0, name: "matches_played" })
	matchesPlayed: number = 0;

	@Property({ type: "int", default: 0, name: "matches_won" })
	matchesWon: number = 0;

	@Property({ type: "int", default: 0, name: "matches_lost" })
	matchesLost: number = 0;

	@Property({ type: "float", default: 0.0, name: "win_rate" })
	winRate: number = 0.0;

	@Property({ type: "int", default: 100 })
	rating!: number; // added 21.7

	@Property({ type: "timestamptz", defaultRaw: "CURRENT_TIMESTAMP", name: "updated_at" })
	updatedAt?: Date;
}
