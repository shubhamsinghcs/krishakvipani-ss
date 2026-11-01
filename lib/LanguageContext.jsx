"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { defaultLanguage, supportedLanguages, languageOptions, translations } from "@/lib/i18n";

const STORAGE_KEY = "krishakvipani-lang";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(defaultLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let initial = defaultLanguage;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) || (() => {
        const c = document.cookie.split(";").map((s) => s.trim()).find((s) => s.startsWith("krishakvipani_lang="));
        return c ? c.split("=")[1] : null;
      })();

      if (saved && supportedLanguages.includes(saved)) {
        initial = saved;
      } else {
        // If there was an invalid/unsupported language stored, clean it up and reset to default
        if (saved && !supportedLanguages.includes(saved)) {
          window.localStorage.setItem(STORAGE_KEY, defaultLanguage);
          document.cookie = `krishakvipani_lang=${defaultLanguage}; path=/; max-age=${60 * 60 * 24 * 365}`;
        }
        if (i18n.language && supportedLanguages.includes(i18n.language)) {
          initial = i18n.language;
        } else {
          initial = defaultLanguage;
        }
      }
    } catch (e) {}

    setLang(initial);
    if (i18n.language !== initial) {
      i18n.changeLanguage(initial);
    }
    try {
      document.documentElement.lang = initial;
    } catch (e) {}
  }, []);

  const changeLang = (next) => {
    // If not supported, gracefully resolve to defaultLanguage
    const target = supportedLanguages.includes(next) ? next : defaultLanguage;
    setLang(target);
    if (i18n.language !== target) {
      i18n.changeLanguage(target);
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, target);
      document.cookie = `krishakvipani_lang=${target}; path=/; max-age=${60 * 60 * 24 * 365}`;
      document.documentElement.lang = target;
    } catch (e) {}
  };

  useEffect(() => {
    const handleLanguageChanged = (newLang) => {
      const target = supportedLanguages.includes(newLang) ? newLang : defaultLanguage;
      if (target !== lang) {
        setLang(target);
        try {
          window.localStorage.setItem(STORAGE_KEY, target);
          document.cookie = `krishakvipani_lang=${target}; path=/; max-age=${60 * 60 * 24 * 365}`;
          document.documentElement.lang = target;
        } catch (e) {}
      }
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [lang]);

  const value = useMemo(() => {
    const effectiveLang = supportedLanguages.includes(lang) ? lang : defaultLanguage;
    const tObj = translations[effectiveLang] || translations[defaultLanguage];
    const defaultObj = translations[defaultLanguage];

    const tFunc = (key, options) => {
      if (!key) return "";
      try {
        if (i18n.isInitialized) {
          const res = i18n.t(key, { lng: effectiveLang, ...options });
          if (res !== key && res !== undefined) return res;
        }
      } catch (e) {}

      const primary = key.split(".").reduce((o, i) => o?.[i], tObj);
      if (primary !== undefined) return primary;
      const fallback = key.split(".").reduce((o, i) => o?.[i], defaultObj);
      return fallback !== undefined ? fallback : key;
    };

    // Assign properties to support both t("namespace.key") and t.namespace?.key
    Object.assign(tFunc, defaultObj, tObj);

    return {
      lang: effectiveLang,
      changeLang,
      setLang: changeLang,
      t: tFunc,
      i18n,
      languageOptions,
      supportedLanguages,
      defaultLanguage,
    };
  }, [lang]);

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLang must be used within LanguageProvider");
  }
  return context;
}

export function useLanguage() {
  return useLang();
}

export default LanguageContext;
