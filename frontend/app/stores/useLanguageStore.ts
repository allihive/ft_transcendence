import { create } from "zustand";
import i18n from "~/utils/index"; // Make sure it's initialized before this is used

interface LanguageState {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: i18n.language ?? "en", // Use nullish coalescing for safety
  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
}));
