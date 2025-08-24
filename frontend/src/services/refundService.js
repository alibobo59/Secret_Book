import { api } from './api';

class RefundService {
  // Admin APIs
  async getRefunds(params = {}) {
    const response = await api.get('/admin/refunds', { params });
    return response.data;
  }

  async getRefundById(refundId) {
    const response = await api.get(`/admin/refunds/${refundId}`);
    return response.data;
  }

  async createFullRefund(orderData) {
    const response = await api.post('/admin/refunds/full', orderData);
    return response.data;
  }

  async createPartialRefund(refundData) {
    const response = await api.post('/admin/refunds/partial', refundData);
    return response.data;
  }

  async updateRefundStatus(refundId, statusData) {
    const response = await api.patch(`/admin/refunds/${refundId}/status`, statusData);
    return response.data;
  }

  async checkVNPayStatus(refundId) {
    const response = await api.get(`/admin/refunds/${refundId}/vnpay-status`);
    return response.data;
  }

  async getRefundStats(params = {}) {
    const response = await api.get('/admin/refunds/stats', { params });
    return response.data;
  }

  // Customer APIs
  async getCustomerRefunds(params = {}) {
    const response = await api.get('/refunds', { params });
    return response.data;
  }

  async requestRefund(refundData) {
    const response = await api.post('/refunds/request', refundData);
    return response.data;
  }

  // Utility methods
  getStatusColor(status) {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status) {
    const statusTexts = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'completed': 'Hoàn thành',
      'failed': 'Thất bại',
      'cancelled': 'Đã hủy'
    };
    return statusTexts[status] || status;
  }

  getRefundTypeText(type) {
    const typeTexts = {
      'full': 'Hoàn tiền toàn phần',
      'partial': 'Hoàn tiền một phần'
    };
    return typeTexts[type] || type;
  }

  getRefundMethodText(method) {
    const methodTexts = {
      'vnpay': 'VNPay',
      'bank_transfer': 'Chuyển khoản ngân hàng',
      'cash': 'Tiền mặt'
    };
    return methodTexts[method] || method;
  }

  formatRefundNumber(refundNumber) {
    return refundNumber || 'N/A';
  }

  canCancelRefund(refund) {
    return refund.status === 'pending';
  }

  canProcessRefund(refund) {
    return refund.status === 'pending';
  }

  canRetryRefund(refund) {
    return refund.status === 'failed';
  }
}

export default new RefundService();