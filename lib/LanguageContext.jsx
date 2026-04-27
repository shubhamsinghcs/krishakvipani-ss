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
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && supported.includes(saved)) {
      setLang(saved);
    }
  }, []);

  const changeLang = (next) => {
    if (!supported.includes(next)) return;
    setLang(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

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
