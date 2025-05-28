import { FastifyPluginAsync } from "fastify";
import { UserControllerOptions } from "./user.types";

import {
	CreateUserDto,
	CreateUserDtoSchema,
	DeleteUserParamsDto,
	DeleteUserParamsDtoSchema,
	FindAllUsersDto,
	FindAllUsersDtoSchema,
	FindUserDto,
	FindUserDtoSchema,
	UpdateUserDto,
	UpdateUserDtoSchema,
	UpdateUserParamsDto,
	UpdateUserParamsDtoSchema,
} from "./user.dto";

export const userController: FastifyPluginAsync<UserControllerOptions> = async (app, opts) => {
	const { userService } = opts;

	// Get paginated users and total number of users
	app.get("/", {
		schema: { params: FindAllUsersDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const result = await userService.findAllUsers(em, request.params as FindAllUsersDto);
			return reply.code(200).send(result);
		}
	});

	// Get details of a specific user by ID
	app.get("/:id", {
		schema: { params: FindUserDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const user = await userService.findUser(em, request.params as FindUserDto);
			return reply.code(200).send(user);
		}
	});

	// Create a new user
	app.post("/", {
		schema: { body: CreateUserDtoSchema },

		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await userService.createUser(em, request.body as CreateUserDto);
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
			const user = await userService.updateUser(em, id, request.body as UpdateUserDto);
			return reply.code(200).send(user);
		}
	});

	// Delete a user account
	app.delete("/:id", {
		schema: { params: DeleteUserParamsDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { id } = request.params as DeleteUserParamsDto;
			await userService.deleteUser(em, id);
			return reply.code(204).send();
		}
	});
}
