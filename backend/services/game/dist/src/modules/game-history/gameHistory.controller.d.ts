import { FastifyRequest, FastifyReply } from 'fastify';
/**
 * RESTful API controller for GameHistory (Fastify)
 *
 * This controller handles HTTP requests and responses for game history operations.
 * This is the bridge between the frontend and the GameHistory service logic
 *
 * Key responsibilities:
 * - Validate incoming requests
 * - Call the appropriate service methods
 * - Handle errors
 * - Return consistent API responses
 */
export declare class GameHistoryController {
    private gameHistoryService;
    constructor();
    /**
     * GET /api/game-history/:playerId
     * Get game history for a specific player
     */
    getPlayerGameHistory(request: FastifyRequest<{
        Params: {
            playerId: string;
        };
        Querystring: {
            limit?: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    /**
     * POST /api/game-history/record
     * Record a completed match result
     */
    recordMatch(request: FastifyRequest<{
        Body: {
            matchId: string;
            winnerId: number;
            loserId: number;
            winnerScore: number;
            loserScore: number;
        };
    }>, reply: FastifyReply): Promise<never>;
    /**
     * GET /api/game-history/:playerId/stats
     * Get player statistics (if you implement getPlayerStats in your service)
     */
    getPlayerStats(request: FastifyRequest<{
        Params: {
            playerId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
//# sourceMappingURL=gameHistory.controller.d.ts.map