// src/modules/tournament/tournament.module.ts
import fp from "fastify-plugin";
import { FastifyPluginAsync, RegisterOptions } from "fastify";
import { tournamentGameController } from "./tournament.controller";
import { TournamentGameService } from "./tournament.service";
import { TournamentGameRepository } from "./tournament.repository";

declare module "fastify" {
	interface FastifyInstance {
		tournamentGameService: TournamentGameService;
	}
}

const tournamentGamePlugin: FastifyPluginAsync<RegisterOptions> = async (app, opts) => {
	const tournamentGameRepository = new TournamentGameRepository();
	const gameHistoryService = app.gameHistoryService; // Assumes gameHistoryService is decorated on app
	const tournamentGameService = new TournamentGameService(tournamentGameRepository, gameHistoryService);
	app.decorate("tournamentGameService", tournamentGameService);
	await app.register(tournamentGameController, opts);
};

export const tournamentGameModule = fp(tournamentGamePlugin, {
	name: "@transcendence/remote",
	dependencies: ["@transcendence/database"],
	decorators: {
		request: ["entityManager"]
	}
});