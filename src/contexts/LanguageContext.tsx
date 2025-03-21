
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import enTranslations from '../translations/en.json';
import esTranslations from '../translations/es.json';
import frTranslations from '../translations/fr.json';
import ptTranslations from '../translations/pt.json';
import deTranslations from '../translations/de.json';

// Define supported languages
export type Language = 'es' | 'en' | 'fr' | 'pt' | 'de';

// Language names for the selector
export const languageNames: Record<Language, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch',
};

// Define type for the translations
type TranslationsType = Record<string, any>;

// Store all translations
const translations: Record<Language, TranslationsType> = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  pt: ptTranslations,
  de: deTranslations,
};

// Define context type
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Try to get language from localStorage or default to Spanish
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage && Object.keys(languageNames).includes(savedLanguage) 
      ? savedLanguage 
      : 'es';
  });
  
  // Create a setter function that forces re-rendering
  const setLanguage = (newLanguage: Language) => {
    console.log(`Setting language to: ${newLanguage}`);
    setLanguageState(newLanguage);
  };
  
  // Update localStorage when language changes
  useEffect(() => {
    console.log(`Language changed to: ${language}`);
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);
  
  // Translation function
  const t = (key: string): string => {
    try {
      // Get nested keys like 'header.title'
      const keys = key.split('.');
      let result: any = translations[language];
      
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          // Key not found
          console.warn(`Translation key not found: ${key} in ${language}`);
          return key;
        }
      }
      
      if (typeof result !== 'string') {
        console.warn(`Translation result is not a string for key: ${key} in ${language}`);
        return key;
      }
      
      return result;
    } catch (error) {
      console.error(`Translation error for key "${key}" in ${language}:`, error);
      return key;
    }
  };
  
  // Force re-render on language change
  const contextValue = React.useMemo(() => {
    return { language, setLanguage, t };
  }, [language]);
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
