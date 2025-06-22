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

export type LoginDto = Static<typeof LoginDtoSchema>;
export type GoogleLoginDto = Static<typeof GoogleLoginDtoSchema>;
export type ForgotPasswordDto = Static<typeof ForgotPasswordDtoSchema>;
export type ResetPasswordDto = Static<typeof ResetPasswordDtoSchema>;
export type CreateUserProviderDto = Static<typeof CreateUserProviderDtoSchema>;