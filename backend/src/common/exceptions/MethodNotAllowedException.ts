import { HttpException } from "./HttpException";

export class MethodNotAllowedException extends HttpException {
	constructor(message: string) {
		super(message, 405, "METHOD_NOT_ALLOWED");
	}
}
