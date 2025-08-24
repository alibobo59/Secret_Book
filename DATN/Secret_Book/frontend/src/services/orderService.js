// services/orderService.js
 import { api } from './api'; // dùng default import (phổ biến nhất). Nếu bạn export { api } thì đổi lại cho khớp.

const orderService = {
  /** USER */
  // Lấy danh sách đơn của user (có phân trang)
  getUserOrders: async (params = {}) => {
    try {
      const res = await api.get('/orders', { params }); // đảm bảo truyền { params }
      return res.data;
    } catch (err) {
      console.error('Get user orders error:', err?.response?.data || err.message);
      throw err;
    }
  },

  // Tạo đơn (user)
  createOrder: async (orderData) => {
    try {
      const res = await api.post('/orders', orderData);
      return res.data;
    } catch (err) {
      console.error('Create order error:', err?.response?.data || err.message);
      throw err;
    }
  },

  // Lấy chi tiết đơn theo ID (user)
  getOrderById: async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      return res.data;
    } catch (err) {
      console.error('Get order error:', err?.response?.data || err.message);
      throw err;
    }
  },

  // Hủy đơn (user)
  cancelOrder: async (orderId) => {
    try {
      const res = await api.patch(`/orders/${orderId}/cancel`);
      return res.data;
    } catch (err) {
      console.error('Cancel order error:', err?.response?.data || err.message);
      throw err;
    }
  },

  /** ADMIN */
  // Danh sách tất cả đơn (admin)
  getAllOrders: async (params = {}) => {
    try {
      const res = await api.get('/admin/orders', { params });
      return res.data;
    } catch (err) {
      console.error('Get all orders error:', err?.response?.data || err.message);
      throw err;
    }
  },

  // Chi tiết đơn (admin)
  getAdminOrderById: async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      return res.data;
    } catch (err) {
      console.error('Get admin order error:', err?.response?.data || err.message);
      throw err;
    }
  },

  // Cập nhật trạng thái (admin)
  updateOrderStatus: async (orderId, status, reason = '') => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status, reason });
      return res.data;
    } catch (err) {
      console.error('Update order status error:', err?.response?.data || err.message);
      throw err;
    }
  },

  // Cập nhật thanh toán (admin)
  updatePaymentStatus: async (orderId, paymentStatus) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/payment`, {
        payment_status: paymentStatus,
      });
      return res.data;
    } catch (err) {
      console.error('Update payment status error:', err?.response?.data || err.message);
      throw err;
    }
  },

  // Xoá đơn (admin)
  deleteOrder: async (orderId) => {
    try {
      const res = await api.delete(`/admin/orders/${orderId}`);
      return res.data;
    } catch (err) {
      console.error('Delete order error:', err?.response?.data || err.message);
      throw err;
    }
  },

  // Trạng thái cho phép (admin)
  getAllowedStatuses: async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}/allowed-statuses`);
      return res.data;
    } catch (err) {
      console.error('Get allowed statuses error:', err?.response?.data || err.message);
      throw err;
    }
  },

  // Thống kê (admin)
  getOrderStats: async () => {
    try {
      const res = await api.get('/admin/orders/stats');
      return res.data;
    } catch (err) {
      console.error('Get order stats error:', err?.response?.data || err.message);
      throw err;
    }
  },

  /** SEARCH */
  // (User/Admin) Tìm theo mã đơn, ví dụ ORD-XXXX
  searchByCode: async (code) => {
    try {
      const res = await api.get('/orders/search', { params: { code } });
      return res.data;
    } catch (err) {
      // để fallback sang duyệt nhiều trang
      throw err;
    }
  },
};

export default orderService;
