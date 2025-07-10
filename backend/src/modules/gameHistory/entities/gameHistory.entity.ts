// src/modules/gameHistory/entities/game-history.entity.ts
import { Entity, PrimaryKey, Property, Check } from "@mikro-orm/core";
import { randomUUID } from "crypto";

@Entity({ tableName: "game_history" })
@Check({ expression: "winner_score >= 0 AND winner_score <= 5 AND loser_score >= 0 AND loser_score <= 5 AND winner_score > loser_score" })
export class GameHistory {
	@PrimaryKey({ type: "uuid" })
	id: string = randomUUID();

	@Property({ type: "uuid" })
	winnerId!: string;

	@Property({ type: "uuid" })
	loserId!: string;

	@Property({ type: "int", nullable: false, name: "winner_score" })
	winnerScore!: number;

	@Property({ type: "int", nullable: false, name: "loser_score" })
	loserScore!: number;

	@Property({ type: "timestamptz", nullable: false, defaultRaw: "CURRENT_TIMESTAMP", name: "created_at" })
	createdAt?: Date;
}

