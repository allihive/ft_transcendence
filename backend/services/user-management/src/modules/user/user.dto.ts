import { Static, Type } from "@sinclair/typebox";

export const FindUserDtoSchema = Type.Object(
	{ id: Type.String({ format: "uuid" }) },
	{ additionalProperties: false }
);

export const FindAllUsersDtoSchema = Type.Object(
	{
		page: Type.Number({ default: 1 }),
		limit: Type.Number({ default: 20 })
	},
	{ additionalProperties: false }
);

export const CreateUserDtoSchema = Type.Object(
	{
		email: Type.String({ format: "email" }),
		userName: Type.Optional(Type.String({ minLength: 3 })),
		password: Type.String({ minLength: 8 }),
		confirmPassword: Type.String({ minLength: 8 })
	},
	{ additionalProperties: false }
);

export const UpdateUserParamsDtoSchema = Type.Object(
	{ id: Type.String({ format: "uuid" }) },
	{ additionalProperties: false }
);

export const UpdateUserDtoSchema = Type.Object(
	{
		email: Type.Optional(Type.String({ format: "email" })),
		userName: Type.Optional(Type.String({ minLength: 3 })),
		name: Type.Optional(Type.String({ maxLength: 100 })),
		avatarUrl: Type.Optional(
			Type.String({
				format: "uri",
				pattern: "^https?:\\/\\/(?:www\\.)?[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})+(?:[/?#].*)?$",
			})
		),
		password: Type.Optional(Type.String({ minLength: 8 })),
		confirmPassword: Type.Optional(Type.String({ minLength: 8 }))
	},
	{ additionalProperties: false }
);

export const DeleteUserParamsDtoSchema = Type.Object(
	{ id: Type.String({ format: "uuid" }) },
	{ additionalProperties: false }
);

export const UserResponseDtoSchema = Type.Object(
	{
		id: Type.String({ format: "uuid" }),
		email: Type.String({ format: "email" }),
		userName: Type.Optional(Type.String({ minLength: 3, maxLength: 50 })),
		name: Type.Optional(Type.String({ maxLength: 100 })),
		avatarUrl: Type.Optional(Type.String({ format: "uri"})),
		lastLogin: Type.Optional(Type.String({ format: "date-time" })),
	},
	{ additionalProperties: false }
);

export type FindUserDto = Static<typeof FindUserDtoSchema>;
export type FindAllUsersDto = Static<typeof FindAllUsersDtoSchema>;
export type CreateUserDto = Static<typeof CreateUserDtoSchema>;
export type UpdateUserParamsDto = Static<typeof UpdateUserParamsDtoSchema>;
export type UpdateUserDto = Static<typeof UpdateUserDtoSchema>;
export type DeleteUserParamsDto = Static<typeof DeleteUserParamsDtoSchema>;
export type UserResponseDto = Static<typeof UserResponseDtoSchema>;
