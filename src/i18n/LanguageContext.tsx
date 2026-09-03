import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, LanguageOption } from '../types.ts';
import frJson from './fr.json';
import mgJson from './mg.json';
import enJson from './en.json';

const translations: Record<Language, Record<string, unknown>> = {
  fr: frJson,
  mg: mgJson,
  en: enJson,
};

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷', short: 'FR' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy', flag: '🇲🇬', short: 'MG' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', short: 'EN' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  currentLanguageOption: LanguageOption;
  availableLanguages: LanguageOption[];
}

const STORAGE_KEY = 'aviator_signal_language';
const USER_PROFILE_KEY = 'aviator_signal_user';

function detectInitialLanguage(): Language {
  // 1. Check local storage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fr' || saved === 'mg' || saved === 'en') {
      return saved;
    }
  } catch {
    // ignore
  }

  // 2. Check browser navigator language
  try {
    const navLang = (navigator.language || (navigator as { userLanguage?: string }).userLanguage || '').toLowerCase();
    if (navLang.startsWith('mg')) return 'mg';
    if (navLang.startsWith('fr')) return 'fr';
    if (navLang.startsWith('en')) return 'en';
  } catch {
    // ignore
  }

  // Default to French as primary language requested
  return 'fr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  const currentLanguageOption = AVAILABLE_LANGUAGES.find((l) => l.code === language) || AVAILABLE_LANGUAGES[0];

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      
      // Also synchronize into persisted user profile preferences (Supabase/local profile)
      const rawUser = localStorage.getItem(USER_PROFILE_KEY);
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        parsedUser.preferredLanguage = newLang;
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(parsedUser));
        window.dispatchEvent(new CustomEvent('aviator_user_updated', { detail: parsedUser }));
      }
    } catch (e) {
      console.error('Error saving language:', e);
    }
  }, []);

  // Synchronize on mount if user had a preferred language saved in profile
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(USER_PROFILE_KEY);
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        if (parsedUser?.preferredLanguage && ['fr', 'mg', 'en'].includes(parsedUser.preferredLanguage)) {
          setLanguageState(parsedUser.preferredLanguage);
          localStorage.setItem(STORAGE_KEY, parsedUser.preferredLanguage);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split('.');
      let currentVal: unknown = translations[language];

      for (const k of keys) {
        if (currentVal && typeof currentVal === 'object' && k in (currentVal as Record<string, unknown>)) {
          currentVal = (currentVal as Record<string, unknown>)[k];
        } else {
          // fallback to French
          let fallbackVal: unknown = translations.fr;
          for (const fk of keys) {
            if (fallbackVal && typeof fallbackVal === 'object' && fk in (fallbackVal as Record<string, unknown>)) {
              fallbackVal = (fallbackVal as Record<string, unknown>)[fk];
            } else {
              fallbackVal = undefined;
              break;
            }
          }
          currentVal = fallbackVal;
          break;
        }
      }

      if (typeof currentVal === 'string') {
        let result = currentVal;
        if (params) {
          Object.entries(params).forEach(([paramKey, paramValue]) => {
            result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
          });
        }
        return result;
      }

      return path;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageOption,
        availableLanguages: AVAILABLE_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
