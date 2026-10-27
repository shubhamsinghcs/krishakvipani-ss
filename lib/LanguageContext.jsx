"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultLanguage, translations } from "@/lib/i18n";

const STORAGE_KEY = "krishakvipani-lang";
const supported = ["en", "hi", "pa", "bn", "gu", "mr", "ta", "te", "kn", "ml", "or", "as", "ur", "sa", "ks", "ne", "sd", "kok", "mai", "mni", "doi", "brx"];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(defaultLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = window.localStorage.getItem(STORAGE_KEY) || (() => {
      try {
        const c = document.cookie.split(";").map((s) => s.trim()).find((s) => s.startsWith("krishakvipani_lang="));
        return c ? c.split("=")[1] : null;
      } catch (e) {
        return null;
      }
    })();

    const initial = saved && supported.includes(saved) ? saved : defaultLanguage;
    setLang(initial);
    try {
      document.documentElement.lang = initial;
    } catch (e) {}
  }, []);

  const changeLang = (next) => {
    if (!supported.includes(next)) return;
    setLang(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `krishakvipani_lang=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
      document.documentElement.lang = next;
    } catch (e) {}
  };

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
      document.cookie = `krishakvipani_lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch (e) {}
  }, [lang]);

  const value = useMemo(() => {
    const tObj = translations[lang] || translations[defaultLanguage];
    const defaultObj = translations[defaultLanguage];
    const tFunc = (key) => {
      if (!key) return "";
      const primary = key.split('.').reduce((o, i) => o?.[i], tObj);
      if (primary !== undefined) return primary;
      return key.split('.').reduce((o, i) => o?.[i], defaultObj);
    };
    // Assign all properties of tObj to tFunc so existing t.common.appName works
    Object.assign(tFunc, defaultObj, tObj);
    
    return {
      lang,
      changeLang,
      setLang: changeLang, // Alias for new requirement
      t: tFunc,
    };
  }, [lang]);

  // Wrap in a div that prevents visibility until mounted to avoid hydration errors
  return (
    <LanguageContext.Provider value={value}>
      <div style={!mounted ? { visibility: "hidden" } : { display: "contents" }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLang must be used within LanguageProvider");
  }
  return context;
}

// Alias for new requirement
export function useLanguage() {
  return useLang();
}
