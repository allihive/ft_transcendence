// src/modules/gameHistory/gameHistory.controller.ts
import { FastifyPluginAsync } from "fastify";
import {
  RecordMatchDto,
  RecordMatchDtoSchema,
  GetPlayerHistoryParamsDto,
  GetPlayerHistoryParamsDtoSchema,
  GetPlayerHistoryQueryDto,
  GetPlayerHistoryQueryDtoSchema,
  GetPlayerStatsParamsDto,
  GetPlayerStatsParamsDtoSchema,
  GameHistoryResponseDto,
  RecordMatchResponseDto
} from './gameHistory.dto';

export const gameHistoryController: FastifyPluginAsync = async (app) => {

  app.get("/health", {
    handler: async (request, reply) => {
      return reply.code(200).send({
        success: true,
        message: 'Game History service is healthy',
        timestamp: new Date().toISOString(),
        service: 'game-history'
      });
    }
  });

  app.get("/recent", {
    handler: async (request, reply) => {
      const service = new app.gameHistoryService(request.entityManager);
      const query = request.query as any;

      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 10;

      if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid pagination parameters',
          data: undefined
        });
      }

      try {
        const matches = await service.getRecentMatches(page, limit);
        return reply.code(200).send({
          success: true,
          message: `Retrieved ${matches.length} recent matches`,
          data: {
            matches,
            page,
            limit,
            count: matches.length
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error in getRecentMatches controller:', error.message);
        } else {
          console.error('Unknown error in getRecentMatches controller:', error);
        }
        return reply.code(500).send({
          success: false,
          message: 'Failed to retrieve recent matches',
          data: undefined
        });
      }
    }
  });

  app.get("/:playerId", {
    schema: {
      params: GetPlayerHistoryParamsDtoSchema,
      querystring: GetPlayerHistoryQueryDtoSchema
    },
    handler: async (request, reply) => {
      const service = new app.gameHistoryService(request.entityManager);
      const { playerId } = request.params as GetPlayerHistoryParamsDto;
      const { limit = 5 } = request.query as GetPlayerHistoryQueryDto;

      try {
        const gameHistory = await service.getPlayerGameHistory(playerId, limit);
        const response: GameHistoryResponseDto = {
          success: true,
          message: `Retrieved ${gameHistory.length} games for player ${playerId}`,
          data: {
            playerId,
            games: gameHistory,
            count: gameHistory.length
          }
        };
        return reply.code(200).send(response);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error in getPlayerGameHistory controller:', error.message);
        } else {
          console.error('Unknown error in getPlayerGameHistory controller:', error);
        }
        const response: GameHistoryResponseDto = {
          success: false,
          message: 'Failed to retrieve game history',
          data: undefined
        };
        return reply.code(500).send(response);
      }
    }
  });

  app.get("/:playerId/stats", {
    schema: { params: GetPlayerStatsParamsDtoSchema },
    handler: async (request, reply) => {
      const service = new app.gameHistoryService(request.entityManager);
      const { playerId } = request.params as GetPlayerStatsParamsDto;

      try {
        const stats = await service.getPlayerStats(playerId);
        return reply.code(200).send({
          success: true,
          message: `Retrieved statistics for player ${playerId}`,
          data: {
            playerId,
            ...stats
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error in getPlayerStats controller:', error.message);
        } else {
          console.error('Unknown error in getPlayerStats controller:', error);
        }
        return reply.code(500).send({
          success: false,
          message: 'Failed to retrieve player statistics',
          data: undefined
        });
      }
    }
  });

  app.post("/record", {
    schema: { body: RecordMatchDtoSchema },
    handler: async (request, reply) => {
      const service = new app.gameHistoryService(request.entityManager);
      const recordMatchDto = request.body as RecordMatchDto;

      try {
        const gameHistory = await service.recordMatch(recordMatchDto);

        const response: RecordMatchResponseDto = {
          success: true,
          message: `Match ${recordMatchDto.matchId} recorded successfully`,
          data: {
            matchId: gameHistory.matchId,
            winnerId: gameHistory.winnerId,
            loserId: gameHistory.loserId,
            winnerScore: gameHistory.winnerScore,
            loserScore: gameHistory.loserScore,
            recordedAt: gameHistory.createdAt.toISOString()
          }
        };
        return reply.code(201).send(response);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error in recordMatch controller:', error.message);

          let statusCode = 500;
          let message = 'Failed to record match result';

          if (error.message.includes('already been recorded')) {
            statusCode = 409;
            message = 'Match with this ID has already been recorded';
          } else if (error.message.includes('Winner and loser cannot be the same')) {
            statusCode = 400;
            message = 'Winner and loser cannot be the same player';
          } else if (error.message.includes('Winner score must be higher')) {
            statusCode = 400;
            message = 'Winner score must be higher than loser score';
          }

          const response: RecordMatchResponseDto = {
            success: false,
            message,
            data: undefined
          };
          return reply.code(statusCode).send(response);
        } else {
          console.error('Unknown error in recordMatch controller:', error);
          return reply.code(500).send({
            success: false,
            message: 'Failed to record match result',
            data: undefined
          });
        }
      }
    }
  });
};