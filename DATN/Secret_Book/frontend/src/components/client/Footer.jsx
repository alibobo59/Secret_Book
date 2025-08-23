import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Facebook, Twitter, Instagram, Mail } from "lucide-react";


const Footer = () => {
  const currentYear = new Date().getFullYear();


  return (
    <footer className="bg-gray-100 dark:bg-gray-800 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and about */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-amber-600 dark:text-amber-500" />
              <span className="ml-2 text-2xl font-serif font-bold text-gray-800 dark:text-white">
                Secret Book
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Khám phá thế giới sách cùng chúng tôi
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200"
                aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200"
                aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200"
                aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Liên Kết Nhanh
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/books"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Sách
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Danh Mục
                </Link>
              </li>
              <li>
                <Link
                  to="/recommendations"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Sách Bán Chạy
                </Link>
              </li>
              <li>
                <Link
                  to="/bestsellers"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Sách Bán Chạy
                </Link>
              </li>
              <li>
                <Link
                  to="/new-releases"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Sách Mới
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Tài Khoản
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Đăng Nhập
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Đăng Ký
                </Link>
              </li>
              <li>
                <Link
                  to="/my-books"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Đơn Hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Đơn Hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Danh Sách Yêu Thích
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Hỗ Trợ
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Hỗ Trợ
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Vận Chuyển
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Đổi Trả
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200">
                  Chính Sách Bảo Mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
              Đăng ký nhận tin tức mới nhất
            </h3>
            <form className="flex">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-grow py-2 px-4 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                required
              />
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-r-md transition-colors duration-200">
                Đăng Ký
              </button>
            </form>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              Nhận thông tin về sách mới và ưu đãi đặc biệt.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; {currentYear} Secret Book. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
