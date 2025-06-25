import { FastifyPluginAsync } from "fastify";
import { CreateUserDto, CreateUserDtoSchema, getUserResponseDto } from "../user/user.dto";
import { GoogleLoginDto, GoogleLoginDtoSchema, LoginDto, LoginDtoSchema } from "./auth.dto";
import { ForbiddenException } from "../../common/exceptions/ForbiddenException";
import { cookieConfig } from "../../config/cookie.config";
import { BadRequestException } from "../../common/exceptions/BadRequestException";

export const authController: FastifyPluginAsync = async (app) => {
	app.post("/login", {
		schema: { body: LoginDtoSchema },
		handler: async (request, reply) => {
			if (request.user) {
				throw new BadRequestException("You are already authenticated, please sign out first");
			}

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
			if (request.user) {
				throw new BadRequestException("You are already authenticated, please sign out first");
			}

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
			if (request.user) {
				throw new ForbiddenException("Authenticated user can not register again");
			}

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
		handler: async (request, reply) => {
			if (request.user) {
				return reply
					.clearCookie("accessToken", cookieConfig)
					.code(204)
					.send();
			}

			return reply.code(204).send();
		}
	});
};
