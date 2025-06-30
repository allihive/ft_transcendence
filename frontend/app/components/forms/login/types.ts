import type { User } from "~/api/types";

export type FormValues = {
	email: string;
	password: string;
};

export type LoginFormProps = {
	onSuccess: (user: User) => void;
	onError?: (error: Error) => void;
};
