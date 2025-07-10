// src/modules/remote/entities/remote.entity.ts
import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

export enum Status {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  IN_GAME = 'IN_GAME',
}

@Entity({ tableName: 'remote_games' })
// @Index({ name: 'idx_remote_game_player', properties: ['playerId'] })
// @Index({ name: 'idx_remote_game_status_score', properties: ['status', 'rating'] })
export class RemoteGame {
  // may not need this
	@PrimaryKey({ type: "uuid" })
	id: string = randomUUID();

  @Property({ type: 'uuid' })
  playerId!: string;

  @Property({ default: 100 })
  rating!: number;

  @Property({ type: () => Status, default: Status.OFFLINE })
  status!: Status;

	@Property({ type: "timestamptz", nullable: false, defaultRaw: "CURRENT_TIMESTAMP", name: "updated_at" })
  updatedAt?: Date;

	@Property({ type: "timestamptz", nullable: false, defaultRaw: "CURRENT_TIMESTAMP", name: "created_at" })
	createdAt?: Date;
}