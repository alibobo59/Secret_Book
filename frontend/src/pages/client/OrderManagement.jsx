import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
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

const OrderManagementPage = () => {
  const { user } = useAuth();

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

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Load user's orders
    const userOrders = getUserOrders(user.id);
    setOrders(userOrders);
    setFilteredOrders(userOrders);
  }, [user, getUserOrders, navigate]);

  useEffect(() => {
    // Filter and search orders
    let filtered = orders;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items?.some(
            (item) =>
              item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.author.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply sorting
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

  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;

    setCancellingOrderId(selectedOrder.id);
    try {
      await cancelOrder(selectedOrder.id);

      // Update local state
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
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order. Please try again or contact support.");
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
    return order.status === "pending" || order.status === "confirmed";
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "highest", label: "Highest Amount" },
    { value: "lowest", label: "Lowest Amount" },
  ];

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
            Back to Home
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                My Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track and manage your book orders
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Refresh
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
                placeholder="Search orders or books..."
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
                <option value="">All Statuses</option>
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
                {filteredOrders.length} order
                {filteredOrders.length !== 1 ? "s" : ""} found
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
                ? "No orders yet"
                : "No orders match your filters"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {orders.length === 0
                ? "Start shopping to see your orders here"
                : "Try adjusting your search or filter criteria"}
            </p>
            <Link
              to="/books"
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
              Start Shopping
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
                        Order {order.id}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          {order.items?.length || 0} item
                          {(order.items?.length || 0) !== 1 ? "s" : ""}
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
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {order.items?.slice(0, 3).map((item) => (
                      <div
                        key={item.bookId}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-grow min-w-0">
                          <h4 className="font-medium text-gray-800 dark:text-white text-sm truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            by {item.author}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          +{(order.items?.length || 0) - 3} more item
                          {(order.items?.length || 0) - 3 !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>

                    <Link
                      to={`/order-confirmation/${order.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Download className="h-4 w-4" />
                      View Receipt
                    </Link>

                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <XCircle className="h-4 w-4" />
                        Cancel Order
                      </button>
                    )}

                    {order.status === "delivered" && (
                      <Link
                        to={`/books/${order.items?.[0]?.bookId}`}
                        className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-600 dark:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                        <Package className="h-4 w-4" />
                        Review Items
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Order Detail Modal */}
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
                    Order Details - {selectedOrder.id}
                  </h2>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                        Order Status
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
                        Order Date
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                        Total Amount
                      </h3>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        ${selectedOrder.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Shipping Address
                      </h3>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {selectedOrder.shippingAddress?.firstName}{" "}
                        {selectedOrder.shippingAddress?.lastName}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedOrder.shippingAddress?.address}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedOrder.shippingAddress?.city},{" "}
                        {selectedOrder.shippingAddress?.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedOrder.contactInfo?.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedOrder.contactInfo?.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item) => (
                        <div
                          key={item.bookId}
                          className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              by {item.author}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Quantity: {item.quantity}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Payment Method
                      </h3>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400">
                        Cash on Delivery (COD)
                      </p>
                    </div>
                  </div>

                  {/* Order Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                        Order Notes
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedOrder.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Order Modal */}
        <AnimatePresence>
          {isCancelModalOpen && selectedOrder && (
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
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Cancel Order
                  </h2>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to cancel order{" "}
                  <strong>{selectedOrder.id}</strong>? This action cannot be
                  undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsCancelModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Keep Order
                  </button>
                  <button
                    onClick={confirmCancelOrder}
                    disabled={cancellingOrderId === selectedOrder.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center">
                    {cancellingOrderId === selectedOrder.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Cancel Order"
                    )}
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
