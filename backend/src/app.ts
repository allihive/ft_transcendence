import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyJWT from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { resolve } from "path";
import { authModule } from "./modules/auth/auth.module";
import { cookieConfig } from "./config/cookie.config";
import { CryptoService } from "./common/utils/CryptoService";
import { databaseModule } from "./modules/database/database.module";
import { ErrorResponseDto } from "./common/dto/error-response";
import { mediaModule } from "./modules/media/media.module";
import { userModule } from "./modules/user/user.module";
import { UserResponseTwoFactorAuthDto, UserResponseDto } from "./modules/user/user.dto";
import { existsSync, mkdirSync } from "fs";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { gameHistoryModule } from "./modules/gameHistory/gameHistory.module";
import { remoteGameModule } from "./modules/remote/remote.module";
import { statsModule } from "./modules/stats/stats.module";
import { getErrorResponseDto } from "./common/utils/getErrorResponseDto";

declare module "fastify" {
	interface FastifyInstance {
		cryptoService: CryptoService,
	}
}

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: UserResponseDto | UserResponseTwoFactorAuthDto;
		user: UserResponseDto;
	}
}

const installFastifyPlugins = async (app: FastifyInstance): Promise<void> => {
	await app.register(fastifyStatic, {
		root: resolve(process.env.UPLOAD_DIR!)
	});

	await app.register(fastifyMultipart, {
		limits: { fileSize: 4 * 1024 * 1024 } // 4MB limit
	});

	await app.register(fastifyCookie, {
		secret: process.env.COOKIE_SECRET!,
		parseOptions: cookieConfig
	});

	await app.register(fastifyJWT, {
		secret: process.env.JWT_SECRET!,
		cookie: { cookieName: "accessToken", signed: true }
	});
};

const decorateGlobal = async (app: FastifyInstance): Promise<void> => {
	app.decorate("cryptoService", new CryptoService());
}

const installPlugins = async (app: FastifyInstance): Promise<void> => {
	await app.register(databaseModule);
	await app.register(userModule, { prefix: "/api/users" });
	await app.register(authModule, { prefix: "/api/auth" });
	await app.register(statsModule, { prefix: "/api/stats"});
	await app.register(gameHistoryModule, { prefix: "/api/history"});
	await app.register(remoteGameModule, { prefix: "api/remote"})
	await app.register(mediaModule);
}

const registerHooks = async (app: FastifyInstance): Promise<void> => {
	const UPLOAD_PATH = resolve(process.env.UPLOAD_DIR!);

	app.addHook("onReady", async () => {
		if (!existsSync(UPLOAD_PATH)) {
			mkdirSync(UPLOAD_PATH, { recursive: true });
		}
	});

	app.addHook("onRequest", async (request, reply) => {
		try {
			await request.jwtVerify();
		} catch (error) {
			console.log((error as Record<string, any>)?.message ?? "Unauthorized");
		}
	});
}

export const createApp = async (opts: FastifyServerOptions): Promise<FastifyInstance> => {
	const app = Fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

	app.setErrorHandler((error, request, reply) => {
		request.log.error(error);
		const errorResponse = getErrorResponseDto(error);

		return reply
			.code(errorResponse.statusCode)
			.send(errorResponse);
	});

	await installFastifyPlugins(app);
	await decorateGlobal(app);
	await installPlugins(app);
	await registerHooks(app);

	return app;
}
