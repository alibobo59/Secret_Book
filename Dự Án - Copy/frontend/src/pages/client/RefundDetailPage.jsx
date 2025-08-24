import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRefund } from '../../contexts/RefundContext';
import { refundService } from '../../services';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  CreditCard,
  Calendar,
  User,
  ShoppingBag
} from 'lucide-react';

const RefundDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading } = useRefund();
  const [refund, setRefund] = useState(null);
  const [refundLoading, setRefundLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRefundDetail();
  }, [id]);

  const fetchRefundDetail = async () => {
    try {
      setRefundLoading(true);
      setError(null);
      const response = await refundService.getRefundDetail(id);
      setRefund(response.data);
    } catch (error) {
      console.error('Error fetching refund detail:', error);
      setError('Không thể tải thông tin yêu cầu hoàn tiền');
    } finally {
      setRefundLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'processing':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-gray-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'failed':
        return 'Thất bại';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getRefundMethodText = (method) => {
    switch (method) {
      case 'vnpay':
        return 'VNPay';
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'cash':
        return 'Tiền mặt';
      default:
        return method;
    }
  };

  if (refundLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !refund) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <XCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {error || 'Không tìm thấy yêu cầu hoàn tiền'}
              </h3>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/profile/refunds')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/profile/refunds')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Chi tiết yêu cầu hoàn tiền
                  </h1>
                  <p className="text-gray-600">
                    #{refund.refund_number || refund.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon(refund.status)}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  getStatusColor(refund.status)
                }`}>
                  {getStatusText(refund.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Refund Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin hoàn tiền</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Số tiền hoàn:</span>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(refund.refund_amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Số tiền gốc:</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(refund.original_amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Loại hoàn tiền:</span>
                      <p className="font-medium">
                        {refund.refund_type === 'full' ? 'Hoàn tiền toàn phần' : 'Hoàn tiền một phần'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Phương thức hoàn tiền:</span>
                      <p className="font-medium">
                        {getRefundMethodText(refund.refund_method)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                {refund.order && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <ShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">Thông tin đơn hàng</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Mã đơn hàng:</span>
                        <p className="font-medium">#{refund.order.order_number}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Ngày đặt hàng:</span>
                        <p className="font-medium">
                          {new Date(refund.order.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Tổng tiền đơn hàng:</span>
                        <p className="font-medium">
                          {formatCurrency(refund.order.total_amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Trạng thái đơn hàng:</span>
                        <p className="font-medium">{refund.order.status}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/profile/orders/${refund.order.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Xem chi tiết đơn hàng →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Refund Items */}
                {refund.refund_items && refund.refund_items.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm hoàn tiền</h3>
                    <div className="space-y-3">
                      {refund.refund_items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {item.order_item?.book_variation?.book?.title || 'Sản phẩm'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Số lượng: {item.quantity} × {formatCurrency(item.unit_price)}
                            </p>
                            {item.reason && (
                              <p className="text-sm text-gray-600 mt-1">
                                Lý do: {item.reason}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(item.total_amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reason */}
                {refund.reason && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">Lý do hoàn tiền</h3>
                    </div>
                    <p className="text-gray-700">{refund.reason}</p>
                  </div>
                )}

                {/* Admin Notes */}
                {refund.admin_notes && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">Ghi chú từ admin</h3>
                    </div>
                    <p className="text-gray-700">{refund.admin_notes}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Timeline */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Thời gian</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Ngày tạo:</span>
                      <p className="font-medium">
                        {new Date(refund.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {refund.processed_at && (
                      <div>
                        <span className="text-sm text-gray-500">Ngày xử lý:</span>
                        <p className="font-medium">
                          {new Date(refund.processed_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                    {refund.completed_at && (
                      <div>
                        <span className="text-sm text-gray-500">Ngày hoàn thành:</span>
                        <p className="font-medium">
                          {new Date(refund.completed_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                {refund.vnpay_data && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">Thông tin thanh toán</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      {refund.vnpay_txn_ref && (
                        <div>
                          <span className="text-gray-500">Mã giao dịch:</span>
                          <p className="font-mono">{refund.vnpay_txn_ref}</p>
                        </div>
                      )}
                      {refund.vnpay_response_code && (
                        <div>
                          <span className="text-gray-500">Mã phản hồi:</span>
                          <p className="font-mono">{refund.vnpay_response_code}</p>
                        </div>
                      )}
                      {refund.vnpay_response_message && (
                        <div>
                          <span className="text-gray-500">Thông báo:</span>
                          <p>{refund.vnpay_response_message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Hành động</h3>
                  <div className="space-y-2">
                    <Link
                      to="/profile/refunds"
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Quay lại danh sách
                    </Link>
                    {refund.order && (
                      <Link
                        to={`/profile/orders/${refund.order.id}`}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Xem đơn hàng
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundDetailPage;