import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, Flag, User, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const ReviewCard = ({ review, index = 0, onReportReview }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(review.likes_count || 0);
  const [dislikes, setDislikes] = useState(review.dislikes_count || 0);
  const [userLiked, setUserLiked] = useState(review.user_liked || false);
  const [userDisliked, setUserDisliked] = useState(review.user_disliked || false);
  const [isReporting, setIsReporting] = useState(false);

  // Handle like/dislike actions
  const handleLike = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thích đánh giá');
      return;
    }

    try {
      // Simulate API call - you can implement actual API later
      if (userLiked) {
        setLikes(prev => prev - 1);
        setUserLiked(false);
      } else {
        setLikes(prev => prev + 1);
        setUserLiked(true);
        if (userDisliked) {
          setDislikes(prev => prev - 1);
          setUserDisliked(false);
        }
      }
    } catch (error) {
      console.error('Error liking review:', error);
      toast.error('Có lỗi xảy ra khi thích đánh giá');
    }
  };

  const handleDislike = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để không thích đánh giá');
      return;
    }

    try {
      // Simulate API call - you can implement actual API later
      if (userDisliked) {
        setDislikes(prev => prev - 1);
        setUserDisliked(false);
      } else {
        setDislikes(prev => prev + 1);
        setUserDisliked(true);
        if (userLiked) {
          setLikes(prev => prev - 1);
          setUserLiked(false);
        }
      }
    } catch (error) {
      console.error('Error disliking review:', error);
      toast.error('Có lỗi xảy ra khi không thích đánh giá');
    }
  };

  const handleReport = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để báo cáo đánh giá');
      return;
    }

    setIsReporting(true);
    if (onReportReview) {
      onReportReview(review.id);
    }
    setTimeout(() => setIsReporting(false), 1000);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {review.user?.name ? review.user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {review.user?.name || 'Người dùng ẩn danh'}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              {renderStars(review.rating)}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({review.rating}/5)
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(review.created_at)}</span>
        </div>
      </div>

      {/* Review Content */}
      {review.review && (
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {review.review}
          </p>
        </div>
      )}

      {/* Verified Purchase Badge */}
      {review.verified_purchase && (
        <div className="mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            ✓ Đã mua hàng
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
              userLiked
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{likes}</span>
          </button>

          {/* Dislike Button */}
          <button
            onClick={handleDislike}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
              userDisliked
                ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{dislikes}</span>
          </button>
        </div>

        {/* Report Button */}
        {user && user.id !== review.user_id && (
          <button
            onClick={handleReport}
            disabled={isReporting}
            className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Flag className="w-4 h-4" />
            <span>{isReporting ? 'Đang báo cáo...' : 'Báo cáo'}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewCard;