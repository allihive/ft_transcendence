//src/modules/tournament/entities/tournament.entity.ts
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

export enum TournamentStatus {
  OPEN = 'OPEN',           // Players can still join
  FULL = 'FULL',           // All slots filled, waiting to start
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TournamentSize {
  SMALL = 4,
  MEDIUM = 8,
  LARGE = 16
}

@Entity({ tableName: 'tournament' })
export class TournamentGame {
  @PrimaryKey({ type: "uuid" })
  id: string = randomUUID();

  @Property({ nullable: true })
  name?: string;

  @Property({ type: "uuid", name: "creator" })
  creatorId!: string;

  @Property({ type: "json", name: "players", nullable: false })
  players!: string[]; // User IDs for more than 2 players

  @Property({ type: () => TournamentStatus, default: TournamentStatus.OPEN })
  tournamentStatus!: TournamentStatus;

  @Property({})
  winnerId?: string;

  @Property({ type: () => TournamentSize })
  tournamentSize!: TournamentSize;

  @Property({ type: "int", default: 0, name: "number_of_rounds" })
  numOfRounds!: number;

  @Property({ type: "json", nullable: true })
  bracket?: any; // Tournament bracket structure stores the matches[]

  @Property({ type: "timestamptz", nullable: false, defaultRaw: "CURRENT_TIMESTAMP", name: "updated_at" })
  updatedAt?: Date;

  @Property({ type: "timestamptz", nullable: false, defaultRaw: "CURRENT_TIMESTAMP", name: "created_at" })
  createdAt?: Date;
}