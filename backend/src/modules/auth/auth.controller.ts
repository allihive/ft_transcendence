import { FastifyPluginAsync } from "fastify";
import { CreateUserDto, CreateUserDtoSchema, getUserResponseDto } from "../user/user.dto";
import { GoogleLoginDto, GoogleLoginDtoSchema, LoginDto, LoginDtoSchema, LogoutParamsDto, LogoutParamsDtoSchema } from "./auth.dto";

export const authController: FastifyPluginAsync = async (app) => {
	app.post("/login", {
		schema: { body: LoginDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const user = await app.authService.login(em, request.body as LoginDto);
			const userResponseDto = getUserResponseDto(user);
			const token = app.jwt.sign(userResponseDto);

			return reply
				.setCookie("accessToken", token)
				.code(200)
				.send(userResponseDto);
		}
	});

	app.post("/google", {
		schema: { body: GoogleLoginDtoSchema },
		handler: async (request, reply) => {
			const { idToken } = request.body as GoogleLoginDto;
			const em = request.entityManager;
			const user = await app.authService.loginWithGoogle(em, idToken);
			const userResponseDto = getUserResponseDto(user);
			const token = app.jwt.sign(userResponseDto);

			return reply
				.setCookie("accessToken", token)
				.code(200)
				.send(userResponseDto);
		}
	});

	app.post("/register", {
		schema: { body: CreateUserDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const user = await app.authService.register(em, request.body as CreateUserDto);
			const userResponseDto = getUserResponseDto(user);
			const token = app.jwt.sign(userResponseDto);

			return reply
				.setCookie("accessToken", token)
				.code(201)
				.send(userResponseDto);
		}
	});

	app.post("/logout", {
		schema: { params: LogoutParamsDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { id } = request.params as LogoutParamsDto;
			await app.authService.logout(em, id);
			return reply.code(201).send();
		}
	});
};
