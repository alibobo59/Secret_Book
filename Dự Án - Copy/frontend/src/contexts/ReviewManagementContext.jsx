import React, { createContext, useContext, useState } from 'react';
import { reviewService } from '../services';

const ReviewManagementContext = createContext();

export const useReviewManagement = () => {
  const context = useContext(ReviewManagementContext);
  if (!context) {
    throw new Error('useReviewManagement must be used within a ReviewManagementProvider');
  }
  return context;
};

export const ReviewManagementProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);

  // Get reviews for a specific book (Public)
  const getBookReviews = async (bookId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getBookReviews(bookId, params);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải đánh giá';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Submit a new review
  const submitReview = async (reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.submitReview(reviewData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing review
  const updateReview = async (reviewId, reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.updateReview(reviewId, reviewData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đánh giá';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a review
  const deleteReview = async (reviewId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.deleteReview(reviewId);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if user can review a book
  const canReviewBook = async (bookId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.canReviewBook(bookId);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra quyền đánh giá';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  // Get all reviews for admin management
  const getAllReviews = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getAllReviews(params);
      setReviews(response.data || response.reviews || []);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách đánh giá';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Toggle review visibility (Admin only)
  const toggleReviewVisibility = async (reviewId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.toggleReviewVisibility(reviewId);
      
      // Update local state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { ...review, is_hidden: !review.is_hidden }
            : review
        )
      );
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái hiển thị đánh giá';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get review statistics (Admin only)
  const getReviewStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getReviewStats();
      setReviewStats(response.data || response);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê đánh giá';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete review (Admin only)
  const adminDeleteReview = async (reviewId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.adminDeleteReview(reviewId);
      
      // Update local state
      setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    loading,
    error,
    reviews,
    reviewStats,
    getBookReviews,
    submitReview,
    updateReview,
    deleteReview,
    canReviewBook,
    getAllReviews,
    toggleReviewVisibility,
    getReviewStats,
    adminDeleteReview,
    clearError
  };

  return (
    <ReviewManagementContext.Provider value={value}>
      {children}
    </ReviewManagementContext.Provider>
  );
};

export default ReviewManagementContext;