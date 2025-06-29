import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Clear errors only when form is submitted or manually triggered
  const clearErrors = () => {
    setError("");
    setValidationErrors({});
  };
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const from = location.state?.from?.pathname || "/";

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!email.trim()) {
      errors.email = t("form.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t("form.error.email");
    }
    
    // Password validation
    if (!password.trim()) {
      errors.password = t("form.required");
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    clearErrors();

    // First layer: Frontend validation
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // Second layer: Backend validation error handling
      if (error.response && error.response.status === 422) {
        // Xử lý lỗi validation từ Laravel (theo từng trường)
        const backendErrors = error.response.data.errors || {};
        const newValidationErrors = {};

        // Ánh xạ lỗi từ backend sang frontend
        if (backendErrors.email) {
          newValidationErrors.email = backendErrors.email[0];
        }
        if (backendErrors.password) {
          newValidationErrors.password = backendErrors.password[0];
        }
        
        setValidationErrors(newValidationErrors);
        
        // Nếu không có lỗi cụ thể theo trường, hiển thị thông báo chung
        if (Object.keys(newValidationErrors).length === 0) {
          setError(error.response.data.message || t("message.error.validation"));
        }
      } else if (error.response && error.response.status === 401) {
        // Xử lý lỗi xác thực (thông tin đăng nhập không hợp lệ)
        const errorMessage = error.response.data.message || t("login.error.invalidCredentials");
        setError(errorMessage);
        // Don't clear form fields - let user correct their input
      } else {
        // Xử lý các loại lỗi khác (500, lỗi mạng, v.v.)
        const errorMessage = error.response?.data?.message || error.message || t("message.error.login");
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white">
            {t("login.title")}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("login.subtitle")}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("user.email")}
            </label>
            <div className="relative">
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white ${
                  validationErrors.email
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder={t("form.email.placeholder")}
              />
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("user.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white ${
                  validationErrors.password
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder={t("form.password.placeholder")}
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t("login.remember")}
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400">
              {t("login.forgot")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-400 disabled:cursor-not-allowed transition-colors">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                {t("nav.login")}
              </>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {t("common.or")}
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t("login.noAccount")}{" "}
          <Link
            to="/register"
            className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400">
            {t("login.register")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
