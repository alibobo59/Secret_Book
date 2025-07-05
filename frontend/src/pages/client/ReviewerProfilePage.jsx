import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Star,
  Calendar,
  BookOpen,
  ArrowLeft,
  Award,
  TrendingUp,
} from "lucide-react";

import ReviewInteractionButtons from "../../components/reviews/ReviewInteractionButtons";

const ReviewerProfilePage = () => {
  const { reviewerId } = useParams();

  const [reviewer, setReviewer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    // Simulate API call to fetch reviewer data
    const fetchReviewerData = async () => {
      setLoading(true);

      // Mock reviewer data
      const mockReviewer = {
        id: parseInt(reviewerId),
        name: "Jane Smith",
        username: "bookworm_jane",
        avatar: null,
        joinDate: "2022-03-15",
        totalReviews: 47,
        averageRating: 4.2,
        helpfulVotes: 156,
        bio: "Passionate reader with a love for contemporary fiction and mystery novels. Always looking for the next page-turner!",
        favoriteGenres: ["Fiction", "Mystery", "Romance", "Thriller"],
        badges: [
          { name: "Top Reviewer", icon: Award, color: "text-yellow-500" },
          {
            name: "Helpful Reviewer",
            icon: TrendingUp,
            color: "text-green-500",
          },
        ],
      };

      // Mock reviews data
      const mockReviews = [
        {
          id: 1,
          bookId: 1,
          bookTitle: "The Silent Patient",
          bookAuthor: "Alex Michaelides",
          bookCover: "/api/placeholder/100/140",
          rating: 5,
          title: "Absolutely gripping psychological thriller!",
          content:
            "This book kept me on the edge of my seat from start to finish. The plot twists were unexpected and the character development was excellent. Highly recommend for anyone who loves psychological thrillers.",
          createdAt: "2024-01-15",
          helpfulCount: 23,
          isHelpful: false,
        },
        {
          id: 2,
          bookId: 2,
          bookTitle: "Where the Crawdads Sing",
          bookAuthor: "Delia Owens",
          bookCover: "/api/placeholder/100/140",
          rating: 4,
          title: "Beautiful and haunting story",
          content:
            "A beautifully written novel that combines mystery with coming-of-age elements. The descriptions of nature are vivid and the mystery keeps you guessing until the end.",
          createdAt: "2024-01-10",
          helpfulCount: 18,
          isHelpful: true,
        },
        {
          id: 3,
          bookId: 3,
          bookTitle: "The Seven Husbands of Evelyn Hugo",
          bookAuthor: "Taylor Jenkins Reid",
          bookCover: "/api/placeholder/100/140",
          rating: 5,
          title: "Captivating from beginning to end",
          content:
            "This book is absolutely phenomenal. The storytelling is masterful and the characters feel so real. I couldn't put it down and finished it in one sitting.",
          createdAt: "2024-01-05",
          helpfulCount: 31,
          isHelpful: false,
        },
      ];

      setReviewer(mockReviewer);
      setReviews(mockReviews);
      setLoading(false);
    };

    fetchReviewerData();
  }, [reviewerId]);

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "rating-high":
        return b.rating - a.rating;
      case "rating-low":
        return a.rating - b.rating;
      case "helpful":
        return b.helpfulCount - a.helpfulCount;
      default: // newest
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "fill-current text-amber-500"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reviewer) {
    return (
      <div className="min-h-screen bg-amber-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Không Tìm Thấy Người Đánh Giá
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hồ sơ người đánh giá bạn đang tìm kiếm không tồn tại.
          </p>
          <Link
            to="/"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Quay về trang chủ
        </Link>

        {/* Reviewer Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {reviewer.avatar ? (
                <img
                  src={reviewer.avatar}
                  alt={reviewer.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                reviewer.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {reviewer.name}
                </h1>
                {reviewer.badges.map((badge, index) => {
                  const IconComponent = badge.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                      title={badge.name}
                    >
                      <IconComponent className={`h-3 w-3 ${badge.color}`} />
                      <span className="text-gray-600 dark:text-gray-400">
                        {badge.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                @{reviewer.username}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {reviewer.bio}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {reviewer.totalReviews}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Đánh Giá
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {Number(reviewer.averageRating || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Đánh Giá TB
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {reviewer.helpfulVotes}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Lượt Hữu Ích
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {new Date().getFullYear() -
                      new Date(reviewer.joinDate).getFullYear()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Năm Hoạt Động
                  </div>
                </div>
              </div>

              {/* Favorite Genres */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thể Loại Yêu Thích:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {reviewer.favoriteGenres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Đánh Giá ({reviews.length})
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="newest">Mới Nhất</option>
              <option value="oldest">Cũ Nhất</option>
              <option value="rating-high">Đánh Giá Cao Nhất</option>
              <option value="rating-low">Đánh Giá Thấp Nhất</option>
              <option value="helpful">Hữu Ích Nhất</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {sortedReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
              >
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <Link
                    to={`/books/${review.bookId}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={review.bookCover}
                      alt={review.bookTitle}
                      className="w-16 h-20 object-cover rounded-md hover:opacity-80 transition-opacity"
                    />
                  </Link>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link
                          to={`/books/${review.bookId}`}
                          className="text-lg font-medium text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                        >
                          {review.bookTitle}
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          của {review.bookAuthor}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                      {review.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {review.content}
                    </p>

                    {/* Review Interactions */}
                    <ReviewInteractionButtons
                      review={review}
                      onHelpfulToggle={() => {}}
                      onReport={() => {}}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {reviews.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Người đánh giá này chưa viết đánh giá nào.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewerProfilePage;