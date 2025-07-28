// src/module/tournament/tournament.controller.ts
import { FastifyPluginAsync } from "fastify";
import { CreateTournamentDto, createTournamentDtoSchema, JoinTournamentDto, joinTournamentDtoSchema, LeaveTournamentDto, leaveTournamentDtoSchema, StartTournamentDto, startTournamentDtoSchema, RecordTournamentResultsDto, recordTournamentResultsSchema } from "./tournament.dto";


export const tournamentGameController: FastifyPluginAsync = async (app) => {
	app.post("/", {
		schema: { body: createTournamentDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await app.tournamentGameService.createTournamentGame(em, request.body as CreateTournamentDto);
			return reply.code(200).send(response);
		}
	});

	app.post("/join-tournament", {
		schema: { body: joinTournamentDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const joinTournamentDto = request.body as JoinTournamentDto;
			const response = await app.tournamentGameService.joinTournamentGame(em, joinTournamentDto.tournamentId, joinTournamentDto);
			return reply.code(200).send(response);
		}
	});

	app.post("/leave-tournament", {
		schema: { body: leaveTournamentDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const leaveTournamentDto = request.body as LeaveTournamentDto;
			const response = await app.tournamentGameService.leaveTournamentGame(em, leaveTournamentDto.tournamentId, leaveTournamentDto);
			return reply.code(200).send(response);
		}
	});

	app.post("/start-tournament", {
		schema: { body: startTournamentDtoSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const startTournamentDto = request.body as StartTournamentDto;
			const response = await app.tournamentGameService.startTournamentGame(em, startTournamentDto.tournamentId, startTournamentDto.creatorId);
			return reply.code(200).send(response);
		}
	});

	app.post("/record-tournament", {
		schema: { body: recordTournamentResultsSchema },
		handler: async (request, reply) => {
			const em = request.entityManager;
			const recordTournamentDto = request.body as RecordTournamentResultsDto;
			const response = await app.tournamentGameService.recordTournamentResults(em, recordTournamentDto);
			return reply.code(200).send(response);
		}
	});

	app.get("/find-open-tournament", {
		handler: async (request, reply) => {
			const em = request.entityManager;
			const response = await app.tournamentGameService.findOpenTournaments(em);
			return reply.code(200).send(response);
		}
	});

	app.get("/find-by-size", {
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { size } = request.query as { size: string };
			const response = await app.tournamentGameService.findTournamentsBySize(em, parseInt(size));
			return reply.code(200).send(response);
		}
	});

	app.get("/find-by-creator", {
		handler: async (request, reply) => {
			const em = request.entityManager;
			const { creatorId } = request.query as { creatorId: string };
			const response = await app.tournamentGameService.findTournamentsByCreator(em, creatorId);
			return reply.code(200).send(response);
		}
	});
}