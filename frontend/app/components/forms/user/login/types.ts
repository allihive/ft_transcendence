export type UserLoginFormData = {
	email: string;
	password: string;
};

export type LoginHandler = (data: UserLoginFormData, event?: React.BaseSyntheticEvent) => void;

export type LoginFormProps = {
	onLogin: LoginHandler;
	isProcessing?: boolean
};
