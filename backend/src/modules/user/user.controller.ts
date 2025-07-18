import { FastifyPluginAsync } from "fastify";
import { NotFoundException } from "../../common/exceptions/NotFoundException";
import {
	CreateUserDto,
	CreateUserDtoSchema,
	DeleteUserParamsDto,
	DeleteUserParamsDtoSchema,
	FindPaginatedUsersQueryDto,
	FindPaginatedUsersQueryDtoSchema,
	UpdateUserDto,
	UpdateUserDtoSchema,
	UpdateUserParamsDto,
	UpdateUserParamsDtoSchema,
	UsernameParamsDto,
	UsernameParamsDtoSchema
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

	app.get("/:username", {
		schema: { params: UsernameParamsDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { username } = request.params as UsernameParamsDto;
			const user = await app.userService.findUser(em, { username });

			if (!user) {
				throw new NotFoundException(`No user found with username '${username}'`);
			}

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
			const user = await app.userService.updateUserById(em, id, request.body as UpdateUserDto);
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
