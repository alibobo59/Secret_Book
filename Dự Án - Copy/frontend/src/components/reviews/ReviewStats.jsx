import React from 'react';
import { Star, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const ReviewStats = ({ reviews = [], averageRating = 0, totalReviews = 0 }) => {
  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  // Render star rating
  const renderStars = (rating, size = 'w-5 h-5') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : star <= rating
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Thống kê đánh giá
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="mb-2">
            <span className="text-4xl font-bold text-gray-800 dark:text-white">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">/5</span>
          </div>
          <div className="flex justify-center mb-2">
            {renderStars(averageRating, 'w-6 h-6')}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dựa trên {totalReviews} đánh giá
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-12">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {rating}
                </span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
              
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                />
              </div>
              
              <div className="w-12 text-right">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      {totalReviews > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round((ratingDistribution[0].count + ratingDistribution[1].count) / totalReviews * 100)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Đánh giá tích cực
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reviews.filter(r => r.verified_purchase).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Đã mua hàng
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReviewStats;