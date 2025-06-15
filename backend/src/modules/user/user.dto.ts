import { Static, Type } from "@sinclair/typebox";
import { AuthMethod, User } from "./entities/user.entity";

export const FindUserParamsDtoSchema = Type.Object(
	{ id: Type.String({ format: "uuid" }) },
	{ additionalProperties: false }
);

export const FindPaginatedUsersQueryDtoSchema = Type.Object(
	{
		page: Type.Number({ default: 1, minimum: 1 }),
		limit: Type.Number({ default: 20, minimum: 1 })
	},
	{ additionalProperties: false }
);

export const CreateUserDtoSchema = Type.Object(
	{
		email: Type.String({ format: "email" }),
		name: Type.String({ minLength: 2, maxLength: 100 }),
		password: Type.Optional(Type.String({ minLength: 8 })),
		authMethod: Type.Enum(AuthMethod),
		avatarUrl: Type.Optional(Type.String({ format: "uri" }))
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
		name: Type.Optional(Type.String({ maxLength: 100 })),
		avatarUrl: Type.Optional(
			Type.String({
				format: "uri",
				pattern: "^https?:\\/\\/(?:www\\.)?[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})+(?:[/?#].*)?$",
			})
		),
		password: Type.Optional(Type.String({ minLength: 8 })),
		confirmPassword: Type.Optional(Type.String({ minLength: 8 })),
		lastLogin: Type.Optional(Type.String({ format: "date-time" }))
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
		name: Type.String({ minLength: 2, maxLength: 100 }),
		avatarUrl: Type.Optional(Type.String({ format: "uri"})),
		lastLogin: Type.Optional(Type.String({ format: "date-time" })),
	},
	{ additionalProperties: false }
);

export type FindUserParamsDto = Static<typeof FindUserParamsDtoSchema>;
export type FindPaginatedUsersQueryDto = Static<typeof FindPaginatedUsersQueryDtoSchema>;
export type CreateUserDto = Static<typeof CreateUserDtoSchema>;
export type UpdateUserParamsDto = Static<typeof UpdateUserParamsDtoSchema>;
export type UpdateUserDto = Static<typeof UpdateUserDtoSchema>;
export type DeleteUserParamsDto = Static<typeof DeleteUserParamsDtoSchema>;
export type UserResponseDto = Static<typeof UserResponseDtoSchema>;

export const getUserResponseDto = (user: User): UserResponseDto => ({
	id: user.id,
	email: user.email,
	name: user.name,
	avatarUrl: user.avatarUrl,
	lastLogin: user.lastLogin?.toString()
});
