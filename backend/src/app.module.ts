import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { appController } from "./app.controller";

const appPlugin: FastifyPluginAsync = async (app, opts) => {
	await app.register(appController, opts);
};

export const appModule = fp(appPlugin, {
	name: "@transcendence/app",
	dependencies: [
		"@fastify/cookie",
		"@fastify/jwt",
		"@transcendence/database",
		"@transcendence/user",
	]
});
