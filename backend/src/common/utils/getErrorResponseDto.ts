import { FastifyError } from "fastify";
import { ErrorResponseDto } from "../dto/error-response";
import { UniqueConstraintViolationException } from "@mikro-orm/core";

export const getErrorResponseDto = (error: FastifyError): ErrorResponseDto => {
	let statusCode: number = error.statusCode ?? 500;
	let code: string = error.code ?? "INTERNAL_SERVER_ERROR";
	let message: string = error.message ?? "Something went wrong on our end. Please try again later.";

	if (error instanceof UniqueConstraintViolationException) {
		const match = message.match(/UNIQUE constraint failed: \w+\.(\w+)/);
		message = `Duplicated ${match?.[1] ?? "value"}`;
	}

	return { statusCode, code, message } satisfies ErrorResponseDto;
};