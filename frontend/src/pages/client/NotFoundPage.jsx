import React from "react";
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const NotFoundPage = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-6xl md:text-8xl font-bold text-amber-600 dark:text-amber-500 mb-6">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 dark:text-white mb-4">
        {t("pageNotFound")}
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        {t("pageNotFoundMessage")}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
          <Home className="h-5 w-5" />
          {t("backToHome")}
        </Link>
        <Link
          to="/books"
          className="flex items-center justify-center gap-2 px-6 py-3 border border-amber-600 text-amber-600 dark:text-amber-500 rounded-md hover:bg-amber-50 dark:hover:bg-gray-800 transition-colors">
          <Search className="h-5 w-5" />
          {t("browseBooks")}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
