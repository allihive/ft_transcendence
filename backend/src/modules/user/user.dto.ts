import { Static, Type } from "@sinclair/typebox";
import { AuthMethod, User } from "./entities/user.entity";

export const UsernameParamsDtoSchema = Type.Object(
	{ username: Type.String() },
	{ additionalProperties: false }
);

export const FindUserQueryDtoSchema = Type.Union(
	[
		Type.Object({ id: Type.String({ format: "uuid" }) }),
		Type.Object({ email: Type.String({ format: "email" }) }),
		Type.Object({ username: Type.String() }),
	],
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
		username: Type.String({
			minLength: 3,
			maxLength: 30,
			pattern: "^[a-zA-Z0-9_]+$",
			description: "Username can only contain letters, numbers, and underscores."
		}),
		password: Type.Optional(Type.String({ minLength: 8 })),
		authMethod: Type.Enum(AuthMethod, { default: AuthMethod.PASSWORD }),
		avatarUrl: Type.String({ format: "uri-reference" })
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
		username: Type.Optional(Type.String({
			minLength: 3,
			maxLength: 30,
			pattern: "^[a-zA-Z0-9_]+$",
			description: "Username can only contain letters, numbers, and underscores."
		})),
		avatarUrl: Type.Optional(Type.String({
			format: "uri",
			pattern: "^https?:\\/\\/(?:www\\.)?[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})+(?:[/?#].*)?$",
		})),
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
		username: Type.String({
			minLength: 3,
			maxLength: 30,
			pattern: "^[a-zA-Z0-9_]+$",
			description: "Username can only contain letters, numbers, and underscores."
		}),
		avatarUrl: Type.Optional(Type.String({ format: "uri" })),
		lastLogin: Type.Optional(Type.String({ format: "date-time" })),
	},
	{ additionalProperties: false }
);

export type CreateUserDto = Static<typeof CreateUserDtoSchema>;
export type DeleteUserParamsDto = Static<typeof DeleteUserParamsDtoSchema>;
export type FindPaginatedUsersQueryDto = Static<typeof FindPaginatedUsersQueryDtoSchema>;
export type FindUserQueryDto = Static<typeof FindUserQueryDtoSchema>;
export type UpdateUserDto = Static<typeof UpdateUserDtoSchema>;
export type UpdateUserParamsDto = Static<typeof UpdateUserParamsDtoSchema>;
export type UsernameParamsDto = Static<typeof UsernameParamsDtoSchema>;
export type UserResponseDto = Static<typeof UserResponseDtoSchema>;

export const getUserResponseDto = (user: User): UserResponseDto => ({
	id: user.id,
	email: user.email,
	name: user.name,
	username: user.username,
	avatarUrl: user.avatarUrl,
	lastLogin: user.lastLogin?.toString()
});
