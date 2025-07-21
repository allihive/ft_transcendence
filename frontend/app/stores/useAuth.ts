import { create } from "zustand";
import { login as loginApi, loginWithGoogle as loginWithGoogleApi } from "~/api/auth/login";
import { logout as logoutApi } from "~/api/auth/logout";
import { register as registerApi } from "~/api/auth/register";
import type { User, UserRegisterData } from "~/api/types";

type AuthState = {
	user: User | null;
	setUser: (user: User | null) => void;
	login: (email: string, password: string) => Promise<User | null>;
	loginWithGoogle: (credential: string) => Promise<User>;
	register: (userRegisterData: UserRegisterData) => Promise<User>;
	logout: () => Promise<void>;
	isLoggingIn: boolean;
	isLoggingOut: boolean;
	isRegistering: boolean;
};

export const useAuth = create<AuthState>((set) => ({
	user: null,
	isLoggingIn: false,
	isLoggingOut: false,
	isRegistering: false,
	setUser: (user) => set({ user }),

	login: async (email: string, password: string) => {
		set({ isLoggingIn: true });

		try {
			const user = await loginApi(email, password);
			set({ user });
			return user;
		} catch (error) {
			throw error;
		} finally {
			set({ isLoggingIn: false });
		}
	},

	loginWithGoogle: async (credential: string) => {
		set({ isLoggingIn: true });

		try {
			const user = await loginWithGoogleApi(credential);
			set({ user });
			return user;
		} catch (error) {
			throw error;
		} finally {
			set({ isLoggingIn: false });
		}
	},

	register: async (userRegisterData) => {
		set({ isRegistering: true });

		try {
			const user = await registerApi(userRegisterData);
			set({ user });
			return user;
		} catch (error) {
			throw error;
		} finally {
			set({ isRegistering: false });
		}
	},

	logout: async () => {
		set({ isLoggingOut: true });

		try {
			await logoutApi();
			set({ user: null, isLoggingIn: false, isRegistering: false });
		} catch (error) {
			throw error;
		} finally {
			set({ isLoggingOut: false });
		}
	}
}));
