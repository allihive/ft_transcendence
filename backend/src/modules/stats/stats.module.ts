import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { statsController } from "./stats.controller";
import { StatsService } from "./stats.service";
import { UserStatsService } from "./services/user-stats.service";
import { UserStatsRepository } from "./repositories/user-stats.repository";

declare module "fastify" {
	interface FastifyInstance {
		statsService: StatsService
	}
}

//updated 21.7 to include userStateRepository
const statsPlugin: FastifyPluginAsync = async (app, opts) => {
	const userStatsRepository = new UserStatsRepository();
	const userStatsService = new UserStatsService(userStatsRepository);
	const statsService = new StatsService(userStatsService, userStatsRepository);

	app.decorate("statsService", statsService);

	await app.register(statsController, opts);
};

export const statsModule = fp(statsPlugin, {
	name: "@transcendence/stats",
	dependencies: ["@transcendence/auth"]
});
