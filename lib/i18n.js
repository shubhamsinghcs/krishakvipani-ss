import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import pa from "@/locales/pa.json";

export const defaultLanguage = "en";

export const supportedLanguages = ["en", "hi", "pa"];

export const languageOptions = [
  { key: "en", code: "en", label: "English", name: "English" },
  { key: "hi", code: "hi", label: "हिंदी", name: "हिन्दी" },
  { key: "pa", code: "pa", label: "ਪੰਜਾਬੀ", name: "ਪੰਜਾਬੀ" },
];

export const translations = {
  en,
  hi,
  pa,
};

export const resources = {
  en: { translation: en },
  hi: { translation: hi },
  pa: { translation: pa },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: defaultLanguage,
      supportedLngs: supportedLanguages,
      load: "languageOnly",
      nonExplicitSupportedLngs: true,
      detection: {
        order: ["cookie", "localStorage", "navigator", "htmlTag"],
        lookupCookie: "krishakvipani_lang",
        lookupLocalStorage: "krishakvipani-lang",
        caches: ["cookie", "localStorage"],
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

/**
 * Direct translation lookup helper for compatibility
 */
export function t(key, lang = defaultLanguage) {
  if (!key) return "";
  const effectiveLang = supportedLanguages.includes(lang) ? lang : defaultLanguage;
  const targetDict = translations[effectiveLang] || translations[defaultLanguage];
  const defaultDict = translations[defaultLanguage];

  const primary = key.split(".").reduce((o, i) => o?.[i], targetDict);
  if (primary !== undefined) return primary;

  const fallback = key.split(".").reduce((o, i) => o?.[i], defaultDict);
  return fallback !== undefined ? fallback : key;
}

export default i18n;
