import { create } from "zustand";
import i18n from "~/utils/i18n"; // Make sure it's initialized before this is used

interface LanguageState {
	language: string;
	setLanguage: (lang: string) => Promise<void>;
}


export const useLanguageStore = create<LanguageState>((set) => ({
	language: i18n.language ?? "en", // Use nullish coalescing for safety
	setLanguage: async (lang) => {
		// await i18n.changeLanguage(lang);
		await i18n.changeLanguage(lang); // e.g., "fi"
		// localStorage.setItem("language", lang);
		set({ language: lang });
		
	},
}));





// stores/languageStore.ts

// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import i18n from "~/utils/i18n";

// interface LanguageState {
//   language: string;
//   setLanguage: (lang: string) => Promise<void>;
// }

// // Only create store on client to avoid SSR localStorage error
// export const useLanguageStore = create<LanguageState>()(
//   persist(
//     (set) => ({
//       language: "en",
//       setLanguage: async (lang) => {
//         await i18n.changeLanguage(lang);
//         set({ language: lang });
//       },
//     }),
//     {
//       name: "language-storage", // key in localStorage
//     }
//   )
// );