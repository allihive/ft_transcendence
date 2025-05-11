import { FastifyPluginAsync } from "fastify";
import { LoginDtoSchema, RegisterDtoSchema } from "./auth.dto";

export const authController: FastifyPluginAsync = async (app) => {
	app.post("/login", {
		schema: { body: LoginDtoSchema },
		handler: async (require, reply) => {
			// auth.service - > login()
		}
	});

	app.post("/register", {
		schema: { body: RegisterDtoSchema },
		handler: async (req, reply) => {
			// auth.service - > register()
		}
	});

	app.post("/logout", async (req, reply) => {
		// auth.service - > logout()
	});
};
