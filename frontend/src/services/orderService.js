import { api } from './api.js';

const orderService = {
  // User order functions
  // Get user's orders
  getUserOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Get user orders error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create new order (will trigger email notification)
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Create order error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get order details
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get order error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cancel order (user)
  cancelOrder: async (orderId) => {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Cancel order error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Admin order functions
  // Get all orders (Admin)
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get('/admin/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Get all orders error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get order details (Admin)
  getAdminOrderById: async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get admin order error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update order status (Admin) - will trigger email notifications
  updateOrderStatus: async (orderId, status, reason = '') => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, {
        status,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Update order status error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update payment status (Admin)
  updatePaymentStatus: async (orderId, paymentStatus) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/payment`, {
        payment_status: paymentStatus
      });
      return response.data;
    } catch (error) {
      console.error('Update payment status error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete order (Admin)
  deleteOrder: async (orderId) => {
    try {
      const response = await api.delete(`/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Delete order error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get allowed statuses for order
  getAllowedStatuses: async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}/allowed-statuses`);
      return response.data;
    } catch (error) {
      console.error('Get allowed statuses error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get order statistics (Admin)
  getOrderStats: async () => {
    try {
      const response = await api.get('/admin/orders/stats');
      return response.data;
    } catch (error) {
      console.error('Get order stats error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default orderService;