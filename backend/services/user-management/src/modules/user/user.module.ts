import { FastifyPluginAsync } from "fastify";
import { userController } from "./user.controller";

export const userModule: FastifyPluginAsync = async (app) => {
	await app.register(userController);
};