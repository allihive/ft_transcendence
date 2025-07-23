import { Static, Type } from "@sinclair/typebox";
import { UserStats } from "../entities/user-stats.entity";

export const GetUserStatsParamsDtoSchema = Type.Object(
	{ userId: Type.String({ format: "uuid" })},
	{ additionalProperties: false }
);

export const UpsertUserStatsDtoSchema = Type.Object(
	{
		userId: Type.String({ format: "uuid" }),
		won: Type.Boolean({ default: false })
	},
	{ additionalProperties: false }
);

export const UpdateUserStatsDtoSchema = Type.Object(
	{
		matchesPlayed: Type.Optional(Type.Number({ minimum: 0 })),
		matchesWon: Type.Optional(Type.Number({ minimum: 0 })),
		matchesLost: Type.Optional(Type.Number({ minimum: 0 })),
		winRate: Type.Optional(Type.Number({ minimum: 0, multipleOf: 0.01 }))
	},
	{ additionalProperties: false }
);

export const UpdateUserRatingDtoSchema = Type.Object(
	{
		rating: Type.Number({})
	},
	{ additionalProperties: false }
)

export const UserStatsResponseDtoSchema = Type.Object(
	{
		userId: Type.String({ format: "uuid" }),
		matchesPlayed: Type.Number({ minimum: 0 }),
		matchesWon: Type.Number({ minimum: 0 }),
		matchesLost: Type.Number({ minimum: 0 }),
		winRate: Type.Number({ minimum: 0, multipleOf: 0.01 }),
		rating: Type.Number({ minimum: 0 }) //added 21.7
	},
	{ additionalProperties: false }
);
//added 21.7
export const MatchResultDtoSchema = Type.Object({
	winnerId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
	loserId: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
	winnerScore: Type.Number({ minimum: 0, maximum: 5 }),
	loserScore: Type.Number({ minimum: 0, maximum: 5 })
}, { additionalProperties: false });

export type UpdateUserStatsDto = Static<typeof UpdateUserStatsDtoSchema>;
export type UserStatsResponseDto = Static<typeof UserStatsResponseDtoSchema>;
export type GetUserStatsParamsDto = Static<typeof GetUserStatsParamsDtoSchema>;
export type UpsertUserStatsDto = Static<typeof UpsertUserStatsDtoSchema>;
export type UpdateUserRatingDto = Static<typeof UpdateUserRatingDtoSchema>;
export type MatchResultDto = Static<typeof MatchResultDtoSchema>

export const getUserStatsResponseDto = (userStats: UserStats): UserStatsResponseDto => ({
	userId: userStats.userId,
	matchesPlayed: userStats.matchesPlayed,
	matchesWon: userStats.matchesWon,
	matchesLost: userStats.matchesLost,
	winRate: userStats.winRate,
	rating: userStats.rating //added 21.7
});
