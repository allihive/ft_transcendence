import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLang from "~/utils/i18n/en/en.json";
import esLang from "~/utils/i18n/es/es.json";

i18n
	.use(initReactI18next)
	.init({
		resources: {
			en: {
				translation: enLang,
			},
			es: {
				translation: esLang,
			},
		},
		lng: "en", // default language
		fallbackLng: "en",
		interpolation: {
			escapeValue: false, // React already escapes
		},
	});

export default i18n;
