import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { authController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthControllerOptions, AuthModuleOptions } from "./auth.types";

declare module "fastify" {
	interface FastifyInstance {
		authService: AuthService
	}
}

const authPlugin: FastifyPluginAsync<AuthModuleOptions> = async (app, opts) => {
	const { userService } = opts;
	console.log(userService);
	const authService = new AuthService(userService);
	app.decorate("authService", authService);

	const authControllerOptions: AuthControllerOptions = {
		prefix: "/api/auth",
		authService
	};

	await app.register(authController, authControllerOptions);
};

export const authModule = fp(authPlugin, { name: "authModule" });