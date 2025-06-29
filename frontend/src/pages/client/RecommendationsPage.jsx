import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBook } from "../../contexts/BookContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Filter,
  SortAsc,
  Heart,
  TrendingUp,
  BookOpen,
  Star,
  Sparkles,
  User,
  RefreshCw,
  Brain,
  Target,
  Clock,
} from "lucide-react";
import BookCard from "../../components/books/BookCard";

const RecommendationsPage = () => {
  const { user } = useAuth();
  const { books } = useBook();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "for-you";

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("relevance");
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => {
    loadRecommendations();
  }, [type, user, books]);

  const loadRecommendations = async () => {
    setLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let recommendedBooks = [];

    if (!books || books.length === 0) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    // Generate recommendations based on type
    switch (type) {
      case "for-you":
        recommendedBooks = books
          .filter((book) => book.average_rating >= 4.0)
          .slice(0, 12);
        break;
      case "trending":
        recommendedBooks = books
          .sort((a, b) => (b.ratings?.length || 0) - (a.ratings?.length || 0))
          .slice(0, 12);
        break;
      case "new-releases":
        recommendedBooks = books
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 12);
        break;
      case "bestsellers":
        recommendedBooks = books
          .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
          .slice(0, 12);
        break;
      default:
        recommendedBooks = books.slice(0, 12);
    }

    // Apply filters
    if (filterRating !== "all") {
      const minRating = parseFloat(filterRating);
      recommendedBooks = recommendedBooks.filter(
        (book) => book.average_rating >= minRating
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "rating":
        recommendedBooks.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case "price-low":
        recommendedBooks.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        recommendedBooks.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        recommendedBooks.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      default:
        // Keep relevance order
        break;
    }

    setRecommendations(recommendedBooks);
    setLoading(false);
  };

  const getTypeInfo = () => {
    switch (type) {
      case "for-you":
        return {
          title: "Recommended For You",
          description: "Personalized book recommendations based on your reading history",
          icon: Target,
          color: "text-purple-600",
        };
      case "trending":
        return {
          title: "Đang Thịnh Hành",
          description: "Những cuốn sách đang được độc giả yêu thích",
          icon: TrendingUp,
          color: "text-red-600",
        };
      case "new-releases":
        return {
          title: "Sách Mới",
          description: "Những cuốn sách mới nhất trong bộ sưu tập của chúng tôi",
          icon: Sparkles,
          color: "text-green-600",
        };
      case "bestsellers":
        return {
          title: "Bestsellers",
          description: "Most popular books based on sales",
          icon: Star,
          color: "text-amber-600",
        };
      default:
        return {
          title: "Recommendations",
          description: "Discover your next great read",
          icon: BookOpen,
          color: "text-blue-600",
        };
    }
  };

  const typeInfo = getTypeInfo();
  const IconComponent = typeInfo.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-96 animate-pulse">
                <div className="h-52 bg-gray-300 dark:bg-gray-700 rounded-md mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/"
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </Link>
            <div className={`p-3 rounded-lg bg-white dark:bg-gray-800`}>
              <IconComponent className={`h-8 w-8 ${typeInfo.color}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {typeInfo.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {typeInfo.description}
              </p>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
                <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Rating Filter */}
              <div className="relative">
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadRecommendations}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {recommendations.length} recommendations
          </p>
        </div>

        {/* Books Grid */}
        {recommendations.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {recommendations.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
              No recommendations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or check back later for new recommendations.
            </p>
            <Link
              to="/books"
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Browse All Books
            </Link>
          </div>
        )}

        {/* Recommendation Types Navigation */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Explore More Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: "for-you", title: "For You", icon: Target, color: "purple" },
              { type: "trending", title: "Trending", icon: TrendingUp, color: "red" },
              { type: "new-releases", title: "New Releases", icon: Sparkles, color: "green" },
              { type: "bestsellers", title: "Bestsellers", icon: Star, color: "amber" },
            ].map((item) => {
              const isActive = type === item.type;
              return (
                <Link
                  key={item.type}
                  to={`/recommendations?type=${item.type}`}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? `border-${item.color}-500 bg-${item.color}-50 dark:bg-${item.color}-900/20`
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-6 w-6 ${
                        isActive ? `text-${item.color}-600` : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        isActive
                          ? `text-${item.color}-800 dark:text-${item.color}-200`
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;