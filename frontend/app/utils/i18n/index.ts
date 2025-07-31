import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLang from "~/utils/i18n/en/en.json";
import esLang from "~/utils/i18n/es/es.json";
import fiLang from "~/utils/i18n/fi/fi.json";

const getSavedLang = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("language") || "en";
  }
  return "en"; // default for SSR
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enLang },
      es: { translation: esLang },
      fi: { translation: fiLang },
    },
    lng: getSavedLang(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'span'],
    },
  });

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lng);
  }
});

export default i18n;