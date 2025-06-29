import React, { createContext, useContext, useEffect } from "react";
import { viTranslations } from "../translations/vi";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // Set Vietnamese as the default and only language
  const language = "vi";
  const translations = viTranslations;

  // Function to get translation for a key
  const t = (key) => {
    return translations[key] || key;
  };

  // Set html lang attribute to Vietnamese
  useEffect(() => {
    document.documentElement.lang = "vi";
  }, []);

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
