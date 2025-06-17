"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHistoryController = void 0;
const gameHistory_service_1 = require("./gameHistory.service");
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
class GameHistoryController {
    constructor() {
        this.gameHistoryService = new gameHistory_service_1.GameHistoryService();
    }
    /**
     * GET /api/game-history/:playerId
     * Get game history for a specific player
     */
    async getPlayerGameHistory(request, reply) {
        try {
            // Validate and parse parameters
            const playerId = parseInt(request.params.playerId);
            const limit = request.query.limit ? parseInt(request.query.limit) : 5;
            // Validate playerId is a valid number
            if (isNaN(playerId) || playerId <= 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid player ID. Must be a positive number.',
                    data: null
                });
            }
            // Validate limit is reasonable
            if (limit && (isNaN(limit) || limit <= 0 || limit > 100)) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid limit. Must be between 1 and 100.',
                    data: null
                });
            }
            // Call service method
            const gameHistory = await this.gameHistoryService.getPlayerGameHistory(playerId, limit);
            // Return successful response
            return reply.status(200).send({
                success: true,
                message: `Retrieved ${gameHistory.length} games for player ${playerId}`,
                data: {
                    playerId,
                    games: gameHistory,
                    count: gameHistory.length
                }
            });
        }
        catch (error) {
            console.error('Error in getPlayerGameHistory controller:', error);
            return reply.status(500).send({
                success: false,
                message: 'Failed to retrieve game history',
                data: null
            });
        }
    }
    /**
     * POST /api/game-history/record
     * Record a completed match result
     */
    async recordMatch(request, reply) {
        try {
            const { matchId, winnerId, loserId, winnerScore, loserScore } = request.body;
            // Validate required fields
            if (!matchId || !winnerId || !loserId || winnerScore === undefined || loserScore === undefined) {
                return reply.status(400).send({
                    success: false,
                    message: 'Missing required fields: matchId, winnerId, loserId, winnerScore, loserScore',
                    data: null
                });
            }
            // Validate data types and values
            if (typeof matchId !== 'string' || matchId.trim() === '') {
                return reply.status(400).send({
                    success: false,
                    message: 'matchId must be a non-empty string',
                    data: null
                });
            }
            if (!Number.isInteger(winnerId) || !Number.isInteger(loserId) || winnerId <= 0 || loserId <= 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'winnerId and loserId must be positive integers',
                    data: null
                });
            }
            if (winnerId === loserId) {
                return reply.status(400).send({
                    success: false,
                    message: 'winnerId and loserId cannot be the same',
                    data: null
                });
            }
            if (!Number.isInteger(winnerScore) || !Number.isInteger(loserScore) || winnerScore < 0 || loserScore < 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'Scores must be non-negative integers',
                    data: null
                });
            }
            if (winnerScore <= loserScore) {
                return reply.status(400).send({
                    success: false,
                    message: 'Winner score must be higher than loser score',
                    data: null
                });
            }
            // Call service method
            await this.gameHistoryService.recordMatch(matchId, winnerId, loserId, winnerScore, loserScore);
            // Return successful response
            return reply.status(201).send({
                success: true,
                message: `Match ${matchId} recorded successfully`,
                data: {
                    matchId,
                    winnerId,
                    loserId,
                    winnerScore,
                    loserScore,
                    recordedAt: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error('Error in recordMatch controller:', error);
            // Check if it's a duplicate match error (you might want to handle this in your service)
            if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
                return reply.status(409).send({
                    success: false,
                    message: 'Match with this ID has already been recorded',
                    data: null
                });
            }
            return reply.status(500).send({
                success: false,
                message: 'Failed to record match result',
                data: null
            });
        }
    }
    /**
     * GET /api/game-history/:playerId/stats
     * Get player statistics (if you implement getPlayerStats in your service)
     */
    async getPlayerStats(request, reply) {
        try {
            const playerId = parseInt(request.params.playerId);
            if (isNaN(playerId) || playerId <= 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid player ID. Must be a positive number.',
                    data: null
                });
            }
            // Note: You'll need to add getPlayerStats method to your GameHistoryService
            // const stats = await this.gameHistoryService.getPlayerStats(playerId);
            // For now, return a placeholder response
            return reply.status(501).send({
                success: false,
                message: 'Player stats endpoint not yet implemented',
                data: null
            });
        }
        catch (error) {
            console.error('Error in getPlayerStats controller:', error);
            return reply.status(500).send({
                success: false,
                message: 'Failed to retrieve player statistics',
                data: null
            });
        }
    }
}
exports.GameHistoryController = GameHistoryController;
//# sourceMappingURL=gameHistory.controller.js.map