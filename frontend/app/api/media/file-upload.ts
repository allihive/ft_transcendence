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


export interface ChatFileUploadResponse {
	url: string;
	messageType: 'image' | 'file';
	originalFilename: string;
	mimeType: string;
	size: number;
}

export const uploadChatFile = async (file: File): Promise<ChatFileUploadResponse> => {
	const formData = new FormData();
	formData.append("file", file);

	return fetchJson<ChatFileUploadResponse>(`${import.meta.env.VITE_API_BASE_URL}/media/chat/upload`, {
		method: "POST",
		body: formData
	});
};
