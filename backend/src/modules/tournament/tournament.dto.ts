// src/modules/tournament/tournament.dto.ts
import { Static, Type } from "@sinclair/typebox";
import { TournamentStatus, TournamentSize } from "./entities/tournament.entity";

// Request DTOs
export const createTournamentDtoSchema = Type.Object({
  creatorId: Type.String({ format: "uuid" }),
  tournamentSize: Type.Enum(TournamentSize),
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 }))
}, { additionalProperties: false });

export const joinTournamentDtoSchema = Type.Object({
  tournamentId: Type.String({ format: "uuid" }),
  playerId: Type.String({ format: "uuid" })
}, { additionalProperties: false });

export const leaveTournamentDtoSchema = Type.Object({
  tournamentId: Type.String({ format: "uuid" }),
  playerId: Type.String({ format: "uuid" })
}, { additionalProperties: false });

export const startTournamentDtoSchema = Type.Object({
  tournamentId: Type.String({ format: "uuid" }),
  creatorId: Type.String({ format: "uuid" }) // Only creator can start
}, { additionalProperties: false });

// Record tournament results DTO
export const recordTournamentResultsSchema = Type.Object({
  winnerId: Type.String({ format: "uuid" }),
  creatorId: Type.String({ format: "uuid" }),
  tournamentSize: Type.Enum(TournamentSize),
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  matches: Type.Array(Type.Object({
    player1Id: Type.String({ format: "uuid" }),
    player2Id: Type.String({ format: "uuid" }),
    winnerId: Type.String({ format: "uuid" }),
    loserId: Type.String({ format: "uuid" }),
    winnerScore: Type.Number({ minimum: 0, maximum: 5 }),
    loserScore: Type.Number({ minimum: 0, maximum: 4 }),
    round: Type.Number({ minimum: 1 }),
    matchNumber: Type.Number({ minimum: 1 })
  }))
}, { additionalProperties: false });

// Query Parameters DTO
export const getTournamentDtoSchema = Type.Object({
  tournamentId: Type.String({ format: "uuid" })
}, { additionalProperties: false });

// Simple Response DTO
export const tournamentResponseDtoSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.Optional(Type.String()),
  creatorId: Type.String({ format: "uuid" }),
  players: Type.Array(Type.String({ format: "uuid" })), // Just player IDs
  tournamentStatus: Type.Enum(TournamentStatus),
  tournamentSize: Type.Enum(TournamentSize),
  winnerId: Type.Optional(Type.String({ format: "uuid" })),
  bracket: Type.Optional(Type.Any()), // Store final bracket if needed
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" })
}, { additionalProperties: false });

// TypeScript types derived from schemas
export type CreateTournamentDto = Static<typeof createTournamentDtoSchema>;
export type JoinTournamentDto = Static<typeof joinTournamentDtoSchema>;
export type LeaveTournamentDto = Static<typeof leaveTournamentDtoSchema>;
export type StartTournamentDto = Static<typeof startTournamentDtoSchema>;
export type RecordTournamentResultsDto = Static<typeof recordTournamentResultsSchema>;
export type GetTournamentDto = Static<typeof getTournamentDtoSchema>;
export type TournamentResponseDto = Static<typeof tournamentResponseDtoSchema>;