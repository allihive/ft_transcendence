import { FastifyPluginAsync } from "fastify";
import { toDataURL } from "qrcode";
import speakeasy from "speakeasy";
import { BadRequestException } from "../../common/exceptions/BadRequestException";
import { NotFoundException } from "../../common/exceptions/NotFoundException";
import { UnauthorizedException } from "../../common/exceptions/UnauthorizedException";
import { getUserResponseDto, UserResponseTwoFactorAuthDto } from "../user/user.dto";
import {
	ActivateTwoFactorAuthDto,
	ActivateTwoFactorAuthSchema,
	SetupTwoFactorAuthResponseDto,
	VerifyTotpBodyDto,
	VerifyTotpBodyDtoSchema,
	VerifyTotpParamsDto,
	VerifyTotpParamsDtoSchema,
	VerifyTwoFactorAuthDto,
	VerifyTwoFactorAuthDtoSchema
} from "./auth.dto";

export const twoFactorAuthController: FastifyPluginAsync = async (app) => {
	app.post("/setup-2fa", {
		onRequest: async (request) => {
			if (!request.user) {
				throw new UnauthorizedException("Unauthenticated user is not allowed");
			}

			if (request.user.isTwoFactorEnabled) {
				throw new BadRequestException(`${request.user.username} has already enabled Two-Factor Authentication`);
			}
		},
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { qrCode, secret } = await app.authService.setupTwoFactorAuth(em, request.user.id);

			const payload: SetupTwoFactorAuthResponseDto = {
				message: "Scan the QR code with your authenticator app",
				qrCode,
				secret
			};

			return reply.code(200).send(payload);
		}
	});

	app.post("/activate-2fa", {
		onRequest: async (request) => {
			if (!request.user) {
				throw new UnauthorizedException("Unauthenticated user is not allowed");
			}
		},
		schema: { body: ActivateTwoFactorAuthSchema },
		handler: async (request, reply) => {
			const { totpCode } = request.body as ActivateTwoFactorAuthDto;
			const em = request.entityManager;
			const user = await app.authService.activateTwoFactorAuth(em, request.user.id, totpCode);

			if (!user) {
				return reply.code(204).send();
			}

			const payload = getUserResponseDto(user);
			const token = app.jwt.sign(payload, { expiresIn: "1h" });

			return reply
				.setCookie("accessToken", token)
				.code(200)
				.send(payload);
		}
	});

	app.post("/verify/2fa", {
		schema: { body: VerifyTwoFactorAuthDtoSchema },
		handler: async (request, reply) => {
			if (!request.cookies["twoFactorAuthToken"]) {
				throw new BadRequestException("Missing Two-factor authentication token");
			}
			const { id } = app.jwt.verify<UserResponseTwoFactorAuthDto>(request.cookies["twoFactorAuthToken"]);
			const { totpCode } = request.body as VerifyTwoFactorAuthDto;
			const em = request.entityManager;
			const user = await app.authService.verifyTotp(em, id, totpCode);

			if (!user) {
				return null;
			}

			const payload = getUserResponseDto(user);
			const token = app.jwt.sign(payload, { expiresIn: "1h" });

			return reply
				.clearCookie("twoFactorAuthToken", { maxAge: 1000 * 60 * 5 })
				.setCookie("accessToken", token)
				.code(200)
				.send(payload);
		}
	});

	app.post("/verify/totp/:userId", {
		schema: {
			params: VerifyTotpParamsDtoSchema,
			body: VerifyTotpBodyDtoSchema
		},
		handler: async (request, reply) => {
			const { userId } = request.params as VerifyTotpParamsDto;
			const { totpCode: totpCode } = request.body as VerifyTotpBodyDto;
			const em = request.entityManager;
			const user = await app.authService.verifyTotp(em, userId, totpCode);

			if (!user) {
				return null;
			}

			const payload = getUserResponseDto(user);

			return reply.code(200).send(payload);
		}
	});

};
