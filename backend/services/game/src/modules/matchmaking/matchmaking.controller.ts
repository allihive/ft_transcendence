// src/modules/matchmaking/matchmaking.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { MatchmakingService } from './matchmaking.service';

/**
 * RESTful API Controller for Matchmaking (Fastify)
 * 
 * This controller handles HTTP requests and responses for matchmaking operations.
 * It acts as a bridge between the frontend and the MatchmakingService business logic.
 * 
 * Key responsibilities:
 * 1. Validate incoming requests
 * 2. Call appropriate service methods
 * 3. Handle errors gracefully
 * 4. Return consistent API responses
 */
export class MatchmakingController {
  private matchmakingService: MatchmakingService;

  constructor() {
    this.matchmakingService = new MatchmakingService();
  }

  /**
   * POST /api/matchmaking/join
   * 
   * Endpoint to add a player to the matchmaking queue
   * 
   * Request Body:
   * {
   *   "playerId": 123
   * }
   * 
   * Success Response (200):
   * {
   *   "success": true,
   *   "message": "Successfully joined matchmaking queue",
   *   "data": {
   *     "playerId": 123,
   *     "queuePosition": 5,
   *     "estimatedWaitTime": "30 seconds"
   *   }
   * }
   * 
   * Error Response (400/500):
   * {
   *   "success": false,
   *   "message": "Error description",
   *   "error": "Detailed error info"
   * }
   */
  async joinQueue(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // 1. Validate request body
      const body = request.body as { playerId?: number };
      const { playerId } = body;
      
      if (!playerId || typeof playerId !== 'number') {
        return reply.status(400).send({
          success: false,
          message: 'Invalid request: playerId is required and must be a number',
          error: 'INVALID_PLAYER_ID'
        });
      }

      // 2. Call the service method
      await this.matchmakingService.joinQueue(playerId);

      // 3. Return success response
      return reply.status(200).send({
        success: true,
        message: 'Successfully joined matchmaking queue',
        data: {
          playerId: playerId,
          status: 'QUEUED',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      // 4. Handle errors gracefully
      console.error('Error in joinQueue controller:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to join matchmaking queue',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/matchmaking/leave
   * 
   * Endpoint to remove a player from the matchmaking queue
   * 
   * Request Body:
   * {
   *   "playerId": 123
   * }
   * 
   * Success Response (200):
   * {
   *   "success": true,
   *   "message": "Successfully left matchmaking queue",
   *   "data": {
   *     "playerId": 123,
   *     "status": "LEFT_QUEUE"
   *   }
   * }
   */
  async leaveQueue(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // 1. Validate request body
      const body = request.body as { playerId?: number };
      const { playerId } = body;
      
      if (!playerId || typeof playerId !== 'number') {
        return reply.status(400).send({
          success: false,
          message: 'Invalid request: playerId is required and must be a number',
          error: 'INVALID_PLAYER_ID'
        });
      }

      // 2. Call the service method
      await this.matchmakingService.leaveQueue(playerId);

      // 3. Return success response
      return reply.status(200).send({
        success: true,
        message: 'Successfully left matchmaking queue',
        data: {
          playerId: playerId,
          status: 'LEFT_QUEUE',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      // 4. Handle errors
      console.error('Error in leaveQueue controller:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to leave matchmaking queue',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/matchmaking/queue/status/:playerId
   * 
   * Get the current queue status for a specific player
   * 
   * Success Response (200):
   * {
   *   "success": true,
   *   "data": {
   *     "playerId": 123,
   *     "inQueue": true,
   *     "waitTime": 45000,
   *     "queueSize": 8
   *   }
   * }
   */
  async getQueueStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const params = request.params as { playerId: string };
      const playerId = parseInt(params.playerId);
      
      if (isNaN(playerId)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid player ID',
          error: 'INVALID_PLAYER_ID'
        });
      }

      // Note: You'd need to add this method to your MatchmakingService
      // const queueStatus = await this.matchmakingService.getPlayerQueueStatus(playerId);

      return reply.status(200).send({
        success: true,
        data: {
          playerId: playerId,
          inQueue: true, // This would come from the service
          waitTime: 45000, // milliseconds waiting
          queueSize: 8 // total players in queue
        }
      });

    } catch (error) {
      console.error('Error getting queue status:', error);
      
      return reply.status(500).send({
        success: false,
        message: 'Failed to get queue status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/matchmaking/match/complete
   * 
   * Complete a match and update player ratings
   * 
   * Request Body:
   * {
   *   "matchId": "match_1640995200000_x7k9m2p4q",
   *   "winnerId": 123,
   *   "winnerScore": 11,
   *   "loserScore": 9
   * }
   */
  async completeMatch(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const body = request.body as { 
        matchId?: string; 
        winnerId?: number; 
        winnerScore?: number; 
        loserScore?: number; 
      };
      const { matchId, winnerId, winnerScore, loserScore } = body;
      
      // Validate all required fields
      if (!matchId || !winnerId || winnerScore === undefined || loserScore === undefined) {
        return reply.status(400).send({
          success: false,
          message: 'Missing required fields: matchId, winnerId, winnerScore, loserScore',
          error: 'INVALID_REQUEST_BODY'
        });
      }

      if (typeof winnerId !== 'number' || typeof winnerScore !== 'number' || typeof loserScore !== 'number') {
        return reply.status(400).send({
          success: false,
          message: 'winnerId, winnerScore, and loserScore must be numbers',
          error: 'INVALID_DATA_TYPES'
        });
      }

      // Call the service method
      await this.matchmakingService.completeMatch(matchId, winnerId, winnerScore, loserScore);

      return reply.status(200).send({
        success: true,
        message: 'Match completed successfully',
        data: {
          matchId: matchId,
          winnerId: winnerId,
          completedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error completing match:', error);
      
      // Handle specific error types
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          success: false,
          message: 'Match not found',
          error: error.message
        });
      } else {
        return reply.status(500).send({
          success: false,
          message: 'Failed to complete match',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
}

// Export a singleton instance for use in routes
export const matchmakingController = new MatchmakingController();