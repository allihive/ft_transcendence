import { HttpException } from "./HttpException";

export class ServiceUnavailableException extends HttpException {
	constructor(message: string) {
		super(message, 503, "SERVICE_UNAVAILABLE");
	}
}
