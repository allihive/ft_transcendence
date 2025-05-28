import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import { authModule } from "./modules/auth/auth.module";
import { userModule } from "./modules/user/user.module";
import { ErrorResponseDto } from "./shared/dto/error-response";
import { databaseModule } from "./shared/modules/database/database.module";
import { CryptoService } from "./shared/utils/CryptoService";

declare module "fastify" {
	interface FastifyInstance {
		cryptoService: CryptoService,
	}
}

export const createApp = async (opts: FastifyServerOptions): Promise<FastifyInstance> => {
	const app = Fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

	app.decorate("cryptoService", new CryptoService());

	// Register global modules
	await app.register(databaseModule);
	await app.register(cookie);

	await app.register(jwt, {
		secret: "hoangfin",
		cookie: {
			cookieName: "accessToken",
			signed: false
		}
	});

	await app.register(userModule, { cryptoService: app.cryptoService });
	await app.register(authModule, { userService: app.userService });

	app.setErrorHandler((error, request, reply) => {
		console.log("fastify.setErrorHandler():");
		request.log.error(error);

		const errorResponse: ErrorResponseDto = {
			statusCode: error.statusCode ?? 500,
			message: error.message ?? "Internal Server Error"
		};

		return reply.code(errorResponse.statusCode).send(errorResponse);
	});

	return app;
}

