//src/modules/remote/remote.dtos.ts
import { Static, Type } from "@sinclair/typebox";
import { RemoteGame } from "./entities/remote.entity";

export const joinQueueDtoSchema = Type.Object(
	{playerId: Type.String({ format: "uuid" })},
	{ additionalProperties: false }
);

export const leaveQueueDtoSchema = Type.Object(
	{playerId: Type.String({ format: "uuid" })},
	{ additionalProperties: false }
);

export const findMatchesDtoSchema = Type.Object(
	{},
	{ additionalProperties: false }
);

// the player info that's exposed in matchesFound
export const matchPlayerDtoSchema = Type.Object(
	{
		playerId: Type.String({ format: "uuid" }),
		rating: Type.Number({ minimum: 0 }),
		status: Type.Union([
			Type.Literal('ONLINE'),
			Type.Literal('OFFLINE'),
			Type.Literal('IN_GAME')
		]),
		updatedAt: Type.String({ format: "date-time" })
	},
	{ additionalProperties: false}
);

// Individual match found
export const matchFoundDtoSchema = Type.Object(
	{
		matchId: Type.String(),
		player1: matchPlayerDtoSchema,
		player2: matchPlayerDtoSchema,
		scoreDifference: Type.Number({ minimum: 0 }),
		createdAt: Type.String({ format: "date-time" })
	}, 
	{ additionalProperties: false }
);

//completeMatch
export const matchResultDtoSchema = Type.Object({
    matchId: Type.String(), // Match your service!
    winnerId: Type.String({ format: "uuid" }),
    winnerScore: Type.Number({ minimum: 0 }),
    loserScore: Type.Number({ minimum: 0 }),
	createdAt: Type.String({ format: "date-time"})
}, { additionalProperties: false });

// TypeScript types derived from schemas
export type JoinQueueDto = Static<typeof joinQueueDtoSchema>;
export type LeaveQueueDto = Static<typeof leaveQueueDtoSchema>;
export type FindMatchesDto = Static<typeof findMatchesDtoSchema>;
export type MatchPlayerDto = Static<typeof matchPlayerDtoSchema>;
export type MatchFoundDto = Static<typeof matchFoundDtoSchema>;
export type MatchResultDto = Static<typeof matchResultDtoSchema>;