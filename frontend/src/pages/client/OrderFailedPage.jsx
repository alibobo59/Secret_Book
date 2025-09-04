import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

const OrderFailedPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch order details from API
    // For now, we'll simulate it
    setTimeout(() => {
      if (orderId) {
        setOrderDetails({
          id: orderId,
          orderNumber: `ORD-${Date.now()}`,
          total: 250000,
          paymentMethod: 'vnpay',
          status: 'failed'
        });
      }
      setLoading(false);
    }, 1000);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Thanh Toán Thất Bại
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Rất tiếc, thanh toán của bạn không thể được xử lý. Vui lòng thử lại.
            </p>
          </div>

          {orderDetails && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Chi Tiết Đơn Hàng
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mã Đơn Hàng:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {orderDetails.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tổng Tiền:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {orderDetails.total.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phương Thức Thanh Toán:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    VNPay
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Trạng Thái:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Thất Bại
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Các nguyên nhân thường gặp khi thanh toán thất bại:
              </h3>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Số dư tài khoản không đủ</li>
                <li>• Thông tin thanh toán không chính xác</li>
                <li>• Sự cố kết nối mạng</li>
                <li>• Hạn chế bảo mật từ ngân hàng</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 dark:focus:ring-gray-400"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chọn phương thức đã bị loại bỏ theo chính sách mới */}
    </div>
  );
};

export default OrderFailedPage;