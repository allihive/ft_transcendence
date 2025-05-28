import { EntityManager, MikroORM } from "@mikro-orm/core";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import mikroConfig from "../../../../mikro-orm.config";

declare module "fastify" {
	interface FastifyRequest {
		entityManager: EntityManager
	}
}

const databasePlugin: FastifyPluginAsync = async (app) => {
	const orm = await MikroORM.init(mikroConfig);

	// Create request-scoped EntityManager instance with following benefits:
	// - Isolation: Ensures each request has its own identity map and won't interfere with other requests
	// - Safety: Prevents entities from being shared between requests
	// - Clean State: Each request starts with a fresh unit-of-work
	app.decorateRequest("entityManager", {
		getter() {
			return orm.em.fork();
		},
	});

	app.addHook("onClose", async () => {
		await orm.close();
	});
};

export const databaseModule = fp(databasePlugin, { name: "databaseModule" });