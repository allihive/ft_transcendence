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
	UserIdParamsDto,
	UserIdParamsDtoSchema,
	UsernameParamsDto,
	UsernameParamsDtoSchema
} from "./user.dto";
import { UnauthorizedException } from "../../common/exceptions/UnauthorizedException";
import { Type } from "@sinclair/typebox";

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

	app.get("/:id/user", {
		schema: { params: UserIdParamsDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { id } = request.params as UserIdParamsDto;
			const user = await app.userService.findUser(em, { id });

			if (!user) {
				throw new NotFoundException(`No user found with id '${id}'`);
			}

			return reply.code(200).send(user);
		}
	});

	app.post("/", {
		schema: { body: CreateUserDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await app.userService.createUser(em, request.body as CreateUserDto);
			return reply.code(201).send(response);
		}
	});

	app.put("/:id", {
		onRequest: async (request) => {
			if (!request.user) {
				throw new UnauthorizedException("Unauthorized user is not allowed");
			}
		},
		schema: {
			params: UpdateUserParamsDtoSchema,
			body: UpdateUserDtoSchema
		},
		handler: async (request, reply) => {
			console.log("request.body = ", request.body)
			const em = request.entityManager;
			const { id } = request.params as UpdateUserParamsDto;
			const user = await app.userService.updateUserById(em, id, request.body as UpdateUserDto);
			return reply.code(200).send(user);
		}
	});

	app.delete("/:id", {
		onRequest: (request) => {
			if (!request.user) {
				throw new UnauthorizedException("Unauthorized user is not allowed");
			}
		},
		schema: { params: DeleteUserParamsDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { id } = request.params as DeleteUserParamsDto;
			await app.userService.deleteUser(em, id);
			return reply.code(200).send();
		}
	});
}
