import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { mediaController } from "./media.controller";

const mediaPlugin: FastifyPluginAsync = async (app, opts) => {
	await app.register(mediaController, opts);
};

export const mediaModule = fp(mediaPlugin, {
	name: "@transcendence/media",
	dependencies: [
		"@fastify/static",
		"@fastify/multipart"
	]
});
