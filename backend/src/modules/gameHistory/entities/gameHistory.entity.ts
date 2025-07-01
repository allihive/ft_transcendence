// src/modules/gameHistory/entities/game-history.entity.ts
import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

@Entity({ tableName: 'game_history' })
@Index({ name: 'idx_game_history_winner', properties: ['winnerId'] })
@Index({ name: 'idx_game_history_loser', properties: ['loserId'] })
export class GameHistory {
  @PrimaryKey()
  matchId!: string;

  @Property({ type: 'uuid' })
  winnerId!: string;

  @Property({ type: 'uuid' })
  loserId!: string;

  @Property()
  winnerScore!: number;

  @Property()
  loserScore!: number;

  @Property()
  createdAt: Date = new Date();

  constructor(data: {
    matchId: string;
    winnerId: string;
    loserId: string;
    winnerScore: number;
    loserScore: number;
  }) {
    this.matchId = data.matchId;
    this.winnerId = data.winnerId;
    this.loserId = data.loserId;
    this.winnerScore = data.winnerScore;
    this.loserScore = data.loserScore;
  }
}