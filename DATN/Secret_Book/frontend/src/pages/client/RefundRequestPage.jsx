import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRefund } from '../../contexts/RefundContext';
import { orderService } from '../../services';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../contexts/ToastContext';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

const RefundRequestPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { requestRefund, loading } = useRefund();
  const { showToast } = useToast();
  
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [refundType, setRefundType] = useState('full');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [errors, setErrors] = useState({});

  const refundReasons = [
    'Sản phẩm bị lỗi/hư hỏng',
    'Sản phẩm không đúng mô tả',
    'Giao hàng chậm trễ',
    'Không còn nhu cầu sử dụng',
    'Đặt nhầm sản phẩm',
    'Chất lượng sản phẩm không như mong đợi',
    'Khác'
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setOrderLoading(true);
      const response = await orderService.getOrderById(orderId);
      setOrder(response.data);
      
      // Initialize selected items for full refund
      if (response.data?.order_items) {
        setSelectedItems(response.data.order_items.map(item => ({
          order_item_id: item.id,
          quantity: item.quantity,
          max_quantity: item.quantity,
          unit_price: item.price,
          book_title: item.book_snapshot?.title || item.book?.title,
          variation_name: item.variation?.name
        })));
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      showToast('Không thể tải thông tin đơn hàng', 'error');
      navigate('/profile/orders');
    } finally {
      setOrderLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!reason) {
      newErrors.reason = 'Vui lòng chọn lý do hoàn tiền';
    }
    
    if (reason === 'Khác' && !customReason.trim()) {
      newErrors.customReason = 'Vui lòng nhập lý do cụ thể';
    }
    
    if (refundType === 'partial' && selectedItems.length === 0) {
      newErrors.items = 'Vui lòng chọn ít nhất một sản phẩm để hoàn tiền';
    }
    
    if (refundType === 'partial') {
      const hasValidQuantity = selectedItems.some(item => item.quantity > 0);
      if (!hasValidQuantity) {
        newErrors.items = 'Vui lòng chọn số lượng hợp lệ cho các sản phẩm';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleItemQuantityChange = (itemId, quantity) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.order_item_id === itemId 
          ? { ...item, quantity: Math.max(0, Math.min(quantity, item.max_quantity)) }
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const refundData = {
        order_id: parseInt(orderId),
        refund_type: refundType,
        reason: reason === 'Khác' ? customReason : reason,
        items: refundType === 'partial' 
          ? selectedItems.filter(item => item.quantity > 0).map(item => ({
              order_item_id: item.order_item_id,
              quantity: item.quantity
            }))
          : selectedItems.map(item => ({
              order_item_id: item.order_item_id,
              quantity: item.max_quantity
            }))
      };
      
      await requestRefund(refundData);
      showToast('Yêu cầu hoàn tiền đã được gửi thành công', 'success');
      navigate('/profile/refunds');
    } catch (error) {
      console.error('Error requesting refund:', error);
      showToast('Có lỗi xảy ra khi gửi yêu cầu hoàn tiền', 'error');
    }
  };

  const calculateRefundAmount = () => {
    if (refundType === 'full') {
      return order?.total_amount || 0;
    }
    
    return selectedItems
      .filter(item => item.quantity > 0)
      .reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const canRequestRefund = () => {
    if (!order) return false;
    
    // Check if order is completed and within refund period (e.g., 7 days)
    const orderDate = new Date(order.created_at);
    const daysSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
    
    return order.status === 'completed' && daysSinceOrder <= 7;
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng</h2>
          <button
            onClick={() => navigate('/profile/orders')}
            className="text-blue-600 hover:text-blue-800"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  if (!canRequestRefund()) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate('/profile/orders')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Yêu cầu hoàn tiền</h1>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Không thể yêu cầu hoàn tiền
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Đơn hàng này không đủ điều kiện để yêu cầu hoàn tiền. 
                      Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã hoàn thành trong vòng 7 ngày.
                    </p>
                    <p className="mt-2">
                      <strong>Trạng thái đơn hàng:</strong> {order.status === 'completed' ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                    </p>
                  </div>
                </div>
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
            <div className="flex items-center">
              <button
                onClick={() => navigate('/profile/orders')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yêu cầu hoàn tiền</h1>
                <p className="text-gray-600">Đơn hàng #{order.order_number}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin đơn hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Ngày đặt:</span>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Tổng tiền:</span>
                  <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Trạng thái:</span>
                  <p className="font-medium text-green-600">Đã hoàn thành</p>
                </div>
              </div>
            </div>

            {/* Refund Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Loại hoàn tiền
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="refundType"
                    value="full"
                    checked={refundType === 'full'}
                    onChange={(e) => setRefundType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Hoàn tiền toàn bộ đơn hàng ({formatCurrency(order.total_amount)})
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="refundType"
                    value="partial"
                    checked={refundType === 'partial'}
                    onChange={(e) => setRefundType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Hoàn tiền một phần (chọn sản phẩm cụ thể)
                  </span>
                </label>
              </div>
            </div>

            {/* Product Selection for Partial Refund */}
            {refundType === 'partial' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn sản phẩm cần hoàn tiền
                </label>
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.order_item_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.book_title}</h4>
                        {item.variation_name && (
                          <p className="text-sm text-gray-500">Phiên bản: {item.variation_name}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Giá: {formatCurrency(item.unit_price)} × {item.max_quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-gray-700">Số lượng:</label>
                        <input
                          type="number"
                          min="0"
                          max={item.max_quantity}
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(item.order_item_id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-500">/ {item.max_quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.items && (
                  <p className="text-sm text-red-600 mt-1">{errors.items}</p>
                )}
              </div>
            )}

            {/* Refund Amount */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Số tiền hoàn lại:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(calculateRefundAmount())}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Lý do hoàn tiền *
              </label>
              <div className="space-y-2">
                {refundReasons.map((reasonOption) => (
                  <label key={reasonOption} className="flex items-center">
                    <input
                      type="radio"
                      name="reason"
                      value={reasonOption}
                      checked={reason === reasonOption}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">{reasonOption}</span>
                  </label>
                ))}
              </div>
              {errors.reason && (
                <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
              )}
            </div>

            {/* Custom Reason */}
            {reason === 'Khác' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do cụ thể *
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Vui lòng mô tả lý do hoàn tiền..."
                />
                {errors.customReason && (
                  <p className="text-sm text-red-600 mt-1">{errors.customReason}</p>
                )}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/profile/orders')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu hoàn tiền'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RefundRequestPage;