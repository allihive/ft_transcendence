export type User = {
	id: string;
	email: string;
	name: string;
	username: string;
	isTwoFactorEnabled: boolean;
	authMethod: "password" | "google";
	avatarUrl: string;
	lastLogin: string;
};

export type Player = {
	id: string;
	username: string;
	avatarUrl: string;
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
	totpSecret?: number;
	isTwoFactorEnabled?: boolean;
	newPassword?: string;
};

export type UserStats = {
	userId: string,
	matchesPlayed: number,
	matchesWon: number,
	matchesLost: number,
	winRate: number
};

export type FileUpload = {
	url: string;
};

export type FetchError = {
	statusCode: number;
	code: string;
	message: string;
};

export type TwoFactorAuth = {
	message: string;
	qrCode: string;
	secret: string;
};