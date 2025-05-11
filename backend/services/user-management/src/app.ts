import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { authModule } from "./modules/auth/auth.module";
import { userModule } from "./modules/user/user.module";

export const createApp = async (opts: FastifyServerOptions): Promise<FastifyInstance> => {
	const app = Fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

	// Register all modules
	await app.register(authModule, { prefix: "/api/auth" });
	await app.register(userModule, { prefix: "/api/users" });

	return app;
}

