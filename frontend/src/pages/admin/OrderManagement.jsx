import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Table, SearchFilter, Modal } from "../../components/admin";
import { useOrder } from "../../contexts/OrderContext";
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
import { formatCurrency } from "../../utils/formatCurrency";

const OrderManagement = () => {
  const navigate = useNavigate();
  const {
    orders,
    loading,
    error,
    pagination,
    getAllOrders,
    updateOrderStatus,
    getAllowedStatuses,
  } = useOrder();

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [statusLoading, setStatusLoading] = useState(false);
  const [allowedStatuses, setAllowedStatuses] = useState([]);
  const [loadingAllowedStatuses, setLoadingAllowedStatuses] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load orders when component mounts or pagination changes
  useEffect(() => {
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    if (debouncedSearchTerm) filters.search = debouncedSearchTerm;

    getAllOrders(currentPage, perPage, filters);
  }, [getAllOrders, currentPage, perPage, statusFilter, debouncedSearchTerm]);

  // Since backend handles filtering and pagination, we use orders directly
  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/admin/orders/${order.id}`);
  };

  // Hàm định dạng thuộc tính biến thể
  const formatVariationAttributes = (attributes) => {
    if (!attributes) return 'N/A';
    
    try {
      // Nếu attributes là chuỗi JSON
      if (typeof attributes === 'string') {
        // Thử parse trực tiếp nếu là JSON
        try {
          const parsed = JSON.parse(attributes);
          if (parsed && typeof parsed === 'object') {
            // Nếu có thuộc tính 'attributes' bên trong
            if (parsed.attributes && typeof parsed.attributes === 'object') {
              return Object.entries(parsed.attributes)
                .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.charAt(0).toUpperCase() + value.slice(1)}`)
                .join(', ');
            }
            // Nếu chính nó là object attributes
            return Object.entries(parsed)
              .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.charAt(0).toUpperCase() + value.slice(1)}`)
              .join(', ');
          }
        } catch (parseError) {
          // Nếu không parse được, tìm pattern trong chuỗi
          if (attributes.includes('attributes:')) {
            const attributesMatch = attributes.match(/attributes:\s*({[^}]+})/);
            if (attributesMatch && attributesMatch[1]) {
              const attributesObj = JSON.parse(attributesMatch[1]);
              return Object.entries(attributesObj)
                .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.charAt(0).toUpperCase() + value.slice(1)}`)
                .join(', ');
            }
          }
        }
      }
      
      // Nếu attributes đã là object
      if (typeof attributes === 'object') {
        // Nếu có thuộc tính 'attributes' bên trong
        if (attributes.attributes && typeof attributes.attributes === 'object') {
          return Object.entries(attributes.attributes)
            .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.charAt(0).toUpperCase() + value.slice(1)}`)
            .join(', ');
        }
        // Nếu chính nó là object attributes
        return Object.entries(attributes)
          .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.charAt(0).toUpperCase() + value.slice(1)}`)
          .join(', ');
      }
      
      // Trả về giá trị gốc nếu không thể xử lý
      return attributes;
    } catch (error) {
      console.error('Error parsing variation attributes:', error);
      return attributes;
    }
  };

  // Hàm xác định trạng thái được phép dựa trên logic nghiệp vụ
  const getValidNextStatuses = (currentStatus) => {
    const statusFlow = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'], 
      'shipped': ['delivered'],
      'delivered': [], // Không thể thay đổi từ delivered
      'cancelled': [] // Không thể thay đổi từ cancelled
    };
    
    return statusFlow[currentStatus] || [];
  };

  const handleUpdateStatus = async (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);

    // Sử dụng logic nghiệp vụ thay vì gọi API
    try {
      setLoadingAllowedStatuses(true);
      const allowedNextStatuses = getValidNextStatuses(order.status);
      setAllowedStatuses(allowedNextStatuses.map(status => ({
        value: status,
        label: statusOptions.find(opt => opt.value === status)?.label || status
      })));
    } catch (error) {
      console.error("Failed to set allowed statuses:", error);
      setAllowedStatuses([]);
    } finally {
      setLoadingAllowedStatuses(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    // Kiểm tra nếu trạng thái mới là 'cancelled' và chưa có lý do
    if (newStatus === 'cancelled' && !cancellationReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn hàng.');
      return;
    }

    try {
      setStatusLoading(true);
      
      // Nếu là hủy đơn hàng, gửi kèm lý do
      if (newStatus === 'cancelled') {
        await updateOrderStatus(selectedOrder.id, newStatus, cancellationReason);
      } else {
        await updateOrderStatus(selectedOrder.id, newStatus);
      }

      // Refresh orders after successful update with current filters
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
      await getAllOrders(currentPage, perPage, filters);

      setIsStatusModalOpen(false);
      setSelectedOrder(null);
      setNewStatus("");
      setCancellationReason("");
      setAllowedStatuses([]);
    } catch (error) {
      console.error("Failed to update order status:", error);

      // Check if it's a validation error from our backend
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
      }
    } finally {
      setStatusLoading(false);
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
    { value: "pending", label: "Chờ Xử Lý" },
    { value: "processing", label: "Đang Xử Lý" },
    { value: "shipped", label: "Đã Gửi" },
    { value: "delivered", label: "Đã Giao" },
    { value: "cancelled", label: "Đã Hủy" },
  ];

  const columns = [
    { id: "id", label: "Mã Đơn Hàng", sortable: true },
    { id: "customer_name", label: "Khách Hàng", sortable: false }, // Not directly sortable since it's in address table
    { id: "created_at", label: "Ngày", sortable: true },
    { id: "total", label: "Tổng Tiền", sortable: true },
    { id: "status", label: "Trạng Thái", sortable: false },
    { id: "payment_method", label: "Thanh Toán", sortable: false },
    { id: "actions", label: "Hành Động", sortable: false },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quản Lý Đơn Hàng" hideAddButton />

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Tìm kiếm đơn hàng, khách hàng..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={statusOptions}
          filterPlaceholder="Tất Cả Trạng Thái"
        />

        {/* Loading Skeleton */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: perPage }, (_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Pagination Skeleton */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quản Lý Đơn Hàng" hideAddButton />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 dark:text-red-400 mb-2">
              Lỗi tải đơn hàng
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {error}
            </div>
            <button
              onClick={() => getAllOrders()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              Thử Lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý đơn hàng" hideAddButton />

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm đơn hàng, khách hàng..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={statusOptions}
        filterPlaceholder="Tất Cả Trạng Thái"
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
            className="hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
            onClick={() => handleViewOrder(order)}
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {order.order_number || `#${order.id}`}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {order.address?.name || order.user?.name || "N/A"}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {order.address?.email || order.user?.email || "N/A"}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {new Date(order.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {formatCurrency(order.total || 0)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  order.status
                )}`}>
                {getStatusIcon(order.status)}
                {statusOptions.find((opt) => opt.value === order.status)
                  ?.label ||
                  order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                <CreditCard className="h-3 w-3" />
                {order.payment_method?.toUpperCase() || "COD"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewOrder(order)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Xem Chi Tiết">
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleUpdateStatus(order)}
                  className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                  title="Cập Nhật Trạng Thái">
                  <Package className="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Không tìm thấy đơn hàng
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter
              ? "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn."
              : "Chưa có đơn hàng nào được đặt."}
          </p>
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setCurrentPage(1);
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filteredOrders.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hiển thị:
              </label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                mục
              </span>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị {pagination.from || 0} đến {pagination.to || 0} trong
              tổng số {pagination.total || 0} mục
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Đầu
            </button>

            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Trước
            </button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.last_page || 1) },
                (_, i) => {
                  const pageNumber =
                    Math.max(
                      1,
                      Math.min(
                        (pagination.last_page || 1) - 4,
                        Math.max(1, currentPage - 2)
                      )
                    ) + i;

                  if (pageNumber > (pagination.last_page || 1)) return null;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === pageNumber
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}>
                      {pageNumber}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === (pagination.last_page || 1)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Tiếp
            </button>

            <button
              onClick={() => setCurrentPage(pagination.last_page || 1)}
              disabled={currentPage === (pagination.last_page || 1)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Cuối
            </button>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Chi Tiết Đơn Hàng - ${selectedOrder?.order_number || `#${selectedOrder?.id}`}`}>
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mã Đơn Hàng
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedOrder.order_number || `#${selectedOrder.id}`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng Thái
                </label>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    selectedOrder.status
                  )}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {statusOptions.find(
                    (opt) => opt.value === selectedOrder.status
                  )?.label ||
                    selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ngày Đặt Hàng
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedOrder.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tổng Tiền
                </label>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {formatCurrency(selectedOrder.total || 0)}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Thông Tin Khách Hàng
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedOrder.address?.email ||
                      selectedOrder.user?.email ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedOrder.address?.phone || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Địa Chỉ Giao Hàng
              </h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div className="text-gray-700 dark:text-gray-300">
                  <p>{selectedOrder.address?.name || "N/A"}</p>
                  <p>{selectedOrder.address?.address || "N/A"}</p>
                  <p>Tỉnh/Thành Phố: {selectedOrder.address?.province?.name || "Chưa có thông tin"}</p>
                  <p>Phường/Xã: {selectedOrder.address?.ward_model?.name || "Chưa có thông tin"}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Sản Phẩm Đặt Hàng
              </h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
                    <img
                      src={item.book_image || item.book?.image_url || "/placeholder-book.jpg"}
                      alt={item.book_title || item.book?.title || "Book"}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.book_title || item.book?.title || "Unknown Title"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        bởi{" "}
                        {item.author_name || item.book?.author?.name || "Tác giả không xác định"}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          SL: {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(parseFloat(item.price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            {selectedOrder.notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Ghi Chú Đơn Hàng
                </h3>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
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
        onClose={() => {
          setIsStatusModalOpen(false);
          setAllowedStatuses([]);
          setNewStatus("");
          setCancellationReason("");
        }}
        title="Cập Nhật Trạng Thái Đơn Hàng"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                setIsStatusModalOpen(false);
                setAllowedStatuses([]);
                setNewStatus("");
                setCancellationReason("");
              }}>
              Hủy
            </button>
            <button
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              onClick={handleStatusUpdate}
              disabled={
                statusLoading ||
                loadingAllowedStatuses ||
                allowedStatuses.length === 0 ||
                (newStatus === 'cancelled' && !cancellationReason.trim())
              }>
              {statusLoading
                ? "Đang Cập Nhật..."
                : loadingAllowedStatuses
                ? "Đang Tải..."
                : "Cập Nhật Trạng Thái"}
            </button>
          </div>
        }>
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mã Đơn Hàng: {selectedOrder.order_number || `#${selectedOrder.id}`}
              </label>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng Thái Hiện Tại:{" "}
                {statusOptions.find((opt) => opt.value === selectedOrder.status)
                  ?.label || selectedOrder.status}
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng Thái Mới
              </label>
              {loadingAllowedStatuses ? (
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  Đang tải trạng thái được phép...
                </div>
              ) : (
                <select
                  value={newStatus}
                  onChange={(e) => {
                    // Chỉ cho phép chọn trạng thái được phép
                    const isAllowed = allowedStatuses.some(
                      (allowed) => allowed.value === e.target.value
                    );
                    if (isAllowed) {
                      setNewStatus(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent">
                  <option value="">-- Chọn trạng thái mới --</option>
                  {statusOptions.map((status) => {
                    const isAllowed = allowedStatuses.some(
                      (allowed) => allowed.value === status.value
                    );
                    const isCurrentStatus =
                      status.value === selectedOrder?.status;

                    return (
                      <option
                        key={status.value}
                        value={status.value}
                        disabled={!isAllowed || isCurrentStatus}
                        className={`${
                          !isAllowed || isCurrentStatus
                            ? "text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700"
                            : "text-gray-800 dark:text-gray-200"
                        }`}>
                        {status.label} {isCurrentStatus ? "(Hiện tại)" : ""}{" "}
                        {!isAllowed && !isCurrentStatus
                          ? "(Không được phép)"
                          : ""}
                      </option>
                    );
                  })}
                </select>
              )}
              {allowedStatuses.length === 0 && !loadingAllowedStatuses && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Đơn hàng này không thể thay đổi trạng thái.
                </p>
              )}
            </div>
            
            {/* Textarea cho lý do hủy khi chọn trạng thái cancelled */}
            {newStatus === 'cancelled' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lý do hủy đơn hàng <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Nhập lý do hủy đơn hàng..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
                {!cancellationReason.trim() && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Vui lòng nhập lý do hủy đơn hàng.
                  </p>
                )}
              </div>
            )}
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  Thay đổi trạng thái đơn hàng sẽ thông báo cho khách hàng qua
                  email.
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
