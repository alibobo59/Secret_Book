import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useBook } from "../../contexts/BookContext";
import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import BookCard from "../../components/client/BookCard";


const HomePage = () => {
  const { books, categories, loading, error } = useBook();
  const [searchQuery, setSearchQuery] = React.useState("");


  useEffect(() => {
    console.log(
      "HomePage updated - books:",
      books,
      "categories:",
      categories,
      "loading:",
      loading,
      "error:",
      error
    );
  }, [books, categories, loading, error]);

  const featuredBooks = React.useMemo(() => {
    console.log("Computing featuredBooks, books length:", books?.length);
    if (!books) return [];
    return [...books].slice(0, 5);
  }, [books]);

  const newReleases = React.useMemo(() => {
    console.log("Computing newReleases, books length:", books?.length);
    if (!books) return [];
    return [...books].slice(5, 10); // Adjusted to avoid duplicating featuredBooks
  }, [books]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/books?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-700 to-amber-500 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Khám Phá Thế Giới Sách
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Tìm kiếm và đọc những cuốn sách yêu thích của bạn
            </p>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
              <input
                type="text"
                placeholder="Tìm kiếm sách, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 px-5 pl-12 rounded-full bg-white bg-opacity-20 backdrop-blur-sm text-white placeholder-white placeholder-opacity-75 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:bg-opacity-30 transition-all duration-200"
              />
              <Search className="absolute left-4 top-3.5 h-6 w-6 text-white" />
              <button
                type="submit"
                className="absolute right-3 top-3 bg-white text-amber-600 rounded-full p-1.5 hover:bg-opacity-90 transition-colors duration-200">
                <ChevronRight className="h-5 w-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {error && (
        <section className="py-8 bg-red-100 dark:bg-red-900">
          <div className="container mx-auto px-4 text-center">
            <p className="text-red-800 dark:text-red-200">
              Lỗi tải dữ liệu: {error}
            </p>
          </div>
        </section>
      )}

      {/* Featured Books Section */}
      <section className="py-16 bg-amber-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white">
              Sách Nổi Bật
            </h2>
            <Link
              to="/books"
              className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium flex items-center">
              Xem Tất Cả
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-96 animate-pulse">
                  <div className="h-52 bg-gray-300 dark:bg-gray-700 rounded-md mb-4"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : featuredBooks.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Không có sách nào (Debug: books length: {books.length})
            </p>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}>
              {featuredBooks.map((book) => (
                <motion.div key={book.id} variants={itemVariants}>
                  <BookCard book={book} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white mb-8">
            Danh Mục
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Không có danh mục nào (Debug: categories length: 
              {categories.length})
            </p>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}>
              {categories.map((category) => (
                <motion.div key={category.id} variants={itemVariants}>
                  <Link
                    to={`/books?category=${category.id}`}
                    className="block h-32 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-800 rounded-lg overflow-hidden relative group">
                    <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-white text-xl font-bold">
                        {category.name}
                      </h3>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronRight className="h-5 w-5 text-white" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* New Releases Section */}
      <section className="py-16 bg-amber-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white">
              Sách Mới
            </h2>
            <Link
              to="/new-releases"
              className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium flex items-center">
              Xem Tất Cả
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-96 animate-pulse">
                  <div className="h-52 bg-gray-300 dark:bg-gray-700 rounded-md mb-4"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : newReleases.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Không có sách nào (Debug: newReleases length: 
              {newReleases.length})
            </p>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}>
              {newReleases.map((book) => (
                <motion.div key={book.id} variants={itemVariants}>
                  <BookCard book={book} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Join Community Section */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            <h2 className="text-3xl font-serif font-bold mb-6">
              Tham Gia Cộng Đồng Độc Giả
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Kết nối với những người yêu sách và chia sẻ trải nghiệm đọc
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-white text-teal-600 font-medium rounded-full hover:bg-opacity-90 transition-colors duration-200">
              Đăng Ký Ngay
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
