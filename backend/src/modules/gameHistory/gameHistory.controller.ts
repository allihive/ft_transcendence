// src/modules/gameHistory/gameHistory.controller.ts
import { FastifyPluginAsync } from "fastify";
import {
	CreateGameHistoryDto,
	CreateGameHistoryDtoSchema,
	GetPlayerHistoryParamsDto,
	GetPlayerHistoryParamsDtoSchema,
	GetPlayerHistoryQueryDto,
	GetPlayerHistoryQueryDtoSchema,
	GetPlayerStatsParamsDto,
	GetPlayerStatsParamsDtoSchema,
	GameHistoryResponseDto,
	RecordMatchResponseDto
} from './gameHistory.dto';

export const gameHistoryController: FastifyPluginAsync = async (app) => {
	//create new gameHistory entry
	app.post("/", {
		schema: { body: CreateGameHistoryDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await app.gameHistoryService.createGameHistory(em, request.body as CreateGameHistoryDto);
			return reply.code(201).send(response);
		}
	})

	//get game history of the player
	app.get("/:playerId", {
		schema: { params: GetPlayerHistoryParamsDtoSchema, querystring: GetPlayerHistoryQueryDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await app.gameHistoryService.getPlayerHistory(em, request.params as GetPlayerHistoryParamsDto, request.query as GetPlayerHistoryQueryDto);
			return reply.code(200).send(response);
		}
	});
};

// app.get("/recent", {
//   handler: async (request, reply) => {
//     const service = new app.gameHistoryService(request.entityManager);
//     const query = request.query as any;

//     const page = query.page ? parseInt(query.page, 10) : 1;
//     const limit = query.limit ? parseInt(query.limit, 10) : 10;

//     if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
//       return reply.code(400).send({
//         success: false,
//         message: 'Invalid pagination parameters',
//         data: undefined
//       });
//     }

//     try {
//       const matches = await service.getRecentMatches(page, limit);
//       return reply.code(200).send({
//         success: true,
//         message: `Retrieved ${matches.length} recent matches`,
//         data: {
//           matches,
//           page,
//           limit,
//           count: matches.length
//         }
//       });
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error('Error in getRecentMatches controller:', error.message);
//       } else {
//         console.error('Unknown error in getRecentMatches controller:', error);
//       }
//       return reply.code(500).send({
//         success: false,
//         message: 'Failed to retrieve recent matches',
//         data: undefined
//       });
//     }
//   }
// });

// app.get("/:playerId/stats", {
// 	schema: { params: GetPlayerStatsParamsDtoSchema },
// 	handler: async (request, reply) => {
// 		const service = new app.gameHistoryService(request.entityManager);
// 		const { playerId } = request.params as GetPlayerStatsParamsDto;

// 		try {
// 			const stats = await service.getPlayerStats(playerId);
// 			return reply.code(200).send({
// 				success: true,
// 				message: `Retrieved statistics for player ${playerId}`,
// 				data: {
// 					playerId,
// 					...stats
// 				}
// 			});
// 		} catch (error) {
// 			if (error instanceof Error) {
// 				console.error('Error in getPlayerStats controller:', error.message);
// 			} else {
// 				console.error('Unknown error in getPlayerStats controller:', error);
// 			}
// 			return reply.code(500).send({
// 				success: false,
// 				message: 'Failed to retrieve player statistics',
// 				data: undefined
// 			});
// 		}
// 	}
// });

