import fp from "fastify-plugin";
import { FastifyPluginAsync, RegisterOptions } from "fastify";
import { remoteGameController } from "./remote.controller";
import { RemoteGameService } from "./remote.service";
import { RemoteGameRepository } from "./remote.repository";

declare module "fastify" {
	interface FastifyInstance {
		remoteGameService: RemoteGameService;
	}
}

const remoteGamePlugin: FastifyPluginAsync<RegisterOptions> = async (app, opts) => {
	const remoteGameService = new RemoteGameService(new RemoteGameRepository());
	app.decorate("remoteGameService", remoteGameService);
	await app.register(remoteGameController, opts);
};

export const remoteGameModule = fp(remoteGamePlugin, {
	name: "@transcendence/remote",
	dependencies: ["@transcendence/database"],
	decorators: {
		request: ["entityManager"]
	}
});