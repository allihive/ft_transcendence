import { FastifyPluginAsync } from "fastify";

export const appController: FastifyPluginAsync = async (app) => {
	app.get("/health", async (request, reply) => {
		const em = request.entityManager;
		await em.getConnection().execute("SELECT 1");

		return reply
			.code(200)
			.send({
				status: "ok",
				server: "up",
				database: "connected",
			});
	});
};
