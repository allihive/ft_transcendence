export class HttpException extends Error {
	public readonly statusCode: number;
	public readonly code: string;
	public readonly timestamp: Date;

	constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_SERVER_ERROR") {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.code = code;
		this.timestamp = new Date();
		Object.setPrototypeOf(this, HttpException.prototype);
		Error.captureStackTrace(this, this.constructor);
	}
}
