import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Moon,
  Sun,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

import NotificationDropdown from "../common/NotificationDropdown";

const AdminHeader = ({ isSidebarCollapsed }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize darkMode state based on localStorage or system preference
    if (typeof window !== "undefined") {
      return (
        localStorage.theme === "dark" ||
        (!localStorage.theme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Apply initial theme
    document.documentElement.classList.toggle("dark", darkMode);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e) => {
      if (!localStorage.theme) {
        setDarkMode(e.matches);
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };

    window.addEventListener("scroll", handleScroll);
    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      localStorage.theme = "dark";
      document.documentElement.classList.add("dark");
    } else {
      localStorage.theme = "light";
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <>
      <header
        className={`sticky top-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white dark:bg-gray-800 shadow-md"
            : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        } py-1 px-4 w-full`}>
        <div className="flex items-center justify-between h-12">
          {/* Left side - Title visible only when sidebar is collapsed */}
          {isSidebarCollapsed && (
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-amber-600">
                Bảng Điều Khiển Quản Trị
              </h1>
            </div>
          )}

          {/* Right side items */}
          <div className="flex items-center space-x-4 ml-auto">


            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }>
              {darkMode ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User profile */}
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-medium overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0) || "A"
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                  {user?.name || "Admin"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-300 hidden sm:block" />
              </button>

              {/* Profile dropdown menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <Link
                    to="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Hồ Sơ
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Cài Đặt
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng Xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;
