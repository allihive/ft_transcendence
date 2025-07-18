import type { User } from "~/api/types";

export type UserUpdateFormValues = {
	id: string;
	email?: string;
	name?: string;
	username?: string;
	avatars: FileList | null;
	currentPassword: string;
	newPassword?: string;
	confirmPassword: string;
};

export type UserUpdateFormData = {
	id: string;
	email?: string;
	name?: string;
	username?: string;
	avatar?: File;
	newPassword?: string;
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