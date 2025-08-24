import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { analyticsService } from '../services';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  return useContext(AnalyticsContext);
};

export const AnalyticsProvider = ({ children }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    sales: {},
    users: {},
    inventory: {},
    performance: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [auditLogStats, setAuditLogStats] = useState(null);

  // Removed mock data generation - using only backend data

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'mod')) {
      console.log('User is admin/mod, loading dashboard stats...', user);
      loadDashboardStats();
    } else {
      console.log('User is not admin/mod or not logged in:', user);
    }
  }, [user]);

  // Load dashboard statistics from backend
  const loadDashboardStats = async (period = '30d') => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getDashboardStats(period);
      console.log('Raw API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Category Performance:', response?.sales?.categoryPerformance);
      setDashboardStats(response);
      // Map the response to the expected analytics structure
      setAnalytics({
        sales: response.sales || {},
        users: response.users || {},
        inventory: response.inventory || {},
        performance: response.performance || {},
        reviews: response.reviews || {},
        promotions: response.promotions || {},
        behavior: response.behavior || {}
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê';
      setError(errorMessage);
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async (period = '30d') => {
    await loadDashboardStats(period);
  };

  // Get dashboard statistics
  const getDashboardStats = async (period = '30d', startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getDashboardStats(period, startDate, endDate);
      console.log('Raw API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      setDashboardStats(response);
      // Map the response to the expected analytics structure
      setAnalytics({
        sales: response.sales || {},
        users: response.users || {},
        inventory: response.inventory || {},
        performance: response.performance || {},
        reviews: response.reviews || {},
        promotions: response.promotions || {},
        behavior: response.behavior || {}
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê dashboard';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get order statistics
  const getOrderStats = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getOrderStats(params);
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

  // Get audit log statistics
  const getAuditLogStats = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getAuditLogStats(params);
      setAuditLogStats(response.data || response);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê audit log';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Export audit logs
  const exportAuditLogs = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsService.exportAuditLogs(params);
      
      // Create download link for the exported file
      if (response.data) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xuất audit logs';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get model audit logs
  const getModelAuditLogs = async (model, modelId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getModelAuditLogs(model, modelId, params);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải audit logs của model';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeData = (startDate, endDate, dataType) => {
    // In a real app, this would filter data by date range
    return analytics[dataType] || {};
  };

  const exportAnalytics = (dataType, format = 'csv') => {
    const data = analytics[dataType];
    if (!data) return '';

    if (format === 'csv') {
      // Convert to CSV format
      let csv = '';
      if (dataType === 'sales' && data.dailySales) {
        csv = 'Date,Revenue,Orders\n';
        data.dailySales.forEach(item => {
          csv += `${item.date},${item.revenue},${item.orders}\n`;
        });
      }
      return csv;
    }

    return JSON.stringify(data, null, 2);
  };

  // Helper functions
  const formatStatsForDisplay = (stats) => {
    if (!stats) return null;
    
    return {
      ...stats,
      formattedRevenue: stats.revenue ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(stats.revenue) : '0 ₫',
      formattedOrders: stats.orders ? new Intl.NumberFormat('vi-VN').format(stats.orders) : '0',
      formattedUsers: stats.users ? new Intl.NumberFormat('vi-VN').format(stats.users) : '0',
      formattedProducts: stats.products ? new Intl.NumberFormat('vi-VN').format(stats.products) : '0'
    };
  };

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getTrendDirection = (current, previous) => {
    const change = calculatePercentageChange(current, previous);
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'stable';
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // Legacy support
    analytics,
    loading,
    refreshAnalytics,
    getDateRangeData,
    exportAnalytics,
    // New backend integration
    error,
    dashboardStats,
    orderStats,
    auditLogStats,
    getDashboardStats,
    getOrderStats,
    getAuditLogStats,
    exportAuditLogs,
    getModelAuditLogs,
    formatStatsForDisplay,
    calculatePercentageChange,
    getTrendDirection,
    clearError,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};