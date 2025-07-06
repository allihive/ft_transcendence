import { fetchJson } from "../client";
import type { UserUpdateData, User } from "../types";

export function updateUser(userId: string, userUpdateData: UserUpdateData): Promise<User> {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userUpdateData)
	});
}
