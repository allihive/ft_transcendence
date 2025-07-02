import { HttpError } from "~/exceptions/HttpError";

const getErrorMessage = (statusCode: number): string => {
	switch (statusCode) {
		case 400: return "There was an issue with the request. Please make sure everything is correct and try again.";
		case 401: return "You're not authorized to view this page.";
		case 403: return "Access is denied. Please reach out to support for assistance.";
		case 404: return "The page or resource you're looking for doesn't exist";
		case 405: return "This action isn't allowed.";
		case 408: return "Your request took too long to process.";
		case 429: return "You've made too many requests. Please wait a moment and try again.";
		case 503: return "The service is currently unavailable.";
		case 504: return "It's taking longer than usual to respond.";
		default: return "An unexpected error occurred.";
	}
};

export const fetchJson = async<T> (url: string, options?: RequestInit): Promise<T> => {
	try {
		const response = await fetch(url, options);

		if (!response.ok) {
			throw new HttpError(response.statusText);
		}

		const data: T = await response.json();
		return data;
	} catch (error) {
		if (error instanceof HttpError) throw error;
		if (error instanceof TypeError) throw new Error("No network connection.");
		if (error instanceof SyntaxError) throw new Error("There was an error processing the information. Please try again.");
		throw new Error("An unexpected error occurred. Please try again later.");
	}
};
