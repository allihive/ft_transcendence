import { fetchJson } from "../client";
import type { UserUpdateData, User } from "../types";

export const updateUser = async (userUpdateData: UserUpdateData): Promise<User> => {
	const user = await fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userUpdateData.id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userUpdateData)
	});

	return user!;
}

export const getUser = async (id: string): Promise<User> => {
	const user = await fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/api/users/${id}/user`, {
		method: "GET",
	});

	return user!;
}