import { FastifyPluginAsync } from "fastify";
import { BadRequestException } from "../../common/exceptions/BadRequestException";
import { ForbiddenException } from "../../common/exceptions/ForbiddenException";
import { cookieConfig } from "../../config/cookie.config";
import { CreateUserDto, CreateUserDtoSchema, getUserResponseDto, UserResponseTwoFactorAuthDto } from "../user/user.dto";
import {
	GoogleLoginDto,
	GoogleLoginDtoSchema,
	LoginDto,
	LoginDtoSchema
} from "./auth.dto";

export const authController: FastifyPluginAsync = async (app) => {
	app.get("/whoami", {
		onRequest: async (request, reply) => {
			if (!request.user) {
				return reply.code(200).send({
					user: null,
					...(request.jwtTokenExpiredError ? { message: "Your session has timed out" } : {})
				});
			}
		},
		handler: async (request, reply) => {
			const em = request.entityManager;
			const user = await app.userService.findUser(em, { id: request.user.id });

			if (!user) {
				return reply.code(200).send({ user: request.user });
			}

			const payload = getUserResponseDto(user);
			const token = app.jwt.sign(payload);

			return reply
				.setCookie("accessToken", token)
				.code(200)
				.send({ user: payload });
		}
	});

	app.post("/login/password", {
		schema: { body: LoginDtoSchema },
		handler: async (request, reply) => {
			const { email, password, verifyOnly } = request.body as LoginDto;

			if (request.user && !verifyOnly) {
				throw new BadRequestException("Authenticated user can't login again");
			}

			const em = request.entityManager;
			const user = await app.authService.login(em, email, password);

			if (!user) {
				return reply.code(204).send();
			}

			if (verifyOnly) {
				return reply.code(200).send(getUserResponseDto(user));
			}

			if (user.isTwoFactorEnabled) {
				const payload: UserResponseTwoFactorAuthDto = { id: user.id, twoFactorAuthRequired: true };
				const token = app.jwt.sign(payload, { expiresIn: "5m" });

				return reply
					.setCookie("twoFactorAuthToken", token, { maxAge: 1000 * 60 * 5 })
					.code(200)
					.send(payload);
			}

			const payload = getUserResponseDto(user);
			const token = app.jwt.sign(payload);

			return reply
				.setCookie("accessToken", token)
				.code(200)
				.send(payload);
		}
	});

	app.post("/login/google", {
		schema: { body: GoogleLoginDtoSchema },
		handler: async (request, reply) => {
			const { idToken, verifyOnly } = request.body as GoogleLoginDto;

			if (request.user && !verifyOnly) {
				throw new BadRequestException("Authenticated user can't login again");
			}

			const em = request.entityManager;
			const user = await app.authService.loginWithGoogle(em, idToken);
			const payload = getUserResponseDto(user);

			if (verifyOnly) {
				return reply.code(200).send(payload);
			}

			const token = app.jwt.sign(payload);

			return reply
				.setCookie("accessToken", token)
				.code(200)
				.send(payload);
		}
	});

	app.post("/register", {
		schema: { body: CreateUserDtoSchema },
		handler: async (request, reply) => {
			if (request.user) {
				throw new ForbiddenException("Authenticated user can't register again");
			}

			const em = request.entityManager;
			const user = await app.authService.register(em, request.body as CreateUserDto);
			const payload = getUserResponseDto(user);
			const token = app.jwt.sign(payload);

			return reply
				.setCookie("accessToken", token)
				.code(201)
				.send(payload);
		}
	});

	app.post("/logout", async (request, reply) => {
		return reply
			.clearCookie("accessToken", cookieConfig)
			.code(204)
			.send();
	});
};
