import { api } from './api.js';

const analyticsService = {
  // Get dashboard statistics (Admin only)
  getDashboardStats: async (period = '30d', startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      } else {
        params.period = period;
      }
      
      const response = await api.get('/analytics/dashboard', {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get order statistics (Admin only)
  getOrderStats: async () => {
    try {
      const response = await api.get('/admin/orders/stats');
      return response.data;
    } catch (error) {
      console.error('Get order stats error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get audit log statistics (Admin only)
  getAuditLogStats: async () => {
    try {
      const response = await api.get('/audit-logs/stats');
      return response.data;
    } catch (error) {
      console.error('Get audit log stats error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Export audit logs (Admin only)
  exportAuditLogs: async (params = {}) => {
    try {
      const response = await api.get('/audit-logs/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Export audit logs error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get model-specific audit logs (Admin only)
  getModelAuditLogs: async (modelType, modelId, params = {}) => {
    try {
      const response = await api.get(`/audit-logs/${modelType}/${modelId}`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Get model audit logs error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default analyticsService;