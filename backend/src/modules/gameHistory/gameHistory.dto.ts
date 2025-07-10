import { Static, Type } from "@sinclair/typebox";
import { GameHistory } from "./entities/gameHistory.entity";

// Params DTOs - updated to match UUID format
export const GetPlayerHistoryParamsSchema = Type.Object(
  { playerId: Type.String({ format: "uuid" }) },
  { additionalProperties: false }
);

export const GetPlayerStatsParamsSchema = Type.Object(
  { playerId: Type.String({ format: "uuid" }) },
  { additionalProperties: false }
);

// Query DTOs
export const GetPlayerHistoryQuerySchema = Type.Object(
  {
    limit: Type.Number({ default: 5, minimum: 1, maximum: 25 }),
    page: Type.Number({ default: 1, minimum: 1})
  },
  { additionalProperties: false }
);

// Body DTOs
export const CreateGameHistoryDtoSchema = Type.Object(
  {
    winnerId: Type.String({ format: "uuid" }),
    loserId: Type.String({ format: "uuid" }),
    winnerScore: Type.Number({ minimum: 0 }),
    loserScore: Type.Number({ minimum: 0 })
  },
  { additionalProperties: false }
);

// Response DTOs
export const PlayerGameResultDtoSchema = Type.Object(
  {
    // date: Type.String({ format: "date-time" }),
    opponent: Type.String({ format: "uuid" }),
    playerScore: Type.Number(),
    opponentScore: Type.Number(),
    result: Type.Union([Type.Literal('WIN'), Type.Literal('LOSS')])
  },
  { additionalProperties: false }
);

export const GameHistoryResponseDtoSchema = Type.Object(
  {
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Optional(Type.Object({
      playerId: Type.String({ format: "uuid" }),
      games: Type.Array(PlayerGameResultDtoSchema),
      count: Type.Number()
    }))
  },
  { additionalProperties: false }
);

export const RecordMatchResponseDtoSchema = Type.Object(
  {
    success: Type.Boolean(),
    message: Type.String(),
    data: Type.Optional(Type.Object({
      matchId: Type.String(),
      winnerId: Type.String({ format: "uuid" }),
      loserId: Type.String({ format: "uuid" }),
      winnerScore: Type.Number(),
      loserScore: Type.Number(),
      recordedAt: Type.String({ format: "date-time" })
    }))
  },
  { additionalProperties: false }
);

// Type exports (Static converts TypeBox schemas to TypeScript types)
export type GetPlayerHistoryParamsDto = Static<typeof GetPlayerHistoryParamsSchema>;
export type GetPlayerStatsParamsDto = Static<typeof GetPlayerStatsParamsSchema>;
export type GetPlayerHistoryQueryDto = Static<typeof GetPlayerHistoryQuerySchema>;
export type CreateGameHistoryDto = Static<typeof CreateGameHistoryDtoSchema>;
export type PlayerGameResultDto = Static<typeof PlayerGameResultDtoSchema>;
export type GameHistoryResponseDto = Static<typeof GameHistoryResponseDtoSchema>;
export type RecordMatchResponseDto = Static<typeof RecordMatchResponseDtoSchema>;

// Fastify validation schema exports (for controller compatibility)
export const GetPlayerHistoryParamsDtoSchema = GetPlayerHistoryParamsSchema;
export const GetPlayerStatsParamsDtoSchema = GetPlayerStatsParamsSchema;
export const GetPlayerHistoryQueryDtoSchema = GetPlayerHistoryQuerySchema;

// Helper function to convert entity to response DTO
export const getPlayerGameResultDto = (
  game: GameHistory, 
  playerId: string
): PlayerGameResultDto => {
  const playerWon = game.winnerId === playerId;
  const opponent = playerWon ? game.loserId : game.winnerId;
  const playerScore = playerWon ? game.winnerScore : game.loserScore;
  const opponentScore = playerWon ? game.loserScore : game.winnerScore;
  // const date = game.createdAt!.toISOString();

  return {
    // date,
    opponent,
    playerScore,
    opponentScore,
    result: playerWon ? 'WIN' : 'LOSS'
  };
};