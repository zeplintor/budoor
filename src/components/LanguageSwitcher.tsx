"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "dropdown" | "buttons";
  className?: string;
}

export function LanguageSwitcher({ variant = "dropdown", className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  if (variant === "buttons") {
    return (
      <div className={`flex gap-2 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              locale === loc
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-gray-500" />
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="appearance-none bg-transparent pr-6 py-1 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none"
        >
          {locales.map((loc) => (
            <option key={loc} value={loc}>
              {localeNames[loc]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
