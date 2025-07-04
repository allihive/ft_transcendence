import { fetchJson } from "../client";
import type { User } from "../types";
import type { UpdateUserData } from "~/components/forms/login/types";


export function updateUser(userId: string, updateUserData: UpdateUserData): Promise<User> {
	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(updateUserData),
	});
}