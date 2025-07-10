// src/modules/gameHistory/gameHistory.module.ts
import fp from "fastify-plugin";
import { FastifyPluginAsync, RegisterOptions } from "fastify";
import { gameHistoryController } from "./gameHistory.controller";
import { GameHistoryService } from "./gameHistory.service";
import { GameHistoryRepository } from "./gameHistory.repository";

declare module "fastify" {
	interface FastifyInstance {
		gameHistoryService: GameHistoryService;
	}
}

const gameHistoryPlugin: FastifyPluginAsync<RegisterOptions> = async (app, opts) => {
	const gameHistoryService = new GameHistoryService(new GameHistoryRepository());
	app.decorate("gameHistoryService", gameHistoryService);
	await app.register(gameHistoryController, opts);
};

export const gameHistoryModule = fp(gameHistoryPlugin, {
	name: "@transcendence/gameHistory",
	dependencies: ["@transcendence/database"],
	decorators: {
		request: ["entityManager"]
	}
});
