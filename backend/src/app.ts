import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import { ErrorResponseDto } from "./common/dto/error-response";
import { CryptoService } from "./common/utils/CryptoService";
import { cookieConfig } from "./config/cookie.config";
import { authModule } from "./modules/auth/auth.module";
import { databaseModule } from "./modules/database/database.module";
import { UserResponseDto } from "./modules/user/user.dto";
import { userModule } from "./modules/user/user.module";

declare module "fastify" {
	interface FastifyInstance {
		cryptoService: CryptoService,
	}
}

export const createApp = async (opts: FastifyServerOptions): Promise<FastifyInstance> => {
	const app = Fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

	await app.register(cookie, {
		secret: process.env.COOKIE_SECRET!,
		parseOptions: cookieConfig
	});

	await app.register(jwt, {
		secret: process.env.JWT_SECRET!,
		cookie: { cookieName: "accessToken", signed: true }
	});

	app.decorate("cryptoService", new CryptoService());

	await app.register(databaseModule);
	await app.register(userModule, { prefix: "/api/users" });
	await app.register(authModule, { prefix: "/api/auth" });

	app.addHook("onRequest", async (request, reply) => {
		try {
			await request.jwtVerify<UserResponseDto>();
		} catch (error) {
			console.log((error as Record<string, any>)?.message ?? "Unauthorized");
		}
	});

	app.setErrorHandler((error, request, reply) => {
		request.log.error(error);

		const errorResponse: ErrorResponseDto = {
			statusCode: error.statusCode ?? 500,
			code: error.code ?? "INTERNAL_SERVER_ERROR",
			message: error.message ?? "Something went wrong on our end. Please try again later."
		};

		return reply.code(errorResponse.statusCode).send(errorResponse);
	});

	return app;
}

