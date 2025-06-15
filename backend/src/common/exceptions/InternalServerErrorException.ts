import { HttpException } from "./HttpException";

export class InternalServerErrorException extends HttpException {
	constructor(message: string) {
		super(message, 500, "INTERNAL_SERVER_ERROR");
	}
}
