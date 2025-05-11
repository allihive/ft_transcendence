import { Static, Type } from "@sinclair/typebox";

export const LoginDtoSchema = Type.Object(
	{
		email: Type.String({ format: "email" }),
		password: Type.String({ minLength: 8 })
	},
	{ additionalProperties: false }
);

export const RegisterDtoSchema = Type.Object(
	{
		email: Type.String({ format: "email" }),
		password: Type.String({ minLength: 8 }),
		confirmPassword: Type.String({ minLength: 8 })
	},
	{ additionalProperties: false }
);

export const RefreshTokenDtoSchema = Type.Object(
	{ refreshToken: Type.String() },
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

export type LoginDto = Static<typeof LoginDtoSchema>;
export type RegisterDto = Static<typeof RegisterDtoSchema>;
export type RefreshTokenDto = Static<typeof RefreshTokenDtoSchema>;
export type ForgotPasswordDto = Static<typeof ForgotPasswordDtoSchema>;
export type ResetPasswordDto = Static<typeof ResetPasswordDtoSchema>;
