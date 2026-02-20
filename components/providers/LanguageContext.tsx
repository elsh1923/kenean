"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, i18nDict, i18nDictType } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dict: i18nDictType[Language];
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("kenean-language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "am" || savedLang === "gz")) {
      setLanguageState(savedLang);
    }
    setIsReady(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("kenean-language", lang);
    document.cookie = `kenean-language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    // Force a refresh or router replacement to update server components
    window.location.reload();
  };

  const dict = i18nDict[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dict, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
