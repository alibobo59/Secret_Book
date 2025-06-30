import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useOrder } from "../../contexts/OrderContext";
import { motion, AnimatePresence } from "framer-motion";
import CancelOrderModal from "../../components/common/CancelOrderModal";
import { reviewAPI } from "../../services/api";
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
const fakeOrders = [
  {
    id: "ORD-001",
    userId: "user1",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    status: "delivered",
    paymentMethod: "cod",
    paymentStatus: "completed",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
    estimatedDelivery: "2024-01-22T00:00:00Z",
    subtotal: 89.97,
    shipping: 5.0,
    tax: 9.5,
    total: 104.47,
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street, Apt 4B",
      city: "New York",
    },
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
    },
    items: [
      {
        bookId: "BOOK001",
        price: 29.99,
        quantity: 3,
      },
    ],
    notes: "Vui lòng giao hàng trước 5 giờ chiều",
  },
  {
    id: "ORD-002",
    userId: "user1",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    status: "shipped",
    paymentMethod: "cod",
    paymentStatus: "pending",
    createdAt: "2024-01-18T14:20:00Z",
    updatedAt: "2024-01-19T09:15:00Z",
    estimatedDelivery: "2024-01-25T00:00:00Z",
    subtotal: 45.98,
    shipping: 5.0,
    tax: 5.1,
    total: 56.08,
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street, Apt 4B",
      city: "New York",
    },
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
    },
    items: [
      {
        bookId: "BOOK002",
        price: 22.99,
        quantity: 2,
      },
    ],
    notes: "",
  },
  {
    id: "ORD-003",
    userId: "user1",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    status: "processing",
    paymentMethod: "cod",
    paymentStatus: "pending",
    createdAt: "2024-01-20T11:45:00Z",
    updatedAt: "2024-01-20T11:45:00Z",
    estimatedDelivery: "2024-01-27T00:00:00Z",
    subtotal: 34.99,
    shipping: 5.0,
    tax: 4.0,
    total: 43.99,
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street, Apt 4B",
      city: "New York",
    },
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
    },
    items: [
      {
        bookId: "BOOK003",
        price: 34.99,
        quantity: 1,
      },
    ],
    notes: "Yêu cầu gói quà",
  },
  {
    id: "ORD-004",
    userId: "user1",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    status: "pending",
    paymentMethod: "cod",
    paymentStatus: "pending",
    createdAt: "2024-01-22T16:30:00Z",
    updatedAt: "2024-01-22T16:30:00Z",
    estimatedDelivery: "2024-01-29T00:00:00Z",
    subtotal: 67.98,
    shipping: 5.0,
    tax: 7.3,
    total: 80.28,
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street, Apt 4B",
      city: "New York",
    },
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
    },
    items: [
      {
        bookId: "BOOK004",
        price: 19.99,
        quantity: 2,
      },
      {
        bookId: "BOOK005",
        price: 27.99,
        quantity: 1,
      },
    ],
    notes: "",
  },
  {
    id: "ORD-005",
    userId: "user1",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    status: "cancelled",
    paymentMethod: "cod",
    paymentStatus: "cancelled",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-11T10:20:00Z",
    estimatedDelivery: "2024-01-17T00:00:00Z",
    subtotal: 25.99,
    shipping: 5.0,
    tax: 3.1,
    total: 34.09,
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street, Apt 4B",
      city: "New York",
    },
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
    },
    items: [
      {
        bookId: "BOOK006",
        price: 25.99,
        quantity: 1,
      },
    ],
    notes: "Đã hủy do thay đổi ý định",
  },
];

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

  // Hàm kiểm tra xem đơn hàng có sản phẩm nào có thể đánh giá không
  const hasReviewableItems = (order) => {
    if (!order.items || order.items.length === 0) return false;
    
    return order.items.some(item => {
      const bookId = item.book_id || item.bookId;
      return bookId && reviewEligibility[bookId] === true;
    });
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
                eligibilityMap[bookId] = response.data.canReview;
              } catch (error) {
                console.error(`Failed to check review eligibility for book ${bookId}:`, error);
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
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
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
        return <Clock className="h-4 w-4" />;
      case "confirmed":
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
    return order.status === "pending";
  };

  const statusOptions = [
    { value: "pending", label: "Chờ Xử Lý" },
    { value: "processing", label: "Đang Xử Lý" },
    { value: "shipped", label: "Đã Giao" },
    { value: "delivered", label: "Đã Nhận" },
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
                        <span>
                          {order.items?.length || 0} sản phẩm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-gray-800 dark:text-white">
                        ${(order.total / 100).toFixed(2)}
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
                          src={item.book?.image_url || item.coverImage || '/placeholder-book.jpg'}
                          alt={item.book?.title || item.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-grow min-w-0">
                          <h4 className="font-medium text-gray-800 dark:text-white text-sm truncate">
                            {item.book?.title || item.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            của {item.book?.author?.name || item.author}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              SL: {item.quantity}
                            </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              ${((item.price / 100) * item.quantity).toFixed(2)}
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

                    <Link
                      to={`/order-confirmation/${order.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Download className="h-4 w-4" />
                      Xem Hóa Đơn
                    </Link>

                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <XCircle className="h-4 w-4" />
                        Hủy Đơn Hàng
                      </button>
                    )}

                    {order.status === "delivered" && hasReviewableItems(order) && (
                      <Link
                        to={`/orders/${order.id}/review`}
                        className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-600 dark:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                        <Package className="h-4 w-4" />
                        Đánh Giá Sản Phẩm
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
                    Chi Tiết Đơn Hàng - {selectedOrder.order_number || selectedOrder.id}
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
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                          Ngày Đặt Hàng
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(selectedOrder.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                        Tổng Tiền
                      </h3>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        ${(selectedOrder.total / 100).toFixed(2)}
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
                          {selectedOrder.address?.full_name || selectedOrder.shippingAddress?.name}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Thành Phố
                        </p>
                        <p className="text-gray-800 dark:text-white">
                          {selectedOrder.address?.city || selectedOrder.shippingAddress?.city}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Địa Chỉ
                        </p>
                        <p className="text-gray-800 dark:text-white">
                          {selectedOrder.address?.address_line_1 || selectedOrder.shippingAddress?.address}
                        </p>
                        {selectedOrder.address?.address_line_2 && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {selectedOrder.address.address_line_2}
                          </p>
                        )}
                      </div>
                      
                      {(selectedOrder.address?.state || selectedOrder.address?.postal_code) && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tỉnh/Thành & Mã Bưu Điện
                          </p>
                          <p className="text-gray-800 dark:text-white">
                            {selectedOrder.address?.state} {selectedOrder.address?.postal_code}
                          </p>
                        </div>
                      )}
                      
                      {selectedOrder.address?.country && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quốc Gia
                          </p>
                          <p className="text-gray-800 dark:text-white">
                            {selectedOrder.address.country}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thông Tin Liên Hệ */}
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                      Thông Tin Liên Hệ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedOrder.user?.email || selectedOrder.contactInfo?.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedOrder.address?.phone || selectedOrder.contactInfo?.phone}
                        </span>
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
                            src={item.book?.image_url || item.coverImage || '/placeholder-book.jpg'}
                            alt={item.book?.title || item.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {item.book?.title || item.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              của {item.book?.author?.name || item.author}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Số lượng: {item.quantity}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                ${((item.price / 100) * item.quantity).toFixed(2)}
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
                            {selectedOrder.payment_method || selectedOrder.paymentMethod?.type || 'Thanh toán khi nhận hàng (COD)'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Trạng thái: {selectedOrder.payment_status || selectedOrder.paymentStatus || 'Đang chờ'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ghi Chú Đơn Hàng */}
                  {(selectedOrder.notes || selectedOrder.special_instructions) && (
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                        Ghi Chú Đơn Hàng
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedOrder.notes || selectedOrder.special_instructions}
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
      </div>
    </div>
  );
};

export default OrderManagementPage;
