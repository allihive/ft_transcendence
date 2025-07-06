import { HttpError } from "~/exceptions/HttpError";
import type { FetchError } from "./types";

export const fetchJson = async<T> (url: string, options?: RequestInit): Promise<T> => {
	try {
		const response = await fetch(url, options);

		if (!response.ok) {
			const errorJson: FetchError = await response.json();
			throw new HttpError(errorJson.message);
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
