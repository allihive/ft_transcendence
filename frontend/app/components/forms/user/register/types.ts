export type UserRegisterFormValues = {
	name: string;
	email: string;
	username: string;
	avatars: FileList | null;
	password: string;
	confirmPassword: string;
};

export type UserRegisterFormData = {
	email: string;
	name: string;
	username: string;
	avatar?: File;
	password: string;
};

export type RegisterHandler = (data: UserRegisterFormData, event?: React.BaseSyntheticEvent) => void;

export type RegisterFormProps = {
	onRegister: RegisterHandler
	isProcessing?: boolean;
};
