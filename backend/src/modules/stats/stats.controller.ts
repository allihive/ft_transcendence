import { FastifyPluginAsync } from "fastify";
import { UnauthorizedException } from "../../common/exceptions/UnauthorizedException";
import { UpsertUserStatsDto, UpsertUserStatsDtoSchema, GetUserStatsParamsDto, GetUserStatsParamsDtoSchema, getUserStatsResponseDto, MatchResultDtoSchema, MatchResultDto, UpdateUserRatingDto, UpdateUserRatingDtoSchema } from "./dtos/user-stats.dto";

export const statsController: FastifyPluginAsync = async (app) => {
	const userStatsService = app.statsService.getUserStatsService();

	app.get("/users/:userId", {
		schema: { params: GetUserStatsParamsDtoSchema },
		handler: async (request, reply) => {
			// if (!request.user) {
			// 	throw new UnauthorizedException("Authentication required to process your request.");
			// }
			const { userId } = request.params as GetUserStatsParamsDto;
			const em = request.entityManager;
			const userStats = await userStatsService.find(em, userId);
			const payload = getUserStatsResponseDto(userStats);

			return reply
				.code(200)
				.send(payload);
		}
	});

	app.post("/users/", {
		schema: { body: UpsertUserStatsDtoSchema },
		handler: async (request, reply) => {
			// if (!request.user) {
			// 	throw new UnauthorizedException("Authentication required to process your request.");
			// }

			const em = request.entityManager;
			const userStats = await userStatsService.upsert(em, request.body as UpsertUserStatsDto);
			const payload = getUserStatsResponseDto(userStats);

			return reply
				.code(201)
				.send(payload);
		}
	});
	
	//added 21.7 - Update user stats based on match result
	app.post("/update-rating", {
		schema: { body: MatchResultDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await userStatsService.updateUserRating(em, request.body as MatchResultDto);
			return reply
				.code(201)
				.send(response);
		}
	});
};
