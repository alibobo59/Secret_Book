import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { User, Settings, Package, Shield, LogOut, X } from "lucide-react";

<<<<<<< HEAD
const UserProfileDropdown = ({ className = "", isMobile = false, onClose }) => {
=======
const UserProfileDropdown = ({ className = "" }) => {
>>>>>>> safety-checkpoint
  const { user, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    if (onClose) onClose(); // For mobile menu
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    if (onClose) onClose(); // For mobile menu
  };

  // Helper function to get user initial safely
  const getUserInitial = () => {
    if (
      !user?.name ||
      typeof user.name !== "string" ||
      user.name.length === 0
    ) {
      return "?"; // Fallback character
    }
    return user.name.charAt(0).toUpperCase();
  };

  if (!user) {
    return null;
  }

  // Mobile version - render as inline content
  if (isMobile) {
    return (
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium uppercase">
            {user.name.charAt(0)}
          </div>
          <span className="font-medium text-gray-800 dark:text-white text-sm">
            {user.name}
          </span>
        </div>
        <div className="flex flex-col space-y-3">
          <Link
            to={`/profile/${user.username}`}
            className="text-gray-700 dark:text-gray-300 text-sm"
            onClick={handleLinkClick}>
            Profile
          </Link>
          <Link
            to="/my-books"
            className="text-gray-700 dark:text-gray-300 text-sm"
            onClick={handleLinkClick}>
            My Books
          </Link>
          <Link
            to="/orders"
            className="text-gray-700 dark:text-gray-300 text-sm"
            onClick={handleLinkClick}>
            My Orders
          </Link>
          {isAdmin() && (
            <Link
              to="/admin"
              className="text-gray-700 dark:text-gray-300 text-sm"
              onClick={handleLinkClick}>
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-left text-red-600 dark:text-red-500 text-sm">
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Desktop version - existing dropdown code
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
<<<<<<< HEAD
        aria-label="User profile menu">
=======
        aria-label="Menu hồ sơ người dùng">
>>>>>>> safety-checkpoint
        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium uppercase">
          {getUserInitial()}
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium uppercase text-xs">
                  {getUserInitial()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                    {user?.name || "Unknown User"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{user?.username || "unknown"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                to={`/profile/${user?.username || "unknown"}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <User className="h-4 w-4" />
                Hồ sơ
              </Link>
<<<<<<< HEAD
=======

>>>>>>> safety-checkpoint
              <Link
                to="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Package className="h-4 w-4" />
                Đơn hàng của tôi
              </Link>

<<<<<<< HEAD
              {isAdmin() && ( // Change from user.isAdmin to isAdmin()
=======
              {isAdmin() && (
>>>>>>> safety-checkpoint
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Shield className="h-4 w-4" />
                  Bảng điều khiển quản trị
                </Link>
              )}
<<<<<<< HEAD
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
=======

              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

>>>>>>> safety-checkpoint
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfileDropdown;
