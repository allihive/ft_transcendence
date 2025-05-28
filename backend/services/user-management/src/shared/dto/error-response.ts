import { Static, Type } from "@sinclair/typebox";

export const ErrorResponseDtoSchema = Type.Object({
	statusCode: Type.Number(),
	message: Type.String()
});

export type ErrorResponseDto = Static<typeof ErrorResponseDtoSchema>;