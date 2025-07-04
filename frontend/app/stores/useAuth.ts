import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from "../api/types";

// export const fetchCurrentUser = async (): Promise<User> => {
// 	return fetchJson<User>(`${import.meta.env.VITE_API_BASE_URL}/users`, {
// 		method: "GET",
// 		headers: {
// 			"Content-Type": "application/json",
// 		},
// 		})
// 	https://medium.com/@jkc5186/managing-user-sessions-with-zustand-in-react-5bf30f6bc536}

type AuthState = {
	user: User | null;
	setUser: (user: User | null) => void;
	logout: () => void;
}

export const useAuth = create<AuthState>()(
	persist<AuthState>(
		(set) => ({
			user: null,
			setUser: (user) => set({user}),
			logout: () => set({user: null}),
		}),
		{
			name: "user-session",
			storage: createJSONStorage(() => localStorage)
		}
	)
);
