import React, { createContext, useState, useContext, useEffect } from "react";
import { enTranslations } from "../translations/en";
import { viTranslations } from "../translations/vi";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage or default to English
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("language");
    return savedLanguage || "en";
  });

  // Get translations based on current language
  const translations = language === "en" ? enTranslations : viTranslations;

  // Function to change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // Function to get translation for a key
  const t = (key) => {
    return translations[key] || key;
  };

  useEffect(() => {
    // Update html lang attribute when language changes
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
