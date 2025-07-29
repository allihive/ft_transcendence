import { Static, Type } from "@sinclair/typebox";

export const LoginDtoSchema = Type.Object(
	{
		email: Type.String({ format: "email" }),
		password: Type.String({ minLength: 8 }),
		verifyOnly: Type.Boolean({ default: false })
	},
	{ additionalProperties: false }
);

export const GoogleLoginDtoSchema = Type.Object(
	{
		idToken: Type.String(),
		verifyOnly: Type.Boolean({ default: false })
	},
	{ additionalProperties: false }
);

export const CreateUserProviderDtoSchema = Type.Object(
	{
		provider: Type.String(),
		providerUserId: Type.String(),
		email: Type.String({ format: "email" }),
		user: Type.Any()
	},
	{ additionalProperties: false }
);

export const SetupTwoFactorAuthResponseDtoSchema = Type.Object(
	{
		message: Type.String({ description: "Status message" }),
		qrCode: Type.String({
			format: "uri",
			description: "Data URL for QR code image (PNG)",
		}),
		secret: Type.String({
			minLength: 32,
			description: "Base32 encoded TOTP secret for manual entry",
		}),
	},
	{ additionalProperties: false }
);

export const VerifyTwoFactorAuthDtoSchema = Type.Object(
	{
		totpCode: Type.String({
			pattern: "^\\d{6}$",
			minLength: 6,
			maxLength: 6,
			description: "6-digit TOTP code from authenticator app"
		})
	},
	{ additionalProperties: false }
);

export const ActivateTwoFactorAuthSchema = Type.Object(
	{
		totpCode: Type.String({
			pattern: "^\\d{6}$",
			minLength: 6,
			maxLength: 6,
			description: "6-digit TOTP code from authenticator app"
		})
	},
	{ additionalProperties: false }
)

export type LoginDto = Static<typeof LoginDtoSchema>;
export type GoogleLoginDto = Static<typeof GoogleLoginDtoSchema>;
export type CreateUserProviderDto = Static<typeof CreateUserProviderDtoSchema>;
export type VerifyTwoFactorAuthDto = Static<typeof VerifyTwoFactorAuthDtoSchema>;
export type SetupTwoFactorAuthResponseDto = Static<typeof SetupTwoFactorAuthResponseDtoSchema>;
export type ActivateTwoFactorAuthDto = Static<typeof ActivateTwoFactorAuthSchema>;
