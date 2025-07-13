import { Static, Type } from "@sinclair/typebox";
import { UserStats } from "../entities/user-stats.entity";

export const GetUserStatsParamsDtoSchema = Type.Object(
	{ userId: Type.String({ format: "uuid" })},
	{ additionalProperties: false }
);

export const CreateUserStatsDtoSchema = Type.Object(
	{
		userId: Type.String({ format: "uuid" }),
		matchesPlayed: Type.Number({ minimum: 0 }),
		matchesWon: Type.Number({ minimum: 0 }),
		matchesLost: Type.Number({ minimum: 0 })
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

export const UserStatsResponseDtoSchema = Type.Object(
	{
		userId: Type.String({ format: "uuid" }),
		matchesPlayed: Type.Number({ minimum: 0 }),
		matchesWon: Type.Number({ minimum: 0 }),
		matchesLost: Type.Number({ minimum: 0 }),
		winRate: Type.Number({ minimum: 0, multipleOf: 0.01 })
	},
	{ additionalProperties: false }
);

export type UpdateUserStatsDto = Static<typeof UpdateUserStatsDtoSchema>;
export type UserStatsResponseDto = Static<typeof UserStatsResponseDtoSchema>;
export type GetUserStatsParamsDto = Static<typeof GetUserStatsParamsDtoSchema>;
export type CreateUserStatsDto = Static<typeof CreateUserStatsDtoSchema>;

export const getUserStatsResponseDto = (userStats: UserStats): UserStatsResponseDto => ({
	userId: userStats.userId,
	matchesPlayed: userStats.matchesPlayed,
	matchesWon: userStats.matchesWon,
	matchesLost: userStats.matchesLost,
	winRate: userStats.winRate
});
