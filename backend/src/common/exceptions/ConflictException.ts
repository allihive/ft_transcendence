import { HttpException } from "./HttpException";

export class ConflictException extends HttpException {
	constructor(message: string) {
		super(message, 409, "CONFLICT");
	}
}
