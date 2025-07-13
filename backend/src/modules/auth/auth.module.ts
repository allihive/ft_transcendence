import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { OAuth2Client } from "google-auth-library";
import { authController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

declare module "fastify" {
	interface FastifyInstance {
		authService: AuthService
	}
}

const authPlugin: FastifyPluginAsync = async (app, opts) => {
	const authRepository = new AuthRepository();
	const oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);
	const authService = new AuthService(authRepository, app.userService, oAuth2Client);

	app.decorate("authService", authService);

	await app.register(authController, opts);
};

export const authModule = fp(authPlugin, {
	name: "@transcendence/auth",
	dependencies: [
		"@fastify/cookie",
		"@fastify/jwt",
		"@transcendence/database",
		"@transcendence/user",
	]
});
