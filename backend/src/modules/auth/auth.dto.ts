import { Static, Type } from "@sinclair/typebox";

export const LoginDtoSchema = Type.Object(
	{
		email: Type.String({ format: "email" }),
		password: Type.String({ minLength: 8 })
	},
	{ additionalProperties: false }
);

export const GoogleLoginDtoSchema = Type.Object(
	{ idToken: Type.String() },
	{ additionalProperties: false }
);

export const ForgotPasswordDtoSchema = Type.Object(
	{ email: Type.String({ format: "email" }) },
	{ additionalProperties: false }
);

export const ResetPasswordDtoSchema = Type.Object(
	{
		token: Type.String(),
		newPassword: Type.String({ minLength: 8 }),
		confirmNewPassword: Type.String({ minLength: 8 })
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
		toptCode: Type.Number({
			minimum: 100000,
			maximum: 999999,
			description: "6-digit TOTP code from authenticator app"
		})
	},
	{ additionalProperties: false }
);

export type LoginDto = Static<typeof LoginDtoSchema>;
export type GoogleLoginDto = Static<typeof GoogleLoginDtoSchema>;
export type ForgotPasswordDto = Static<typeof ForgotPasswordDtoSchema>;
export type ResetPasswordDto = Static<typeof ResetPasswordDtoSchema>;
export type CreateUserProviderDto = Static<typeof CreateUserProviderDtoSchema>;
export type VerifyTwoFactorAuthDto = Static<typeof VerifyTwoFactorAuthDtoSchema>;
export type SetupTwoFactorAuthResponseDto = Static<typeof SetupTwoFactorAuthResponseDtoSchema>;
