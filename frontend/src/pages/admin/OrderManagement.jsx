import React, { useState, useEffect } from "react";
import { PageHeader, Table, SearchFilter, Modal } from "../../components/admin";
import CancelOrderModal from "../../components/common/CancelOrderModal";
import {
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useOrder } from "../../contexts/OrderContext";

const OrderManagement = () => {
  const {
    getAllOrders,
    updateOrderStatus,
    getOrderById,
    cancelOrder,
    loading: contextLoading,
    error: contextError,
  } = useOrder();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [error, setError] = useState(null);

  // Load orders from API on component mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoadingOrders(true);
        setError(null);
        const ordersData = await getAllOrders();
        setOrders(ordersData || []);
        setFilteredOrders(ordersData || []);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setError("Failed to load orders. Please try again.");
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, [getAllOrders]);

  // Filter and search orders
  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt" || sortField === "updatedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewOrder = async (order) => {
    try {
      setLoading(true);
      // Fetch detailed order information
      const detailedOrder = await getOrderById(order.id);
      setSelectedOrder(detailedOrder || order);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      setSelectedOrder(order); // Fallback to basic order data
      setIsViewModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setLoading(true);
      // Call API to update order status
      await updateOrderStatus(selectedOrder.id, newStatus);

      // Update local state
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      setOrders(updatedOrders);

      setIsStatusModalOpen(false);
      setSelectedOrder(null);
      setNewStatus("");
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const canCancelOrder = (order) => {
    return order.status === "pending" || order.status === "processing";
  };

  const refreshOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getAllOrders();
      setOrders(ordersData || []);
      setFilteredOrders(ordersData || []);
      setError(null);
    } catch (error) {
      console.error("Failed to refresh orders:", error);
      setError("Failed to refresh orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const statusOptions = [
    { value: "pending", label: "Pending" },

    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
  ];

  const columns = [
    { id: "id", label: "Order ID", sortable: true },
    { id: "customerName", label: "Customer", sortable: true },
    { id: "createdAt", label: "Date", sortable: true },
    { id: "total", label: "Total", sortable: true },
    { id: "status", label: "Status", sortable: false },
    { id: "paymentMethod", label: "Payment", sortable: false },
    { id: "actions", label: "Actions", sortable: false },
  ];

  // Loading state
  if (isLoadingOrders) {
    return (
      <div className="space-y-6">
        <PageHeader title="Order Management" hideAddButton />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading orders...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Order Management" hideAddButton />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={refreshOrders}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Order Management" hideAddButton />
        <button
          onClick={refreshOrders}
          disabled={loading}
          className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:bg-amber-400 disabled:cursor-not-allowed flex items-center gap-2">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : null}
          Refresh
        </button>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search orders, customers..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={statusOptions}
        filterPlaceholder="All Statuses"
      />

      <Table
        columns={columns}
        data={filteredOrders}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        renderRow={(order) => (
          <tr
            key={order.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {order.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.customerName || "N/A"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {order.customerEmail || "N/A"}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {new Date(order.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              ${order.total?.toFixed(2) || "0.00"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  order.status
                )}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {order.paymentMethod || "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewOrder(order)}
                  className="text-amber-600 hover:text-amber-900 dark:text-amber-500 dark:hover:text-amber-400">
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleUpdateStatus(order)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400">
                  <Package className="h-4 w-4" />
                </button>
                {canCancelOrder(order) && (
                  <button
                    onClick={() => handleCancelOrder(order)}
                    className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400">
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        )}
      />

      {/* View Order Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Order Details">
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Order Information
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Order ID:</span>{" "}
                    {selectedOrder.id}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedOrder.status
                      )}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> $
                    {selectedOrder.total?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Customer Information
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedOrder.customerName || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedOrder.customerEmail || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedOrder.contactInfo?.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    {selectedOrder.shippingAddress.name ||
                      `${selectedOrder.shippingAddress.firstName} ${selectedOrder.shippingAddress.lastName}`}
                  </p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>
                    {selectedOrder.shippingAddress.city}{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            )}

            {/* Order Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Order Items
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <p className="font-medium">
                          {item.title || `Book ID: ${item.bookId}`}
                        </p>
                        {item.author && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {item.author}
                          </p>
                        )}
                        <p className="text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${item.price?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total: $
                          {((item.price || 0) * (item.quantity || 0)).toFixed(
                            2
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedOrder.notes && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Notes
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  {selectedOrder.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Order Status">
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Update status for order:{" "}
                <span className="font-medium">{selectedOrder.id}</span>
              </p>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={loading || !newStatus}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed flex items-center gap-2">
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Update Status
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Order Modal */}
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
  );
};

export default OrderManagement;
