import fp from "fastify-plugin";
import { FastifyPluginAsync, RegisterOptions } from "fastify";
import { userController } from "./user.controller";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

declare module "fastify" {
	interface FastifyInstance {
		userService: UserService
	}
}

const userPlugin: FastifyPluginAsync<RegisterOptions> = async (app, opts) => {
	const userService = new UserService(new UserRepository(), app.cryptoService);
	app.decorate("userService", userService);
	await app.register(userController, opts);
};

export const userModule = fp(userPlugin, {
	name: "@transcendence/user",
	dependencies: ["@transcendence/database"],
	decorators: {
		fastify: ["cryptoService"],
		request: ["entityManager"]
	}
});