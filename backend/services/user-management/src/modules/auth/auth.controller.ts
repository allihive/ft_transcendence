import { FastifyPluginAsync } from "fastify";
import { LoginDtoSchema, LogoutParamsDto, LogoutParamsDtoSchema, RegisterDto, RegisterDtoSchema } from "./auth.dto";
import { AuthControllerOptions } from "./auth.types";

export const authController: FastifyPluginAsync<AuthControllerOptions> = async (app, opts) => {
	const { authService } = opts;

	app.post("/login", {
		schema: { body: LoginDtoSchema },
		handler: async (require, reply) => {
			// auth.service - > login()
		}
	});

	app.post("/register", {
		schema: { body: RegisterDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const user = await authService.register(em, request.body as RegisterDto);
			const token = app.jwt.sign(user);

			reply.setCookie("accessToken", token, {
				httpOnly: true,
				maxAge: 3 * 60 * 60
			});

			reply.code(201).send(user);
		}
	});

	app.post("/logout", {
		schema: { params: LogoutParamsDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { id } = request.params as LogoutParamsDto;
			await authService.logout(em, id);
			return reply.code(201).send();
		}
	});
};
