import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Sun, Moon, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import NotificationDropdown from '../common/NotificationDropdown';
import UserProfileDropdown from '../common/UserProfileDropdown';

const Header = () => {
  const { user } = useAuth();
  const { getItemCount } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('darkMode')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-300 ${
      isScrolled ? 'shadow-md' : 'shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              BookStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/books"
              className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
            >
              {t('nav.books')}
            </Link>
            <Link
              to="/categories"
              className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
            >
              {t('nav.categories')}
            </Link>
            <Link
              to="/recommendations"
              className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
            >
              {t('nav.recommendations')}
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">


            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label={isDarkMode ? t('theme.light') : t('theme.dark')}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            {user && <NotificationDropdown />}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* User Profile or Login */}
            {user ? (
              <UserProfileDropdown />
            ) : (
              <Link
                to="/login"
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                {t('auth.login')}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>



            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                to="/books"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {t('nav.books')}
              </Link>
              <Link
                to="/categories"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {t('nav.categories')}
              </Link>
              <Link
                to="/recommendations"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {t('nav.recommendations')}
              </Link>
            </nav>

            {/* Mobile Cart */}
            <Link
              to="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 mt-4 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span>{t('nav.cart')}</span>
              {getItemCount() > 0 && (
                <span className="bg-amber-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-between w-full px-3 py-2 mt-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span>{isDarkMode ? t('theme.light') : t('theme.dark')}</span>
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Mobile User Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to={`/profile/${user.username}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {t('nav.orders')}
                  </Link>
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      // logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    {t('auth.logout')}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-center bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  >
                    {t('auth.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-center border border-amber-600 text-amber-600 dark:text-amber-500 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-medium"
                  >
                    {t('auth.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;