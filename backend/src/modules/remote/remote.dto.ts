//src/modules/remote/remote.dtos.ts
import { Static, Type } from "@sinclair/typebox";
import { RemoteGame, Status } from "./entities/remote.entity";
// import { create } from "domain";

export const joinQueueDtoSchema = Type.Object(
	{ playerId: Type.String({ format: "uuid" }) },
	{ additionalProperties: false }
);

export const leaveQueueDtoSchema = Type.Object(
	{ playerId: Type.String({ format: "uuid" }) },
	{ additionalProperties: false }
);

export const createRemotePlayerDtoSchema = Type.Object(
	{ playerId: Type.String({ format: "uuid" }) },
	{ additionalProperties: false }
);

export const updateRemotePlayerDtoSchema = Type.Object({
	rating: Type.Optional(Type.Number({ minimum: 0 })),
	status: Type.Optional(Type.Enum(Status)), // Use the actual enum
	updatedAt: Type.Optional(Type.String({ format: "date-time" }))
});

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
	{ additionalProperties: false }
);

//completeMatch
export const matchResultDtoSchema = Type.Object({
	winnerId: Type.String({ format: "uuid" }),
	loserId: Type.String({ format: "uuid" }),
	winnerScore: Type.Number({ minimum: 0, maximum: 5 }),
	loserScore: Type.Number({ minimum: 0, maximum: 4 }),
}, { additionalProperties: false });

export const createMatchDtoSchema = Type.Object({
	playerId: Type.String({ format: "uuid" })
}, { additionalProperties: false });

export const matchInfoDtoSchema = Type.Object({
	matchId: Type.String({ format: "uuid" }),
	players: Type.Array(Type.Object({
		playerId: Type.String({ format: "uuid" }),
		rating: Type.Number({ minimum: 0 }),
		status: Type.Enum(Status)
	})),
	matchFoundAt: Type.String({ format: "date-time" })
}, { additionalProperties: false });

// Individual match found
// export const matchFoundDtoSchema = Type.Object(
// 	{
// 		id: Type.String({ format: "uuid" }),
// 		player1: matchPlayerDtoSchema,
// 		player2: matchPlayerDtoSchema,
// 		scoreDifference: Type.Number({ minimum: 0 }),
// 		createdAt: Type.String({ format: "date-time" })
// 	},
// 	{ additionalProperties: false }
// );

// export const findMatchesDtoSchema = Type.Object(
// 	{},
// 	{ additionalProperties: false }
// );

// TypeScript types derived from schemas
export type JoinQueueDto = Static<typeof joinQueueDtoSchema>;
export type LeaveQueueDto = Static<typeof leaveQueueDtoSchema>;
export type CreateRemotePlayerDto = Static<typeof createRemotePlayerDtoSchema>;
export type updateRemotePlayerDto = Static<typeof updateRemotePlayerDtoSchema>;
export type MatchResultDto = Static<typeof matchResultDtoSchema>;
export type CreateMatchDto = Static<typeof createMatchDtoSchema>;
export type MatchInfoDto = Static<typeof matchInfoDtoSchema>;
// export type MatchInfoResponseDto = Static<typeof MatchInfoResponseDtoSchema>;
// export type FindMatchesDto = Static<typeof findMatchesDtoSchema>;
// export type MatchPlayerDto = Static<typeof matchPlayerDtoSchema>;
// export type MatchFoundDto = Static<typeof matchFoundDtoSchema>;

export interface MatchInfo {
	matchId: string;
	player1: {
		playerId: string;
		rating: number;
		status: Status;
	};
	player2: {
		playerId: string;
		rating: number;
		status: Status;
	};
	matchFoundAt: Date;
}

// export const getMatchInfoResponseDto = (players: RemoteGame[], matchId: string): MatchInfoDto => ({
// 	matchId,
// 	players: players.map(player => ({
// 		playerId: player.playerId,
// 		rating: player.rating,
// 		status: player.status
// 	})),
// 	matchFoundAt: //not sure what to put here
// });

// export interface MatchInfo {
// 	matchId: string;
// 	player1: {
// 		playerId: string;
// 		rating: number;
// 		status: Status;
// 	};
// 	player2: {
// 		playerId: string;
// 		rating: number;
// 		status: Status;
// 	};
// 	ratingDifference: number;
// 	matchFoundAt: Date;
// 	createdAt: Date;
// }