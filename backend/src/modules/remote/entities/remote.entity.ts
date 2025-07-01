// src/modules/remote/entities/remote.entity.ts
import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

export enum Status {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  IN_GAME = 'IN_GAME',
}

@Entity({ tableName: 'remote_games' })
@Index({ name: 'idx_remote_game_player', properties: ['playerId'] })
@Index({ name: 'idx_remote_game_status_score', properties: ['status', 'rating'] })
export class RemoteGame {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'uuid', unique: true })
  playerId!: string;

  @Property({ default: 1000 })
  rating!: number;

  @Property({ type: () => Status, default: Status.OFFLINE })
  status!: Status;

  @Property()
  updatedAt: Date = new Date();

  @Property()
  createdAt: Date = new Date();

  constructor(data: {
    playerId: string;
    rating?: number;
    status?: Status;
    updatedAt: Date;
  }) {
    this.playerId = data.playerId;
    if (data.rating !== undefined) this.rating = data.rating;
    if (data.status !== undefined) this.status = data.status;
  }

    updateTimestamp() {
      this.updatedAt = new Date();
    }
}