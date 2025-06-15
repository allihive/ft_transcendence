import { FastifyPluginAsync } from "fastify";

import {
	CreateUserDto,
	CreateUserDtoSchema,
	DeleteUserParamsDto,
	DeleteUserParamsDtoSchema,
	FindPaginatedUsersQueryDto,
	FindPaginatedUsersQueryDtoSchema,
	FindUserParamsDto,
	FindUserParamsDtoSchema,
	UpdateUserDto,
	UpdateUserDtoSchema,
	UpdateUserParamsDto,
	UpdateUserParamsDtoSchema,
} from "./user.dto";

export const userController: FastifyPluginAsync = async (app) => {
	// Get paginated users and total number of users
	app.get("/", {
		schema: { querystring: FindPaginatedUsersQueryDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const result = await app.userService.findUsers(em, request.query as FindPaginatedUsersQueryDto);
			return reply.code(200).send(result);
		}
	});

	// Get details of a specific user by ID
	app.get("/:id", {
		schema: { params: FindUserParamsDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { id } = request.params as FindUserParamsDto
			const user = await app.userService.findUser(em, { id });
			return reply.code(200).send(user);
		}
	});

	// Create a new user
	app.post("/", {
		schema: { body: CreateUserDtoSchema },

		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await app.userService.createUser(em, request.body as CreateUserDto);
			return reply.code(201).send(response);
		}
	});

	// Update user profile
	app.put("/:id", {
		schema: {
			params: UpdateUserParamsDtoSchema,
			body: UpdateUserDtoSchema
		},
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { id } = request.params as UpdateUserParamsDto;
			const user = await app.userService.updateUser(em, id, request.body as UpdateUserDto);
			return reply.code(200).send(user);
		}
	});

	// Delete a user account
	app.delete("/:id", {
		schema: { params: DeleteUserParamsDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { id } = request.params as DeleteUserParamsDto;
			await app.userService.deleteUser(em, id);
			return reply.code(200).send();
		}
	});
}
