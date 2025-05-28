import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { userController } from "./user.controller";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { UserControllerOptions, UserModuleOptions } from "./user.types";

declare module "fastify" {
	interface FastifyInstance {
		userService: UserService
	}
}

const userPlugin: FastifyPluginAsync<UserModuleOptions> = async (app, opts) => {
	const { cryptoService } = opts;
	const userService = new UserService(new UserRepository(), cryptoService);

	const userControllerOptions: UserControllerOptions = {
		prefix: "/api/users",
		userService
	};

	app.decorate("userService", userService);
	await app.register(userController, userControllerOptions);
};

export const userModule = fp(userPlugin, { name: "userModule" });