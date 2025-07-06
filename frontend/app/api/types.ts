export type User = {
	id: string;
	email: string;
	name: string;
	username: string;
	avatarUrl: string;
	lastLogin: string;
};

export type UserRegisterData = {
	email: string;
	name: string;
	username: string;
	avatarUrl?: string;
	password: string;
};

export type UserUpdateData = {
	id: string;
	email?: string;
	name?: string;
	username?: string;
	avatarUrl?: string;
	newPassword?: string;
};

export type FileUpload = {
	url: string;
};

export type FetchError = {
	statusCode: number;
	code: string;
	message: string;
};
