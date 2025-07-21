import { EntityManager, MikroORM } from "@mikro-orm/core";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import mikroConfig from "../../../mikro-orm.config";

declare module "fastify" {
	interface FastifyRequest {
		entityManager: EntityManager
	}
	interface FastifyInstance {
		orm: MikroORM
	}
}

const databasePlugin: FastifyPluginAsync = async (app) => {
	const orm = await MikroORM.init(mikroConfig);

	// Register MikroORM instance for WebSocket connections
	app.decorate("orm", orm);

	app.decorateRequest("entityManager", {
		getter() {
			return orm.em.fork();
		}
	});

	app.addHook("onClose", async () => {
		await orm.close();
	});
};

export const databaseModule = fp(databasePlugin, { name: "@transcendence/database" });