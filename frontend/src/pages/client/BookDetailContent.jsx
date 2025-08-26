import React from "react";
import { Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Calendar,
  Book,
  Hash,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { Loading } from "../../components/common";

const BookDetailContent = ({
  book,
  quantity,
  setQuantity,
  handleAddToCart,
  user,
  canReview,
  reviewEligibility,
  showReviewForm,
  setShowReviewForm,
  rating,
  setRating,
  hoveredRating,
  setHoveredRating,
  review,
  setReview,
  handleSubmitReview,
  reviews,
  reviewsLoading,
}) => (
  <div className="container mx-auto px-4 py-8">
    <Link
      to="/books"
      className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 mb-6">
      <ArrowLeft className="h-5 w-5 mr-2" />
      Quay Lại Danh Sách Sách
    </Link>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Book Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
          <img
            src={`http://127.0.0.1:8000/storage/${book.image}`}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </motion.div>

      {/* Book Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-white mb-2">
            {book.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Tác giả: {book.author?.name || "Tác giả không xác định"}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`h-5 w-5 ${
                  index < Math.floor(book.average_rating)
                    ? "fill-current"
                    : index < book.average_rating
                    ? "fill-current opacity-50"
                    : ""
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600 dark:text-gray-400">
            ({book.reviews_count || 0} đánh giá)
          </span>
        </div>

        {/* Book Info */}
        <div className="space-y-3">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="h-5 w-5 mr-2" />
            Xuất bản:
            {new Date(book.published_date).toLocaleDateString()}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Book className="h-5 w-5 mr-2" />
            Số trang: {book.page_count || "Không có"}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Hash className="h-5 w-5 mr-2" />
            ISBN: {book.isbn || "N/A"}
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {book.description || "Không có mô tả"}
        </p>

        <div className="space-y-4">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-800 dark:text-white">
              {(parseInt(book.price) || 0).toLocaleString("vi-VN")} ₫
            </span>
            <span
              className={`ml-4 px-3 py-1 rounded-full text-sm ${
                parseInt(book.stock) > 10
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : parseInt(book.stock) > 0
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}>
              {parseInt(book.stock) > 10
                ? "Còn hàng"
                : parseInt(book.stock) > 0
                ? `Chỉ còn ${parseInt(book.stock)} cuốn`
                : "Hết hàng"}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-24">
              <label htmlFor="quantity" className="sr-only">
                Số lượng
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={parseInt(book.stock) || 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <button
              onClick={handleAddToCart}
              disabled={parseInt(book.stock) === 0}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Thêm Vào Giỏ
            </button>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Reviews Section */}
    <div className="mt-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-white">
          Đánh Giá Khách Hàng
        </h2>
        {user && canReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
            Viết Đánh Giá
          </button>
        )}
        {user && !canReview && reviewEligibility && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {reviewEligibility.reason}
          </p>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-md"
          onSubmit={handleSubmitReview}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Đánh giá
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none">
                  <Star
                    className={`h-6 w-6 ${
                      value <= (hoveredRating || rating)
                        ? "text-amber-500 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Nhận xét
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              rows="4"></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              Hủy
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              Gửi Đánh Giá
            </button>
          </div>
        </motion.form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviewsLoading ? (
          <Loading size={32} message="Đang tải..." />
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {review.user?.name || "Anonymous"}
                  </p>
                  <div className="flex text-amber-500 mt-1">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={`h-4 w-4 ${
                          starIndex < review.rating ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.review && (
                <p className="text-gray-700 dark:text-gray-300">
                  {review.review}
                </p>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            {"Chưa có đánh giá nào"}
          </p>
        )}
          </div>
    </div>
  </div>
);

export default BookDetailContent;