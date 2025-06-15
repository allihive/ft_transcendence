import { HttpException } from "./HttpException";

export class ForbiddenException extends HttpException {
	constructor(message: string) {
		super(message, 403, "FORBIDDEN");
	}
}
