import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const LoginPage = () => {
  // --- LOGGING ---
  console.log("%cLoginPage is rendering...", "color: orange");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  // --- LOGGING ---
  // This is the MOST IMPORTANT log. It will tell us if the component is being reset.
  useEffect(() => {
    console.log("%cLoginPage MOUNTED", "color: green; font-weight: bold;");
    return () => {
      console.log("%cLoginPage UNMOUNTED", "color: red; font-weight: bold;");
    };
  }, []); // Empty dependency array means this runs only once on mount/unmount.

  // --- LOGGING ---
  // Log the state on every render to see how it changes.
  console.log("%cCurrent State:", "color: orange", {
    authLoading,
    error,
    user,
  });

  useEffect(() => {
    // --- LOGGING ---
    console.log("%cRedirect useEffect is checking...", "color: cyan", {
      authLoading,
      user,
      error,
    });
    // Only redirect if user exists and is authenticated (don't check error state)
    if (!authLoading && user) {
      console.log(
        "%c--> Redirecting because user exists!",
        "color: cyan; font-weight: bold;"
      );
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Vui lòng nhập địa chỉ email hợp lệ";
    }
    
    // Password validation
    if (!password.trim()) {
      errors.password = "Mật khẩu là bắt buộc";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("%c--- handleSubmit initiated ---", "font-weight: bold;");
    setError("");
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      console.log(
        "%cLoginPage: Calling login() from context...",
        "color: blue"
      );
      await login(email, password);
      console.log(
        "%cLoginPage: login() SUCCEEDED (this should not happen on failure)",
        "color: green"
      );
    } catch (err) {
      // --- LOGGING ---
      console.log(
        "%cLoginPage: CAUGHT error in handleSubmit",
        "color: red; font-weight: bold;",
        err
      );
      const errorMessage =
        err.response?.data?.message || err.message || "Lỗi đăng nhập";
      console.log(
        `%cLoginPage: Setting error state to: "${errorMessage}"`,
        "color: red"
      );
      setError(errorMessage);
    }
  };

  return (
    // ... your JSX is fine, no changes needed ...
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white">
            Đăng Nhập
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Chào mừng bạn trở lại
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
              Email
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
                placeholder="Nhập email của bạn"
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
              Mật khẩu
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
                placeholder="Nhập mật khẩu của bạn"
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
                Ghi nhớ đăng nhập
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-400 disabled:cursor-not-allowed transition-colors">
            {authLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Đăng Nhập
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
              Hoặc
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400">
            Đăng ký ngay
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
