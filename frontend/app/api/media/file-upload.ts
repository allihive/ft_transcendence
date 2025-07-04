import { fetchJson } from "../client";
import type { FileUpload } from "../types";

export const upload = async (file: File): Promise<FileUpload> => {
	const formData = new FormData();
	formData.append("file", file);

	return fetchJson<FileUpload>(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
		method: "POST",
		body: formData
	});
};
