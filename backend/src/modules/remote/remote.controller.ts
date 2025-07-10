//src/modules/remote/remote.controller.ts
import { FastifyPluginAsync } from "fastify";
import {
	CreateMatchDto,
	createMatchDtoSchema,
	CreateRemotePlayerDto,
	createRemotePlayerDtoSchema,
	JoinQueueDto,
	joinQueueDtoSchema,
	LeaveQueueDto,
	leaveQueueDtoSchema,
	MatchResultDto,
	matchResultDtoSchema,
} from './remote.dto';

export const remoteGameController: FastifyPluginAsync = async (app) => {
	//create new remoteGame entry
	app.post("/", {
		schema: { body: createRemotePlayerDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await app.remoteGameService.createPlayer(em, request.body as CreateRemotePlayerDto);
		}
	});

	app.post("/join-queue", {
		schema: { body: joinQueueDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { playerId } = request.body as JoinQueueDto;
			const response = await app.remoteGameService.joinQueue(em, playerId);
			return reply.send(response);
		}
	});

	app.post("/leave-queue", {
		schema: { body: leaveQueueDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { playerId } = request.body as LeaveQueueDto;
			const response = await app.remoteGameService.leaveQueue(em, playerId);
			return reply.send(response);
		}
	});

	// Create a match (find opponent and set both players to IN_GAME)
	app.post("/create-match", {
		schema: { body: createMatchDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { playerId } = request.body as CreateMatchDto;
			const response = await app.remoteGameService.createMatch(em, playerId);
			return reply.send(response);
		}
	});

	// Complete match and update ratings
	app.post("/complete-match", {
		schema: { body: matchResultDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await app.remoteGameService.calculateAndUpdateRating(em, request.body as MatchResultDto);
			return reply.send(response);
		}
	});

		// Get all online players
	app.get("/online-players", {
		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await app.remoteGameService.findAllOnlinePlayers(em);
			return reply.send(response);
		}
	});

	// // Get player by ID
	// app.get("/player/:playerId", {
	// 	handler: async (request, reply) => {
	// 		const em = request.entityManager;
	// 		const { playerId } = request.params as { playerId: string };
	// 		const response = await app.remoteGameService.findPlayer(em, { playerId });

	// 		if (!response) {
	// 			return reply.code(404).send({ error: `Player with ID ${playerId} not found` });
	// 		}

	// 		return reply.send(response);
	// 	}
	// });
}