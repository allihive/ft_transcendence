import { FastifyPluginAsync } from "fastify";
import { authController } from "./auth.controller";

export const authModule: FastifyPluginAsync = async (app) => {
	await app.register(authController);
}