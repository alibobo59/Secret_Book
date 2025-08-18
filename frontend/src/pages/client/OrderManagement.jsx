import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useOrder } from "../../contexts/OrderContext";
import { motion, AnimatePresence } from "framer-motion";
import CancelOrderModal from "../../components/common/CancelOrderModal";
import { reviewAPI, api } from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Search,
  Filter,
  Calendar,
  ArrowLeft,
  Download,
  RefreshCw,
  AlertCircle,
  MapPin,
  CreditCard,
  Phone,
  Mail,
} from "lucide-react";

// Dữ liệu đơn hàng giả để kiểm tra

const OrderManagementPage = () => {
  const { user } = useAuth();
  const { getUserOrders, cancelOrder, loading, error } = useOrder();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [reviewEligibility, setReviewEligibility] = useState({});
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('vnpay');

  // Hàm kiểm tra xem đơn hàng có sản phẩm nào có thể đánh giá không
  const hasReviewableItems = (order) => {
    if (!order.items || order.items.length === 0) return false;

    const result = order.items.some((item) => {
      const bookId = item.book_id || item.bookId;
      const canReview = bookId && reviewEligibility[bookId] === true;
      return canReview;
    });

    return result;
  };

  // In the useEffect where orders are loaded:
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Tải đơn hàng của người dùng từ API
    const loadOrders = async () => {
      try {
        setIsLoadingOrders(true);
        const userOrders = await getUserOrders(); // Xóa tham số userId
        setOrders(userOrders || []);
        setFilteredOrders(userOrders || []);

        // Kiểm tra tính đủ điều kiện đánh giá cho các đơn hàng đã giao
        await checkReviewEligibility(userOrders || []);
      } catch (error) {
        console.error("Không thể tải đơn hàng:", error);
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    // Hàm kiểm tra tính đủ điều kiện đánh giá cho tất cả sách trong đơn hàng đã giao
    const checkReviewEligibility = async (ordersList) => {
      const eligibilityMap = {};

      for (const order of ordersList) {
        if (order.status === "delivered" && order.items) {
          for (const item of order.items) {
            const bookId = item.book_id || item.bookId;
            if (bookId && !eligibilityMap[bookId]) {
              try {
                const response = await reviewAPI.canReviewBook(bookId);
                eligibilityMap[bookId] = response.data.can_review;
              } catch (error) {
                console.error(
                  `Failed to check review eligibility for book ${bookId}:`,
                  error
                );
                eligibilityMap[bookId] = false;
              }
            }
          }
        }
      }

      setReviewEligibility(eligibilityMap);
    };

    loadOrders();
  }, [user, navigate]); // Đã xóa getUserOrders khỏi dependencies để tránh vòng lặp vô hạn

  useEffect(() => {
    // Lọc và tìm kiếm đơn hàng
    let filtered = orders;

    // Áp dụng bộ lọc tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items?.some(
            (item) =>
              item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.author?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Áp dụng bộ lọc trạng thái
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Áp dụng sắp xếp
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest":
          return b.total - a.total;
        case "lowest":
          return a.total - b.total;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setIsCancelModalOpen(true);
  };

  const handleRetryPayment = async (order) => {
    try {
      const response = await api.post(`/payment/vnpay/retry/${order.id}`);
      
      if (response.data.success) {
        // Redirect to VNPay payment URL
        window.location.href = response.data.payment_url;
      } else {
        alert(response.data.message || "Không thể tạo thanh toán mới");
      }
    } catch (error) {
      console.error("Retry payment error:", error);
      alert("Có lỗi xảy ra khi tạo thanh toán mới");
    }
  };

  const confirmCancelOrder = async (cancellationReason) => {
    if (!selectedOrder) return;

    setCancellingOrderId(selectedOrder.id);
    try {
      await cancelOrder(selectedOrder.id, cancellationReason);

      // Cập nhật trạng thái cục bộ
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              status: "cancelled",
              updatedAt: new Date().toISOString(),
            }
          : order
      );
      setOrders(updatedOrders);

      setIsCancelModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Không thể hủy đơn hàng:", error);
      alert("Không thể hủy đơn hàng. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
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
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const canCancelOrder = (order) => {
    return order.status === "pending" || order.status === "processing";
  };

  const statusOptions = [
    { value: "pending", label: "Chờ Xử Lý" },
    { value: "processing", label: "Đang Xử Lý" },
    { value: "shipped", label: "Đã Gửi" },
    { value: "delivered", label: "Đã Giao" },
    { value: "cancelled", label: "Đã Hủy" },
  ];

  const sortOptions = [
    { value: "newest", label: "Mới Nhất Trước" },
    { value: "oldest", label: "Cũ Nhất Trước" },
    { value: "highest", label: "Số Tiền Cao Nhất" },
    { value: "lowest", label: "Số Tiền Thấp Nhất" },
  ];

  // Loading state check
  if (isLoadingOrders) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Đang tải đơn hàng...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state check
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">
                Không thể tải đơn hàng
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                Thử Lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main component return
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Về Trang Chủ
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Đơn Hàng Của Tôi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Theo dõi và quản lý đơn hàng sách của bạn
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Làm Mới
            </button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng hoặc sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 appearance-none">
                <option value="">Tất Cả Trạng Thái</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 appearance-none">
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center md:justify-end">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tìm thấy {filteredOrders.length} đơn hàng
              </span>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {orders.length === 0
                ? "Chưa có đơn hàng nào"
                : "Không có đơn hàng nào phù hợp với bộ lọc của bạn"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {orders.length === 0
                ? "Bắt đầu mua sắm để xem đơn hàng tại đây"
                : "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn"}
            </p>
            <Link
              to="/books"
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
              Bắt Đầu Mua Sắm
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Đơn Hàng {order.order_number || order.id}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          Đặt hàng vào{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{order.items?.length || 0} sản phẩm</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}>
                        {getStatusIcon(order.status)}
                        {order.status === 'pending' ? 'Chờ xử lý' :
                         order.status === 'processing' ? 'Đang xử lý' :
                         order.status === 'shipped' ? 'Đã gửi' :
                         order.status === 'delivered' ? 'Đã giao' :
                         order.status === 'cancelled' ? 'Đã hủy' :
                         order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-gray-800 dark:text-white">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {order.items?.slice(0, 3).map((item) => (
                      <div
                        key={item.book_id || item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <img
                          src={
                            item.book_image ? `http://127.0.0.1:8000/storage/${item.book_image}` :
                            item.book?.image ? `http://127.0.0.1:8000/storage/${item.book.image}` :
                            item.coverImage ? `http://127.0.0.1:8000/storage/${item.coverImage}` :
                            "/placeholder-book.svg"
                          }
                          alt={item.book_title || item.book?.title || item.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-grow min-w-0">
                          <h4 className="font-medium text-gray-800 dark:text-white text-sm truncate">
                            {item.book_title || item.book?.title || item.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            của {item.book?.author?.name || item.author_name || item.author || 'Không rõ tác giả'}
                          </p>
                          {/* Display variation information if available */}
                          {(item.variation_id || item.variation_attributes) && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                {item.variation_attributes ? 
                                  (() => {
                                    try {
                                      const attrs = typeof item.variation_attributes === 'string' ? 
                                        JSON.parse(item.variation_attributes) : item.variation_attributes;
                                      return `${attrs.type}: ${attrs.value}`;
                                    } catch {
                                      return 'Biến thể';
                                    }
                                  })() :
                                  item.bookVariation ? 
                                    `${item.bookVariation.variation_type}: ${item.bookVariation.variation_value}` :
                                    'Biến thể'
                                }
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              SL: {item.quantity}
                            </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          +{(order.items?.length || 0) - 3} sản phẩm khác
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hành Động Đơn Hàng */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                      <Eye className="h-4 w-4" />
                      Xem Chi Tiết
                    </button>

                    {order.payment_status === 'failed' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowPaymentMethodModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        <CreditCard className="h-4 w-4" />
                        Chọn Phương Thức Thanh Toán
                      </button>
                    )}

                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <XCircle className="h-4 w-4" />
                        Hủy Đơn Hàng
                      </button>
                    )}

                    {order.status === "delivered" &&
                      hasReviewableItems(order) && (
                        <Link
                          to={`/orders/${order.id}/review`}
                          className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-600 dark:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                          <Package className="h-4 w-4" />
                          Đánh Giá Đơn Hàng
                        </Link>
                      )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal Chi Tiết Đơn Hàng */}
        <AnimatePresence>
          {isDetailModalOpen && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Chi Tiết Đơn Hàng -{" "}
                    {selectedOrder.order_number || selectedOrder.id}
                  </h2>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Nội Dung Modal */}
                <div className="p-6 space-y-6">
                  {/* Thông Tin Đơn Hàng */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                        Trạng Thái Đơn Hàng
                      </h3>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedOrder.status
                        )}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status === 'pending' ? 'Chờ xử lý' :
                         selectedOrder.status === 'processing' ? 'Đang xử lý' :
                         selectedOrder.status === 'shipped' ? 'Đã gửi' :
                         selectedOrder.status === 'delivered' ? 'Đã giao' :
                         selectedOrder.status === 'cancelled' ? 'Đã hủy' :
                         selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                        Ngày Đặt Hàng
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(
                          selectedOrder.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                        Tổng Tiền
                      </h3>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        {formatCurrency(selectedOrder.total)}
                      </p>
                    </div>
                  </div>

                  {/* Địa Chỉ Giao Hàng */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Địa Chỉ Giao Hàng
                      </h3>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Họ Và Tên
                        </p>
                        <p className="text-gray-800 dark:text-white">
                          {selectedOrder.address?.name ||
                            selectedOrder.shippingAddress?.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tỉnh/Thành Phố
                        </p>
                        <p className="text-gray-800 dark:text-white">
                          {selectedOrder.address?.province?.name ||
                            selectedOrder.shippingAddress?.province?.name ||
                            'Chưa có thông tin'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phường/Xã
                        </p>
                        <p className="text-gray-800 dark:text-white">
                          {selectedOrder.address?.ward_model?.name ||
                            selectedOrder.shippingAddress?.ward_model?.name ||
                            'Chưa có thông tin'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Địa Chỉ
                        </p>
                        <p className="text-gray-800 dark:text-white">
                          {selectedOrder.address?.address ||
                            selectedOrder.shippingAddress?.address}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Số Điện Thoại
                        </p>
                        <p className="text-gray-800 dark:text-white">
                          {selectedOrder.address?.phone ||
                            selectedOrder.contactInfo?.phone ||
                            selectedOrder.customer_phone ||
                            selectedOrder.phone ||
                            selectedOrder.user?.phone ||
                            'Chưa có thông tin'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </p>
                        <p className="text-gray-800 dark:text-white">
                          {selectedOrder.address?.email ||
                            selectedOrder.user?.email ||
                            selectedOrder.contactInfo?.email ||
                            selectedOrder.customer_email ||
                            selectedOrder.email ||
                            'Chưa có thông tin'}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Sản Phẩm Trong Đơn Hàng */}
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                      Sản Phẩm Trong Đơn Hàng
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item) => (
                        <div
                          key={item.book_id || item.id}
                          className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <img
                            src={
                              item.book_image ? `http://127.0.0.1:8000/storage/${item.book_image}` :
                              item.book?.image ? `http://127.0.0.1:8000/storage/${item.book.image}` :
                              item.coverImage ? `http://127.0.0.1:8000/storage/${item.coverImage}` :
                              "/placeholder-book.svg"
                            }
                            alt={item.book_title || item.book?.title || item.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {item.book_title || item.book?.title || item.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              của {item.book?.author?.name || item.author_name || item.author || 'Không rõ tác giả'}
                            </p>
                            {/* Display variation information if available */}
                            {(item.variation_id || item.variation_attributes) && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                  {item.variation_attributes ? 
                                    (() => {
                                      try {
                                        const attrs = typeof item.variation_attributes === 'string' ? 
                                          JSON.parse(item.variation_attributes) : item.variation_attributes;
                                        return `${attrs.type}: ${attrs.value}`;
                                      } catch {
                                        return 'Biến thể đặc biệt';
                                      }
                                    })() :
                                    item.bookVariation ? 
                                      `${item.bookVariation.variation_type}: ${item.bookVariation.variation_value}` :
                                      'Biến thể đặc biệt'
                                  }
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Số lượng: {item.quantity}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Phương Thức Thanh Toán */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Phương Thức Thanh Toán
                      </h3>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {selectedOrder.payment_method === 'credit_card' ? 'Thẻ tín dụng' :
                             selectedOrder.payment_method === 'debit_card' ? 'Thẻ ghi nợ' :
                             selectedOrder.payment_method === 'paypal' ? 'PayPal' :
                             selectedOrder.payment_method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                             selectedOrder.payment_method === 'cash_on_delivery' ? 'Thanh toán khi nhận hàng (COD)' :
                             selectedOrder.paymentMethod?.type === 'credit_card' ? 'Thẻ tín dụng' :
                             selectedOrder.paymentMethod?.type === 'debit_card' ? 'Thẻ ghi nợ' :
                             selectedOrder.paymentMethod?.type === 'paypal' ? 'PayPal' :
                             selectedOrder.paymentMethod?.type === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                             selectedOrder.paymentMethod?.type === 'cash_on_delivery' ? 'Thanh toán khi nhận hàng (COD)' :
                             selectedOrder.payment_method || selectedOrder.paymentMethod?.type || "Thanh toán khi nhận hàng (COD)"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Trạng thái:{" "}
                            {selectedOrder.payment_status === 'pending' ? 'Đang chờ' :
                             selectedOrder.payment_status === 'paid' ? 'Đã thanh toán' :
                             selectedOrder.payment_status === 'failed' ? 'Thanh toán thất bại' :
                             selectedOrder.payment_status === 'refunded' ? 'Đã hoàn tiền' :
                             selectedOrder.paymentStatus === 'pending' ? 'Đang chờ' :
                             selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' :
                             selectedOrder.paymentStatus === 'failed' ? 'Thanh toán thất bại' :
                             selectedOrder.paymentStatus === 'refunded' ? 'Đã hoàn tiền' :
                             selectedOrder.payment_status || selectedOrder.paymentStatus || "Đang chờ"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ghi Chú Đơn Hàng */}
                  {(selectedOrder.notes ||
                    selectedOrder.special_instructions) && (
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                        Ghi Chú Đơn Hàng
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedOrder.notes ||
                            selectedOrder.special_instructions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Hủy Đơn Hàng */}
        <CancelOrderModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setSelectedOrder(null);
          }}
          onConfirm={confirmCancelOrder}
          orderNumber={selectedOrder?.id}
          loading={cancellingOrderId === selectedOrder?.id}
        />

        {/* Modal Chọn Phương Thức Thanh Toán */}
        <AnimatePresence>
          {showPaymentMethodModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Chọn Phương Thức Thanh Toán
                  </h2>
                  <button
                    onClick={() => {
                      setShowPaymentMethodModal(false);
                      setSelectedOrder(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Đơn hàng: {selectedOrder.order_number || selectedOrder.id}
                  </div>
                  
                  <div className="space-y-3">
                     <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                       <input
                         type="radio"
                         name="paymentMethod"
                         value="vnpay"
                         checked={selectedPaymentMethod === 'vnpay'}
                         onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                         className="mr-3"
                       />
                       <div className="flex items-center gap-3">
                         <CreditCard className="h-5 w-5 text-blue-600" />
                         <div>
                           <div className="font-medium text-gray-800 dark:text-white">VNPay</div>
                           <div className="text-sm text-gray-600 dark:text-gray-400">Thanh toán online qua VNPay</div>
                         </div>
                       </div>
                     </label>

                     <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                       <input
                         type="radio"
                         name="paymentMethod"
                         value="cod"
                         checked={selectedPaymentMethod === 'cod'}
                         onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                         className="mr-3"
                       />
                       <div className="flex items-center gap-3">
                         <Package className="h-5 w-5 text-green-600" />
                         <div>
                           <div className="font-medium text-gray-800 dark:text-white">COD</div>
                           <div className="text-sm text-gray-600 dark:text-gray-400">Thanh toán khi nhận hàng</div>
                         </div>
                       </div>
                     </label>
                   </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPaymentMethodModal(false);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Hủy
                  </button>
                  <button
                    onClick={async () => {
                       try {
                         const response = await api.post(`/payment/change-method/${selectedOrder.id}`, {
                           payment_method: selectedPaymentMethod
                         });
                         
                         if (response.data.success) {
                           if (selectedPaymentMethod === 'cod') {
                             alert(response.data.message);
                             // Update local state instead of reloading
                             setOrders(prevOrders => 
                               prevOrders.map(order => 
                                 order.id === selectedOrder.id 
                                   ? { ...order, payment_method: 'cod', payment_status: 'pending' }
                                   : order
                               )
                             );
                           } else {
                             window.location.href = response.data.payment_url;
                           }
                         } else {
                           alert(response.data.message || "Không thể thay đổi phương thức thanh toán");
                         }
                       } catch (error) {
                         console.error("Change payment method error:", error);
                         alert("Có lỗi xảy ra khi thay đổi phương thức thanh toán");
                       }
                       setShowPaymentMethodModal(false);
                       setSelectedOrder(null);
                     }}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                    Thanh Toán
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderManagementPage;
