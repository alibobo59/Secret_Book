import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { User, Mail, Lock, UserPlus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Trường này là bắt buộc";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Trường này là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Vui lòng nhập địa chỉ email hợp lệ";
    }
    
    // Password validation
    if (!formData.password.trim()) {
      errors.password = "Trường này là bắt buộc";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    
    // Password confirmation validation
    if (!formData.password_confirmation.trim()) {
      errors.password_confirmation = "Trường này là bắt buộc";
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = "Mật khẩu xác nhận không khớp";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    
    // First layer: Frontend validation
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.password_confirmation
      );
      navigate("/");
    } catch (error) {
      // Second layer: Backend validation error handling
      if (error.response && error.response.status === 422) {
        // Handle Laravel validation errors
        const backendErrors = error.response.data.errors || {};
        const newValidationErrors = {};
        
        // Map backend field errors to frontend validation errors
        if (backendErrors.name) {
          newValidationErrors.name = backendErrors.name[0];
        }
        if (backendErrors.email) {
          newValidationErrors.email = backendErrors.email[0];
        }
        if (backendErrors.password) {
          newValidationErrors.password = backendErrors.password[0];
        }
        if (backendErrors.password_confirmation) {
          newValidationErrors.password_confirmation = backendErrors.password_confirmation[0];
        }
        
        setValidationErrors(newValidationErrors);
        
        // If there are no field-specific errors, show general message
        if (Object.keys(newValidationErrors).length === 0) {
          setError(error.response.data.message || "Dữ liệu không hợp lệ");
        }
      } else {
        // Handle other types of errors (401, 500, etc.)
        const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi khi đăng ký";
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
            Đăng Ký
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Tạo tài khoản mới để bắt đầu hành trình đọc sách
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Họ và Tên
            </label>
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white ${
                  validationErrors.name
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Nhập họ và tên của bạn"
              />
              <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="text"
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white ${
                  validationErrors.email
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Nhập địa chỉ email của bạn"
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
              Mật Khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white ${
                  validationErrors.password
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Tạo mật khẩu mạnh"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Xác Nhận Mật Khẩu
            </label>
            <div className="relative">
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 pl-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white ${
                  validationErrors.password_confirmation
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Nhập lại mật khẩu"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {validationErrors.password_confirmation && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {validationErrors.password_confirmation}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label
              htmlFor="terms"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Tôi đồng ý với{" "}
              <Link
                to="/terms"
                className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400">
                Điều Khoản Dịch Vụ
              </Link>{" "}
              và{" "}
              <Link
                to="/privacy"
                className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400">
                Chính Sách Bảo Mật
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-400 disabled:cursor-not-allowed transition-colors">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                Đăng Ký
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400">
            Đăng Nhập
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
