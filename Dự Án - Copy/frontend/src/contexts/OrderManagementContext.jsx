import React, { createContext, useContext, useState } from 'react';
import { orderService } from '../services';

const OrderManagementContext = createContext();

export const useOrderManagement = () => {
  const context = useContext(OrderManagementContext);
  if (!context) {
    throw new Error('useOrderManagement must be used within a OrderManagementProvider');
  }
  return context;
};

export const OrderManagementProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [allowedStatuses, setAllowedStatuses] = useState([]);

  // User functions
  // Get user's orders
  const getUserOrders = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getUserOrders(params);
      setOrders(response.data || response.orders || []);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create new order
  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.createOrder(orderData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get order details
  const getOrderDetails = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderDetails(orderId);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải chi tiết đơn hàng';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.cancelOrder(orderId, reason);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        )
      );
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  // Get all orders for admin management
  const getAllOrders = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getAllOrders(params);
      setOrders(response.data || response.orders || []);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get order details (Admin)
  const getAdminOrderDetails = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getAdminOrderDetails(orderId);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải chi tiết đơn hàng';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update order status (Admin)
  const updateOrderStatus = async (orderId, status, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.updateOrderStatus(orderId, status, reason);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status }
            : order
        )
      );
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update payment status (Admin)
  const updatePaymentStatus = async (orderId, paymentStatus) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.updatePaymentStatus(orderId, paymentStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, payment_status: paymentStatus }
            : order
        )
      );
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái thanh toán';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete order (Admin)
  const deleteOrder = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.deleteOrder(orderId);
      
      // Update local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa đơn hàng';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get allowed statuses (Admin)
  const getAllowedStatuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getAllowedStatuses();
      setAllowedStatuses(response.data || response.statuses || []);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách trạng thái';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get order statistics (Admin)
  const getOrderStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderStats();
      setOrderStats(response.data || response);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê đơn hàng';
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
    orders,
    orderStats,
    allowedStatuses,
    getUserOrders,
    createOrder,
    getOrderDetails,
    cancelOrder,
    getAllOrders,
    getAdminOrderDetails,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    getAllowedStatuses,
    getOrderStats,
    clearError
  };

  return (
    <OrderManagementContext.Provider value={value}>
      {children}
    </OrderManagementContext.Provider>
  );
};

export default OrderManagementContext;