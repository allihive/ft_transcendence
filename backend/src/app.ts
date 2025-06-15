import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import { ErrorResponseDto } from "./common/dto/error-response";
import { databaseModule } from "./modules/database/database.module";
import { CryptoService } from "./common/utils/CryptoService";
import { userModule } from "./modules/user/user.module";
import { authModule } from "./modules/auth/auth.module";

declare module "fastify" {
	interface FastifyInstance {
		cryptoService: CryptoService,
	}
}

export const createApp = async (opts: FastifyServerOptions): Promise<FastifyInstance> => {
	const app = Fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

	app.decorate("cryptoService", new CryptoService());

	await app.register(cookie, {
		secret: process.env.COOKIE_SECRET!,
		parseOptions: {
			path: "/", // Available across the entire application
			signed: true, // Ensure integrity but avoid signing if unnecessary
			httpOnly: true, // Prevent client-side access for security
			secure: process.env.NODE_ENV === "production", // Enforce HTTPS in production
			sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Prevent CSRF attacks
			maxAge: 60 * 60 * 24 * 7 // 7 days expiration
		}
	});

	await app.register(jwt, {
		secret: process.env.JWT_SECRET!,
		cookie: { cookieName: "accessToken", signed: true }
	});

	await app.register(databaseModule);
	await app.register(userModule, { prefix: "/api/users" });
	await app.register(authModule, { prefix: "/api/auth" });

	// app.addHook("onRequest", (request, reply, done) => {
	// 	request.getDecorator();
	// 	reply.clearCookie();
	// 	done();
	// });

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

