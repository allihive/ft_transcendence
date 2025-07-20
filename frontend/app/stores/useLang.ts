import { create } from "zustand";
import i18n from "~/utils/i18n/index";
import { persist } from "zustand/middleware"


interface LanguageState {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create(
	persist<LanguageState>(
		(set) => ({
 			language: i18n.language || "en",
			setLanguage: (lang) => {
				i18n.changeLanguage(lang);
				set({ language: lang });
		},
		}),
		{
			name: "user-language",
		}
	)
);
