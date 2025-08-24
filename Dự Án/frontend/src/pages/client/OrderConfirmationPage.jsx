import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder } from "../../contexts/OrderContext";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
  Download,
  Phone,
  Mail,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { getOrderById } = useOrder();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orderData = getOrderById(orderId);
    if (orderData) {
      setOrder(orderData);
    } else {
      // If order not found, redirect to orders page
      navigate("/profile/orders");
    }
  }, [orderId, getOrderById, navigate]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Không Tìm Thấy Đơn Hàng
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Đơn hàng bạn đang tìm không tồn tại hoặc bạn không có quyền xem nó.
          </p>
          <Link
            to="/books"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "shipped":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
        case "pending":
          return <Package className="h-5 w-5" />;
        case "processing":
          return <Package className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile/orders"
            className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Quay Lại Danh Sách Đơn Hàng
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Đặt Hàng Thành Công!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được tiếp nhận và đang
              được xử lý.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    Đơn hàng #{order.id}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Đặt hàng vào{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                      order.status
                    )}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 dark:text-white">
                  Các Sản Phẩm Đã Đặt ({order.items.length})
                </h3>
                {order.items.map((item) => {
                  // Use SKU as unique identifier
                  const itemKey = item.sku || `fallback_${item.id || item.book_id}_${item.variation_id || ''}`;
                  return (
                  <div
                    key={itemKey}
                    className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <img
                      src={item.book.cover_image}
                      alt={item.book.title}
                      className="w-16 h-24 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/books/${item.book.id}`}
                        className="text-lg font-medium text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                        {item.book.title}
                        {item.variation && (
                          <span className="text-amber-600 dark:text-amber-400 ml-1">
                            ({Object.entries(item.variation.attributes || {}).map(([key, value]) => 
                              `${key}: ${value}`
                            ).join(', ')})
                          </span>
                        )}
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        tác giả {typeof item.book.author === 'object' ? item.book.author?.name || 'Tác giả không xác định' : item.book.author || 'Tác giả không xác định'}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Số lượng: {item.quantity}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formatCurrency(Number(item.price) * Number(item.quantity))}
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Địa Chỉ Giao Hàng
              </h3>
              <div className="text-gray-700 dark:text-gray-300">
                <p className="font-medium">{order.shipping_address.name}</p>
                <p>{order.shipping_address.street}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.zip}
                </p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.phone && (
                  <p className="mt-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {order.shipping_address.phone}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Phương Thức Thanh Toán
              </h3>
              <div className="text-gray-700 dark:text-gray-300">
                <p>**** **** **** {order.payment_method.last_four}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.payment_method.brand.toUpperCase()} kết thúc bằng{" "}
                  {order.payment_method.last_four}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Tóm Tắt Đơn Hàng
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(Number(order.subtotal || 0))}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Thuế</span>
                  <span>{formatCurrency(Number(order.tax || 0))}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phí vận chuyển</span>
                  <span>
                    {Number(order.shipping) === 0
                      ? "Miễn phí"
                      : formatCurrency(Number(order.shipping || 0))}
                  </span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-white">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(Number(order.total || 0))}</span>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Giao Hàng Dự Kiến
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.estimated_delivery}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Tải Hóa Đơn
                </button>

                <Link
                  to="/books"
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center block">
                  Tiếp Tục Mua Sắm
                </Link>
              </div>

              {/* Contact Support */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                  Cần Trợ Giúp?
                </h4>
                <div className="space-y-2 text-sm">
                  <a
                    href="mailto:support@secretbook.com"
                    className="flex items-center gap-2 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
                    <Mail className="h-4 w-4" />
                    support@secretbook.com
                  </a>
                  <a
                    href="tel:+1234567890"
                    className="flex items-center gap-2 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
                    <Phone className="h-4 w-4" />
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
