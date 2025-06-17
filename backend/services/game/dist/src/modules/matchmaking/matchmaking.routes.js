"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchmakingRoutes = matchmakingRoutes;
const matchmaking_controller_1 = require("./matchmaking.controller");
/**
 * Matchmaking Routes Plugin
 *
 * This plugin registers all matchmaking-related routes with the Fastify instance.
 * It uses the controller methods to handle the actual request processing.
 */
async function matchmakingRoutes(fastify, options) {
    // Route: Join matchmaking queue
    fastify.post('/api/matchmaking/join', {
        schema: {
            body: {
                type: 'object',
                required: ['playerId'],
                properties: {
                    playerId: { type: 'number' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                playerId: { type: 'number' },
                                status: { type: 'string' },
                                timestamp: { type: 'string' }
                            }
                        }
                    }
                },
                400: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        error: { type: 'string' }
                    }
                }
            }
        },
        handler: matchmaking_controller_1.matchmakingController.joinQueue.bind(matchmaking_controller_1.matchmakingController)
    });
    // Route: Leave matchmaking queue
    fastify.delete('/api/matchmaking/leave', {
        schema: {
            body: {
                type: 'object',
                required: ['playerId'],
                properties: {
                    playerId: { type: 'number' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                playerId: { type: 'number' },
                                status: { type: 'string' },
                                timestamp: { type: 'string' }
                            }
                        }
                    }
                }
            }
        },
        handler: matchmaking_controller_1.matchmakingController.leaveQueue.bind(matchmaking_controller_1.matchmakingController)
    });
    // Route: Get queue status for a player
    fastify.get('/api/matchmaking/queue/status/:playerId', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    playerId: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                playerId: { type: 'number' },
                                inQueue: { type: 'boolean' },
                                waitTime: { type: 'number' },
                                queueSize: { type: 'number' }
                            }
                        }
                    }
                }
            }
        },
        handler: matchmaking_controller_1.matchmakingController.getQueueStatus.bind(matchmaking_controller_1.matchmakingController)
    });
    // Route: Complete a match
    fastify.post('/api/matchmaking/match/complete', {
        schema: {
            body: {
                type: 'object',
                required: ['matchId', 'winnerId', 'winnerScore', 'loserScore'],
                properties: {
                    matchId: { type: 'string' },
                    winnerId: { type: 'number' },
                    winnerScore: { type: 'number' },
                    loserScore: { type: 'number' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                matchId: { type: 'string' },
                                winnerId: { type: 'number' },
                                completedAt: { type: 'string' }
                            }
                        }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        error: { type: 'string' }
                    }
                }
            }
        },
        handler: matchmaking_controller_1.matchmakingController.completeMatch.bind(matchmaking_controller_1.matchmakingController)
    });
    // Optional: Health check route for matchmaking service
    fastify.get('/api/matchmaking/health', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        timestamp: { type: 'string' },
                        service: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            return reply.send({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'matchmaking'
            });
        }
    });
}
// Alternative export for easier registration
exports.default = matchmakingRoutes;
//# sourceMappingURL=matchmaking.routes.js.map