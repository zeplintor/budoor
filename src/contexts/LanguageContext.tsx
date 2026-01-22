"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { type Locale, defaultLocale, locales, isRTL } from "@/i18n/config";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);

  useEffect(() => {
    // Read locale from cookie on mount
    const cookieLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="))
      ?.split("=")[1] as Locale | undefined;

    if (cookieLocale && locales.includes(cookieLocale)) {
      setLocaleState(cookieLocale);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setLocaleState(newLocale);
    // Reload to apply new locale
    window.location.reload();
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        isRTL: isRTL(locale),
      }}
    >
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
