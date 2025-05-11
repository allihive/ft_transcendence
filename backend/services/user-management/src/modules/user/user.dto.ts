import { Static, Type } from "@sinclair/typebox";

export const CreateUserDtoSchema = Type.Object(
	{
		email: Type.String({ format: "email" }),
		userName: Type.String({ minLength: 3 }),
		password: Type.String({ minLength: 8 }),
		confirmPassword: Type.String({ minLength: 8 })
	},
	{ additionalProperties: false }
);

export const UpdateUserDtoSchema = Type.Object(
	{
		id: Type.String({ format: "uuid" }),
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

export const DeleteUserDtoSchema = Type.Object(
	{ id: Type.String({ format: "uuid" }) },
	{ additionalProperties: false }
);

export const UserResponseDtoSchema = Type.Object(
	{
		id: Type.String({ format: "uuid" }),
		email: Type.String({ format: "email" }),
		emailVerified: Type.Boolean(),
		userName: Type.String({ minLength: 3, maxLength: 50 }),
		name: Type.Optional(Type.String({ maxLength: 100 })),
		avatarUrl: Type.Optional(
			Type.String({
				format: "uri",
				pattern: "^https?:\\/\\/(?:www\\.)?[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})+(?:[/?#].*)?$",
			})
		),
		isActive: Type.Boolean(),
		lastLogin: Type.Optional(Type.String({ format: "date-time" })),
		createdAt: Type.String({ format: "date-time" }),
		updatedAt: Type.String({ format: "date-time" }),
	},
	{ additionalProperties: false }
);

export type CreateUserDto = Static<typeof CreateUserDtoSchema>;
export type UpdateUserDto = Static<typeof UpdateUserDtoSchema>;
export type DeleteUserDto = Static<typeof DeleteUserDtoSchema>;
export type UserResponseDto = Static<typeof UserResponseDtoSchema>;
