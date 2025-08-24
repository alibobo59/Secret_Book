import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRefund } from '../../contexts/RefundContext';
import refundService from '../../services/refundService';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  CreditCard,
  User,
  Calendar,
  ClipboardList
} from 'lucide-react';

const RefundDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentRefund,
    loading,
    error,
    fetchRefundById,
    updateRefundStatus,
    checkVNPayStatus
  } = useRefund();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [checkingVNPay, setCheckingVNPay] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRefundById(id);
    }
  }, [id, fetchRefundById]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    setUpdating(true);
    try {
      await updateRefundStatus(id, {
        status: newStatus,
        admin_note: adminNote
      });
      setShowStatusModal(false);
      setNewStatus('');
      setAdminNote('');
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckVNPayStatus = async () => {
    setCheckingVNPay(true);
    try {
      await checkVNPayStatus(id);
    } finally {
      setCheckingVNPay(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <RotateCcw className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const colorClass = refundService.getStatusColor(status);
    const statusText = refundService.getStatusText(status);
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        {getStatusIcon(status)}
        <span className="ml-2">{statusText}</span>
      </span>
    );
  };

  const canUpdateStatus = (currentStatus) => {
    return ['pending', 'processing'].includes(currentStatus);
  };

  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return [
          { value: 'processing', label: 'Đang xử lý' },
          { value: 'completed', label: 'Hoàn thành' },
          { value: 'cancelled', label: 'Hủy bỏ' }
        ];
      case 'processing':
        return [
          { value: 'completed', label: 'Hoàn thành' },
          { value: 'failed', label: 'Thất bại' }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !currentRefund) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy thông tin hoàn tiền</h3>
        <p className="text-gray-500 mb-4">{error || 'Yêu cầu hoàn tiền không tồn tại'}</p>
        <button
          onClick={() => navigate('/admin/refunds')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/refunds')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết hoàn tiền #{currentRefund.refund_number || currentRefund.id}
            </h1>
            <p className="text-gray-600">
              Đơn hàng #{currentRefund.order?.order_number || currentRefund.order_id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {currentRefund.refund_method === 'vnpay' && (
            <button
              onClick={handleCheckVNPayStatus}
              disabled={checkingVNPay}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${checkingVNPay ? 'animate-spin' : ''}`} />
              Kiểm tra VNPay
            </button>
          )}
          {canUpdateStatus(currentRefund.status) && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Cập nhật trạng thái
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Refund Overview */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin hoàn tiền</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Trạng thái</label>
                <div className="mt-1">
                  {getStatusBadge(currentRefund.status)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Loại hoàn tiền</label>
                <p className="mt-1 text-sm text-gray-900">
                  {refundService.getRefundTypeText(currentRefund.refund_type)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Số tiền hoàn</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(currentRefund.refund_amount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Số tiền gốc</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatCurrency(currentRefund.original_amount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phương thức</label>
                <p className="mt-1 text-sm text-gray-900">
                  {refundService.getRefundMethodText(currentRefund.refund_method)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(currentRefund.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {currentRefund.reason && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500">Lý do hoàn tiền</label>
                <p className="mt-1 text-sm text-gray-900">{currentRefund.reason}</p>
              </div>
            )}

            {currentRefund.admin_note && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500">Ghi chú admin</label>
                <p className="mt-1 text-sm text-gray-900">{currentRefund.admin_note}</p>
              </div>
            )}
          </div>

          {/* Refund Items */}
          {currentRefund.refund_items && currentRefund.refund_items.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm hoàn tiền</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRefund.refund_items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.book_title}
                            </div>
                            {item.book_isbn && (
                              <div className="text-sm text-gray-500">ISBN: {item.book_isbn}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    #{currentRefund.order?.order_number || currentRefund.order_id}
                  </p>
                  <Link
                    to={`/admin/orders/${currentRefund.order_id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Xem chi tiết đơn hàng
                  </Link>
                </div>
              </div>
              {currentRefund.order?.customer && (
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {currentRefund.order.customer.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentRefund.order.customer.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* VNPay Info */}
          {currentRefund.refund_method === 'vnpay' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin VNPay</h3>
              <div className="space-y-3">
                {currentRefund.vnp_txn_ref && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Mã giao dịch</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {currentRefund.vnp_txn_ref}
                    </p>
                  </div>
                )}
                {currentRefund.vnp_request_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Request ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {currentRefund.vnp_request_id}
                    </p>
                  </div>
                )}
                {currentRefund.vnp_response && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phản hồi VNPay</label>
                    <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(JSON.parse(currentRefund.vnp_response), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lịch sử</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Tạo yêu cầu</p>
                  <p className="text-sm text-gray-500">
                    {new Date(currentRefund.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              {currentRefund.requested_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Yêu cầu xử lý</p>
                    <p className="text-sm text-gray-500">
                      {new Date(currentRefund.requested_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
              {currentRefund.processed_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Bắt đầu xử lý</p>
                    <p className="text-sm text-gray-500">
                      {new Date(currentRefund.processed_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
              {currentRefund.completed_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Hoàn thành</p>
                    <p className="text-sm text-gray-500">
                      {new Date(currentRefund.completed_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cập nhật trạng thái</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái mới
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn trạng thái</option>
                    {getAvailableStatuses(currentRefund.status).map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú admin
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập ghi chú (tùy chọn)"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundDetail;