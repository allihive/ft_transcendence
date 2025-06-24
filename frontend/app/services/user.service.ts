import type { getUserResponseDto } from "~/pages/users/UserProfile";

export async function fetchCurrentUser(): Promise<getUserResponseDto> {
	const res = await fetch('http://localhost:3001/api/auth/login');
	if (!res.ok) {
		throw new Error('Failed to fetch user');
	}
	return res.json();
}

export interface UpdateUserDto {
	email?: string;
	name?: string;
	username?: string;
	avatarUrl?: string;
	password?: string;
	confirmPassword?: string;
	lastLogin?: string;
}

export async function updateUser (userId: string, updatedData: UpdateUserDto) {
	const res = await fetch(`/api/users/${userId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(updatedData),
	});
	if (!res.ok) {
		throw new Error("failed to update user");
	}
	return await res.json();
}