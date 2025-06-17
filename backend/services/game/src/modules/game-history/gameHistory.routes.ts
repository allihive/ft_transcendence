import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { GameHistoryController } from './gameHistory.controller';

/**
 * Game History Routes Plugin
 * 
 * Registers all game history related routes with the Fastify instance.
 * This plugin defines the API endpoints and connects them to the controller methods.
 */
export async function gameHistoryRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Initialize the controller
  const gameHistoryController = new GameHistoryController();

  // Route schemas for validation and documentation
  const getPlayerHistorySchema = {
    params: {
      type: 'object',
      properties: {
        playerId: { type: 'string', pattern: '^[1-9][0-9]*$' }
      },
      required: ['playerId']
    },
    querystring: {
      type: 'object',
      properties: {
        limit: { type: 'string', pattern: '^[1-9][0-9]*$' }
      }
    }
  };

  const recordMatchSchema = {
    body: {
      type: 'object',
      properties: {
        matchId: { type: 'string', minLength: 1 },
        winnerId: { type: 'integer', minimum: 1 },
        loserId: { type: 'integer', minimum: 1 },
        winnerScore: { type: 'integer', minimum: 0 },
        loserScore: { type: 'integer', minimum: 0 }
      },
      required: ['matchId', 'winnerId', 'loserId', 'winnerScore', 'loserScore']
    }
  };

  const getPlayerStatsSchema = {
    params: {
      type: 'object',
      properties: {
        playerId: { type: 'string', pattern: '^[1-9][0-9]*$' }
      },
      required: ['playerId']
    }
  };

  /**
   * GET /api/game-history/:playerId
   * Retrieve game history for a specific player
   */
  fastify.get<{
    Params: { playerId: string };
    Querystring: { limit?: string };
  }>(
    '/api/game-history/:playerId',
    {
      schema: getPlayerHistorySchema,
      preHandler: async (request, reply) => {
        // Optional: Add authentication/authorization middleware here
        // Example: await fastify.authenticate(request, reply);
      }
    },
    async (request, reply) => {
      return gameHistoryController.getPlayerGameHistory(request, reply);
    }
  );

  /**
   * POST /api/game-history/record
   * Record a new match result
   */
  fastify.post<{
    Body: {
      matchId: string;
      winnerId: number;
      loserId: number;
      winnerScore: number;
      loserScore: number;
    };
  }>(
    '/api/game-history/record',
    {
      schema: recordMatchSchema,
      preHandler: async (request, reply) => {
        // Optional: Add authentication/authorization middleware here
        // Example: await fastify.authenticate(request, reply);
      }
    },
    async (request, reply) => {
      return gameHistoryController.recordMatch(request, reply);
    }
  );

  /**
   * GET /api/game-history/:playerId/stats
   * Get player statistics
   */
  fastify.get<{
    Params: { playerId: string };
  }>(
    '/api/game-history/:playerId/stats',
    {
      schema: getPlayerStatsSchema,
      preHandler: async (request, reply) => {
        // Optional: Add authentication/authorization middleware here
        // Example: await fastify.authenticate(request, reply);
      }
    },
    async (request, reply) => {
      return gameHistoryController.getPlayerStats(request, reply);
    }
  );

  /**
   * Optional: Add a health check endpoint for the game history service
   */
  fastify.get('/api/game-history/health', async (request, reply) => {
    return reply.status(200).send({
      success: true,
      message: 'Game History service is healthy',
      timestamp: new Date().toISOString()
    });
  });
}

// Export as default for easier importing
export default gameHistoryRoutes;