import { api } from './api.js';

const reviewService = {
  // Get reviews for a specific book (Public)
  getBookReviews: async (bookId, params = {}) => {
    try {
      const response = await api.get(`/books/${bookId}/reviews`, { params });
      return response.data;
    } catch (error) {
      console.error('Get book reviews error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Submit a new review (Authenticated users)
  submitReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Submit review error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update an existing review (Authenticated users)
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Update review error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a review (Authenticated users/Admin)
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Delete review error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Check if user can review a book (Authenticated users)
  canReviewBook: async (bookId) => {
    try {
      const response = await api.get(`/books/${bookId}/can-review`);
      return response.data;
    } catch (error) {
      console.error('Can review book error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Admin functions
  // Get all reviews for admin management
  getAllReviews: async (params = {}) => {
    try {
      const response = await api.get('/admin/reviews', { params });
      return response.data;
    } catch (error) {
      console.error('Get all reviews error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Toggle review visibility (Admin only)
  toggleReviewVisibility: async (reviewId) => {
    try {
      const response = await api.patch(`/admin/reviews/${reviewId}/toggle-visibility`);
      return response.data;
    } catch (error) {
      console.error('Toggle review visibility error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get review statistics (Admin only)
  getReviewStats: async () => {
    try {
      const response = await api.get('/admin/reviews/stats');
      return response.data;
    } catch (error) {
      console.error('Get review stats error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete review (Admin only)
  adminDeleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/admin/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Admin delete review error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default reviewService;