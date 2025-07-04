import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { join, resolve } from "path";
import { authModule } from "./modules/auth/auth.module";
import { cookieConfig } from "./config/cookie.config";
import { CryptoService } from "./common/utils/CryptoService";
import { databaseModule } from "./modules/database/database.module";
import { ErrorResponseDto } from "./common/dto/error-response";
import { mediaModule } from "./modules/media/media.module";
import { userModule } from "./modules/user/user.module";
import { UserResponseDto } from "./modules/user/user.dto";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { existsSync, mkdirSync } from "fs";

declare module "fastify" {
	interface FastifyInstance {
		cryptoService: CryptoService,
	}
}

export const createApp = async (opts: FastifyServerOptions): Promise<FastifyInstance> => {
	const app = Fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

	const UPLOAD_PATH = resolve(process.env.UPLOAD_DIR!);
	console.log(UPLOAD_PATH);

	await app.register(fastifyStatic, { root: UPLOAD_PATH });

	await app.register(fastifyMultipart, {
		limits: { fileSize: 4 * 1024 * 1024	} // 4MB limit
	});

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
	await app.register(mediaModule);

	app.addHook("onReady", () => {
		if (!existsSync(UPLOAD_PATH)) {
			mkdirSync(UPLOAD_PATH, { recursive: true });
		}
	});

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

