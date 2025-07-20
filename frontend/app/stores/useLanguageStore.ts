import { create } from "zustand";
import i18n from "~/utils/i18n"; // Make sure it's initialized before this is used

interface LanguageState {
	language: string;
	setLanguage: (lang: string) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
	language: i18n.language ?? "en", // Use nullish coalescing for safety
	setLanguage: async (lang) => {
		await i18n.changeLanguage(lang);
		set({ language: lang });
	},
}));
