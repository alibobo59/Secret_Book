import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  User,
  CreditCard,
  Calendar,
  Activity,
  MapPin,
  Phone,
  Mail,
  Hash,
  DollarSign,
  FileText,
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/formatCurrency";
import Loading from "../../components/admin/Loading";
import AuditLogTable from "../../components/admin/AuditLogTable";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole, getToken } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [allowedStatuses, setAllowedStatuses] = useState([]);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await api.get(`/admin/orders/${id}`, config);
      setOrder(response.data.data || response.data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err.response?.data?.error || "Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/admin/orders/${id}`);
      navigate("/admin/orders", {
        state: { message: "Đơn hàng đã được xóa thành công" },
      });
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Không thể xóa đơn hàng");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const statusColors = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    shipped:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    delivered:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const statusLabels = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã gửi",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };

  const getStatusBadgeColor = (status) => {
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const fetchAllowedStatuses = async () => {
    try {
      const token = getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await api.get(
        `/admin/orders/${id}/allowed-statuses`,
        config
      );
      setAllowedStatuses(response.data.allowed_statuses || []);
    } catch (err) {
      console.error("Error fetching allowed statuses:", err);
      setError("Không thể tải danh sách trạng thái được phép");
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      setError("Vui lòng chọn trạng thái mới");
      return;
    }

    try {
      setUpdating(true);
      const token = getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await api.patch(
        `/admin/orders/${id}/status`,
        { status: newStatus },
        config
      );

      // Refresh order data
      await fetchOrder();

      setShowUpdateStatusModal(false);
      setNewStatus("");
      setError(null);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(
        err.response?.data?.error || "Không thể cập nhật trạng thái đơn hàng"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleShowUpdateModal = () => {
    fetchAllowedStatuses();
    setShowUpdateStatusModal(true);
  };

  const handleBack = () => {
    navigate("/admin/orders");
  };

  if (loading) return <Loading />;

  if (error && !order) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-amber-600 hover:text-amber-800 mr-4">
            <ArrowLeft size={20} className="mr-2" />
            Quay lại danh sách đơn hàng
          </button>
        </div>
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Đơn hàng #{order.order_number || order.id}
                  </h1>
                  <span
                    className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[order.status] ||
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Chi tiết đơn hàng
                </p>
              </div>
            </div>
            {hasRole(["admin"]) && (
              <div className="flex space-x-3">
                <button
                  onClick={handleShowUpdateModal}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Edit className="w-4 h-4 mr-2" />
                  Cập nhật trạng thái
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "details"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}>
                <Package className="w-4 h-4 inline mr-2" />
                Chi tiết
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "audit"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}>
                <Activity className="w-4 h-4 inline mr-2" />
                Kiểm tra Logs
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Thông tin đơn hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Mã đơn hàng
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      #{order.order_number || order.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Trạng thái
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Tổng tiền
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(order.total_amount || order.total)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Phương thức thanh toán
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.payment_method || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Sản phẩm trong đơn hàng
                </h2>
                {order.items && order.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Sản phẩm
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Số lượng
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Đơn giá
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {order.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {item.book &&
                                  (item.book.cover_image ||
                                    item.book.image) && (
                                    <img
                                      className="h-10 w-10 rounded-lg object-cover mr-4"
                                      src={
                                        item.book.cover_image || item.book.image
                                      }
                                      alt={item.book.title}
                                    />
                                  )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.book ? (
                                      <Link
                                        to={`/admin/books/${item.book.id}`}
                                        className="hover:text-blue-600 dark:hover:text-blue-400">
                                        {item.book.title}
                                      </Link>
                                    ) : (
                                      item.product_name || "N/A"
                                    )}
                                  </div>
                                  {item.book && item.book.author && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {item.book.author.name}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.quantity * item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Không có sản phẩm nào trong đơn hàng
                  </p>
                )}
              </div>

              {/* Account Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Thông tin tài khoản đặt hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tên tài khoản
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.user ? (
                        <Link
                          to={`/admin/users/${order.user.id}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400">
                          {order.user.name}
                        </Link>
                      ) : (
                        "Khách vãng lai"
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email tài khoản
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.user?.email || "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Số điện thoại tài khoản
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.user?.phone || "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID tài khoản
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.user?.id || "Không có"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Thông tin người nhận hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tên người nhận
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.customer_name || order.user?.name || "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email người nhận
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.customer_email || order.user?.email || "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Số điện thoại người nhận
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.customer_phone || "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Địa chỉ giao hàng
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.shipping_address || "Không có"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Thông tin thanh toán
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phương thức thanh toán
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.payment_method === "cod"
                        ? "Thanh toán khi nhận hàng"
                        : order.payment_method === "bank_transfer"
                        ? "Chuyển khoản ngân hàng"
                        : order.payment_method === "credit_card"
                        ? "Thẻ tín dụng"
                        : order.payment_method || "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Trạng thái thanh toán
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                          order.payment_status
                        )}`}>
                        {order.payment_status === "paid"
                          ? "Đã thanh toán"
                          : order.payment_status === "pending"
                          ? "Chờ thanh toán"
                          : order.payment_status === "failed"
                          ? "Thanh toán thất bại"
                          : order.payment_status || "Chờ thanh toán"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mã giao dịch
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.transaction_id || "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ngày thanh toán
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {order.payment_date
                        ? new Date(order.payment_date).toLocaleString("vi-VN")
                        : "Chưa thanh toán"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Thông tin khách hàng
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tên khách hàng
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {order.user?.name || order.customer_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {order.user?.email || order.customer_email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Số điện thoại
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {order.user?.phone || order.customer_phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Địa chỉ giao hàng
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {order.shipping_address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Thông tin thanh toán
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phương thức thanh toán
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {order.payment_method || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trạng thái thanh toán
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {order.payment_status === "paid"
                          ? "Đã thanh toán"
                          : order.payment_status === "pending"
                          ? "Chờ thanh toán"
                          : order.payment_status === "failed"
                          ? "Thanh toán thất bại"
                          : order.payment_status || "N/A"}
                      </span>
                    </div>
                  </div>
                  {order.transaction_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mã giao dịch
                      </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded font-mono text-sm">
                        {order.transaction_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  Tóm tắt đơn hàng
                </h3>
                <div className="space-y-3">
                  {order.subtotal && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tạm tính
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(order.subtotal)}
                      </span>
                    </div>
                  )}
                  {order.tax && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Thuế
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(order.tax)}
                      </span>
                    </div>
                  )}
                  {order.shipping && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Phí vận chuyển
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(order.shipping)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Tổng cộng
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(order.total_amount || order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Lịch sử đơn hàng
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Đơn hàng được tạo
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("vi-VN")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {order.updated_at !== order.created_at && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Cập nhật lần cuối
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.updated_at
                            ? new Date(order.updated_at).toLocaleString("vi-VN")
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.shipped_at && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Đã gửi hàng
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.shipped_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.delivered_at && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Đã giao hàng
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.delivered_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Lịch sử thay đổi
            </h2>
            <AuditLogTable modelType="Order" modelId={id} className="" />
          </div>
        )}

        {/* Update Status Modal */}
        {showUpdateStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cập nhật trạng thái đơn hàng
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng thái mới
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Chọn trạng thái</option>
                  {allowedStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status] || status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUpdateStatusModal(false);
                    setNewStatus("");
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                  disabled={updating}>
                  Hủy
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={updating || !newStatus}>
                  {updating ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Xác nhận xóa
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bạn có chắc chắn muốn xóa đơn hàng "#
                {order.order_number || order.id}"? Hành động này không thể hoàn
                tác và sẽ xóa tất cả các sản phẩm liên quan trong đơn hàng.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                  disabled={deleting}>
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={deleting}>
                  {deleting ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
