
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

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
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage && Object.keys(languageNames).includes(savedLanguage) 
      ? savedLanguage 
      : 'es';
  });
  
  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);
  
  // Translation function
  const t = (key: string): string => {
    try {
      // Dynamically import the translations
      const translations = require(`../translations/${language}.json`);
      // Get nested keys like 'header.title'
      return key.split('.').reduce((obj, i) => obj[i], translations) || key;
    } catch (error) {
      console.error(`Translation error for key "${key}" in ${language}:`, error);
      return key;
    }
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
