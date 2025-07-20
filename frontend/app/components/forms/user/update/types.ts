import type { User } from "~/api/types";

export type UserUpdateFormValues = {
	id: string;
	email?: string;
	name?: string;
	username?: string;
	avatars: FileList | null;
	password?: string;
	isTwoFactorEnabled?: boolean;
	newPassword?: string;
	confirmPassword?: string;
};

export type UserUpdateFormData = Omit<UserUpdateFormValues, "avatars" | "password" | "confirmPassword"> & {
	avatar?: File;
};

export type UpdateHandler = (data: UserUpdateFormData, event?: React.BaseSyntheticEvent) => void;

export type UserUpdateFormProps = {
	user: User;
	onUpdate: UpdateHandler;
	isProcessing?: boolean;
};

export type TwoFactorModal = {
	isOpen: boolean,
	onClose: () => void
};