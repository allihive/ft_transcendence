import { FastifyRequest, FastifyReply } from 'fastify';
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
export declare class MatchmakingController {
    private matchmakingService;
    constructor();
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
    joinQueue(request: FastifyRequest, reply: FastifyReply): Promise<void>;
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
    leaveQueue(request: FastifyRequest, reply: FastifyReply): Promise<void>;
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
    getQueueStatus(request: FastifyRequest, reply: FastifyReply): Promise<void>;
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
    completeMatch(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
export declare const matchmakingController: MatchmakingController;
//# sourceMappingURL=matchmaking.controller.d.ts.map