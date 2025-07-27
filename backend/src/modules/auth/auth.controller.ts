import { FastifyPluginAsync } from "fastify";
import { BadRequestException } from "../../common/exceptions/BadRequestException";
import { ForbiddenException } from "../../common/exceptions/ForbiddenException";
import { UnauthorizedException } from "../../common/exceptions/UnauthorizedException";
import { cookieConfig } from "../../config/cookie.config";
import { CreateUserDto, CreateUserDtoSchema, getUserResponseDto, UserResponseTwoFactorAuthDto, UserResponseDto} from "../user/user.dto";
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
				return reply.code(204).send();
			}
		},
		handler: async (request, reply) => {
			const em = request.entityManager;
			const user = await app.userService.findUser(em, { id: request.user.id });

			if (!user) {
				return reply.code(204).send();
			}

			const payload = getUserResponseDto(user);
			const token = app.jwt.sign(payload);

			return reply
				.setCookie("accessToken", token)
				.code(200)
				.send(payload);
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
			const token = app.jwt.sign(payload, { expiresIn: "1h" });

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

	app.post("/logout", {
		handler: async (request, reply) => {
			if (!request.user) {
				throw new BadRequestException("You haven't signed in yet");
			}

			return reply
				.clearCookie("accessToken", cookieConfig)
				.code(204)
				.send();
		}
	});

// WebSocket dedicated api for sending signed token
	app.get('/ws-token', {
		handler: async (request, reply) => {
			try {
				if (!request.user) {
					throw new UnauthorizedException("Unauthorized user is not allowed");
				}
				const user = request.user as UserResponseDto;
				const wsPayload = {
					...user,
					avatarUrl: user.avatarUrl ? Buffer.from(user.avatarUrl).toString('base64') : undefined
				};

				const wsToken = app.jwt.sign(wsPayload, { expiresIn: "1h" });
				return reply.send({ accessToken: wsToken });
			} catch (error) {
				console.error('JWT verification failed:', error);
				return reply.code(401).send({ error: 'Invalid token' });
			}
		}
	});
};


