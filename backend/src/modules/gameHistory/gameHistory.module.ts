// src/modules/gameHistory/gameHistory.module.ts
import fp from "fastify-plugin";
import { FastifyPluginAsync, RegisterOptions } from "fastify";
import { gameHistoryController } from "./gameHistory.controller";
import { GameHistoryService } from "./gameHistory.service";

declare module "fastify" {
  interface FastifyInstance {
    gameHistoryService: typeof GameHistoryService;
  }
}

const gameHistoryPlugin: FastifyPluginAsync<RegisterOptions> = async (app, opts) => {
  // Decorate the service class itself, not an instance
  app.decorate("gameHistoryService", GameHistoryService);
  
  await app.register(gameHistoryController, opts);
};

export const gameHistoryModule = fp(gameHistoryPlugin, {
  name: "@transcendence/gameHistory",
  dependencies: ["@transcendence/database"],
  decorators: {
    request: ["entityManager"]
  }
});