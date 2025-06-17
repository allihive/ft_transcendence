"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//src/server.ts
const fastify_1 = __importDefault(require("fastify"));
const gameHistory_routes_1 = require("./modules/game-history/gameHistory.routes");
async function startServer() {
    const server = (0, fastify_1.default)();
    // Register CORS
    await server.register(require('@fastify/cors'), {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true
    });
    // Register your game history routes
    await server.register(gameHistory_routes_1.gameHistoryRoutes);
    server.get('/', async (request, reply) => {
        return 'Hello Hello?\n';
    });
    server.listen({ port: 3000 }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
}
// Start the server
startServer().catch(console.error);
//# sourceMappingURL=server.js.map