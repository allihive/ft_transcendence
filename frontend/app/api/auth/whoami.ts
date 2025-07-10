import { fetchJson } from "../client";
import type { User } from "../types";

export const whoami = async (): Promise<User | null> => {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/whoami`);
};
