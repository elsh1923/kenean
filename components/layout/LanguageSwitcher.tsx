"use client";

import { useLanguage } from "@/components/providers/LanguageContext";
import { languages, Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Globe, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher() {
  const { language, setLanguage, isReady } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isReady) return null;

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-secondary text-sm font-medium transition-all group border border-border/50"
      >
        <Globe className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
        <span className="uppercase">{language}</span>
        <span className="text-lg leading-none">{currentLang.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 p-1.5 bg-card border border-border rounded-xl shadow-xl min-w-[140px] z-[60] animate-in fade-in zoom-in-95 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all",
                language === lang.code
                  ? "bg-accent/10 text-accent font-bold"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {language === lang.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
