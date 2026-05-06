'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../constants/translations';

type Language = keyof typeof translations;

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('sq');

  // Ruaj gjuhën në localStorage që ta mbajë mend kur bën refresh
  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};