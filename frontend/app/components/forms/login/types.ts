import type { User } from "~/api/types";

export type FormValues = {
	email: string;
	password: string;
};

export type UpdateUserData = {
	id: string;
	email?: string;
	name?: string;
	username?: string;
	avatarUrl?: string;
	newPassword?: string;
	confirmPassword: string;
}

export type LoginFormProps = {
	onSuccess: (user: User) => void;
	onError?: (error: Error) => void;
};
