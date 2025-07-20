import { FastifyPluginAsync } from "fastify";
import { CreateUserDto, CreateUserDtoSchema, getUserResponseDto, UserResponseTwoFactorAuthDto } from "../user/user.dto";
import {
	GoogleLoginDto,
	GoogleLoginDtoSchema,
	LoginDto,
	LoginDtoSchema,
	SetupTwoFactorAuthResponseDto,
	VerifyTwoFactorAuthDto,
	VerifyTwoFactorAuthDtoSchema
} from "./auth.dto";
import { ForbiddenException } from "../../common/exceptions/ForbiddenException";
import { cookieConfig } from "../../config/cookie.config";
import { BadRequestException } from "../../common/exceptions/BadRequestException";
import { generateSecret } from "speakeasy";
import { UnauthorizedException } from "../../common/exceptions/UnauthorizedException";
import { toDataURL } from "qrcode";

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

	app.post("/verify/password", {
		schema: { body: LoginDtoSchema },
		handler: async (request, reply) => {
			const { email, password } = request.body as LoginDto;
			const em = request.entityManager;
			const user = await app.userService.findUserByCredentials(em, email, password);

			if (!user) {
				return reply.code(204).send();
			}

			const payload = getUserResponseDto(user);
			return reply.code(200).send(payload);
		}
	});

	app.post("/verify/google", {
		schema: { body: GoogleLoginDtoSchema },
		handler: async (request, reply) => {
			const { idToken } = request.body as GoogleLoginDto;
			const em = request.entityManager;
			const user = await app.authService.loginWithGoogle(em, idToken);
			const payload = getUserResponseDto(user);

			return reply.code(200).send(payload);
		}
	});

	app.post("/setup-2fa", async (request, reply) => {
		if (!request.user) {
			throw new UnauthorizedException("Unauthorized user is not allowed");
		}

		if (request.user.isTwoFactorEnabled) {
			throw new BadRequestException(`${request.user.username} has already enabled Two-factor authentication`);
		}

		const secret = generateSecret({
			name: "transcendence",
			issuer: "hoang.tran.fin@gmail.com"
		});

		await app.authService.setupTwoFactorAuth(request.entityManager, request.user.id, secret.base32);
		const qr = await toDataURL(secret.otpauth_url!);

		const payload: SetupTwoFactorAuthResponseDto = {
			message: "Scan the QR code with your authenticator app",
			qrCode: qr,
			secret: secret.base32
		};

		return reply.code(200).send(payload);
	});

	app.post("/verify/2fa", {
		schema: { body: VerifyTwoFactorAuthDtoSchema },
		handler: async (request, reply) => {
			if (request.user) {
				throw new BadRequestException("Missing Two-factor authentication token");
			}

			if (!request.cookies["twoFactorAuthToken"]) {
				throw new BadRequestException("Missing Two-factor authentication token");
			}

			const { id } = app.jwt.verify<UserResponseTwoFactorAuthDto>(request.cookies["twoFactorAuthToken"]);
			const { toptCode } = request.body as VerifyTwoFactorAuthDto;
			const em = request.entityManager;
			const user = await app.authService.verify(em, id, toptCode);

			if (!user) {
				return null;
			}

			const payload = getUserResponseDto(user);
			const token = app.jwt.sign(payload, { expiresIn: "1h" });

			return reply
				.setCookie("accessToken", token)
				.code(200)
				.send(payload);
		}
	});

	app.post("/login/password", {
		schema: { body: LoginDtoSchema },
		handler: async (request, reply) => {
			if (request.user) {
				throw new BadRequestException("Authenticated user can't login again");
			}

			const em = request.entityManager;
			const user = await app.authService.login(em, request.body as LoginDto);

			if (!user) {
				return reply.code(200).send();
			}

			if (user.isTwoFactorEnabled) {
				const payload: UserResponseTwoFactorAuthDto = { id: user.id };
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
			if (request.user) {
				throw new BadRequestException("Authenticated user can't login again");
			}

			const { idToken } = request.body as GoogleLoginDto;
			const em = request.entityManager;
			const user = await app.authService.loginWithGoogle(em, idToken);
			const payload = getUserResponseDto(user);
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
};
