import type { User } from "~/api/types";

export type FormValues = {
	name: string;
	email: string;
	username: string;
	avatar?: FileList;
	password: string;
	confirmPassword: string;
};

export type RegisterFormProps = {
	onSuccess: (user: User) => void;
	onError?: (error: Error) => void;
};
