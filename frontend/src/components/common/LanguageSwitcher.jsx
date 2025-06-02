import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center"
        aria-label={t("language.select")}>
        <Globe className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {language === "en" ? t("language.en") : t("language.vi")}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleLanguageChange("en")}
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
              language === "en"
                ? "text-amber-600 dark:text-amber-500 font-medium"
                : "text-gray-700 dark:text-gray-300"
            }`}>
            {t("language.en")}
          </button>
          <button
            onClick={() => handleLanguageChange("vi")}
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
              language === "vi"
                ? "text-amber-600 dark:text-amber-500 font-medium"
                : "text-gray-700 dark:text-gray-300"
            }`}>
            {t("language.vi")}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
