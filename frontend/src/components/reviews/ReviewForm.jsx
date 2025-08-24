import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReviewForm = ({ bookId, onSubmit, onCancel, isSubmitting = false }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (rating === 0) {
      newErrors.rating = 'Vui lòng chọn số sao đánh giá';
    }
    
    if (review.trim().length < 10) {
      newErrors.review = 'Đánh giá phải có ít nhất 10 ký tự';
    }
    
    if (review.trim().length > 1000) {
      newErrors.review = 'Đánh giá không được vượt quá 1000 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        book_id: bookId,
        rating,
        review: review.trim()
      });
      
      // Reset form
      setRating(0);
      setReview('');
      setErrors({});
      
      toast.success('Đánh giá của bạn đã được gửi thành công!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Có lỗi xảy ra khi gửi đánh giá');
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: null }));
    }
  };

  const handleReviewChange = (e) => {
    setReview(e.target.value);
    if (errors.review) {
      setErrors(prev => ({ ...prev, review: null }));
    }
  };

  const ratingLabels = {
    1: 'Rất tệ',
    2: 'Tệ',
    3: 'Bình thường',
    4: 'Tốt',
    5: 'Xuất sắc'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Viết đánh giá
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Đánh giá của bạn *
          </label>
          
          <div className="flex items-center space-x-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
          
          {(hoverRating || rating) > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {ratingLabels[hoverRating || rating]}
            </p>
          )}
          
          {errors.rating && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.rating}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nội dung đánh giá *
          </label>
          
          <textarea
            value={review}
            onChange={handleReviewChange}
            placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
              errors.review
                ? 'border-red-300 dark:border-red-600'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
          />
          
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${
              review.length > 1000 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {review.length}/1000 ký tự
            </span>
            
            {errors.review && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.review}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || review.trim().length < 10}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi đánh giá</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ReviewForm;