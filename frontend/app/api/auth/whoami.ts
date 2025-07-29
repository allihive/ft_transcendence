import { fetchJson } from "../client";
import type { User } from "../types";

export const whoami = async (): Promise<{ message: string, user: User | null }> => {
	const payload = await fetchJson<{ message: string, user: User | null }>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/whoami`);
	return payload!;
};
