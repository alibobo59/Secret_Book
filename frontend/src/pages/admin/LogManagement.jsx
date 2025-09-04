import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  PageHeader,
  Table,
  SearchFilter,
  StatCard,
} from "../../components/admin";
import {
  Activity,
  AlertTriangle,
  Shield,
  Download,
  Trash2,
  Filter,
  Calendar,
  User,
  Server,
  Eye,
  RefreshCw,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LogManagement = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    auditable_type: "",
    event: "",
    user_id: "",
    date_from: "",
    date_to: "",
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        search: searchTerm,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await api.get("/audit-logs", { params });
      setAuditLogs(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Không thể tải nhật ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await api.get("/audit-logs/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, []);

  // Refetch when filters or pagination change
  useEffect(() => {
    fetchAuditLogs();
  }, [filters, searchTerm, pagination.current_page]);

  const handleRefresh = () => {
    fetchAuditLogs(filters);
    fetchStats();
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    fetchAuditLogs({ ...filters, page });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const params = {
        search: searchTerm,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await api.get("/audit-logs/export", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Error exporting logs:", err);
      setError("Không thể xuất nhật ký. Vui lòng thử lại.");
    }
  };

  const handleClearOldLogs = () => {
    alert(
      "Tính năng xóa nhật ký cũ sẽ được triển khai trong phiên bản tương lai."
    );
  };

  const getEventIcon = (event) => {
    switch (event) {
      case "created":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "updated":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "deleted":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "restored":
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventColor = (event) => {
    switch (event) {
      case "created":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "updated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "deleted":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "restored":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatModelType = (auditableType) => {
    if (!auditableType) return "N/A";
    const modelName = auditableType.split("\\").pop();
    const modelTypeMap = {
      Book: "Sách",
      Author: "Tác giả",
      Category: "Danh mục",
      Publisher: "Nhà xuất bản",
      User: "Người dùng",
      Order: "Đơn hàng",
      Review: "Đánh giá",
    };
    return modelTypeMap[modelName] || modelName;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString("vi-VN");
    const timeStr = date.toLocaleTimeString("vi-VN", { hour12: false });
    return {
      date: dateStr,
      time: timeStr,
      full: `${dateStr} ${timeStr}`,
    };
  };

  const columns = [
    { id: "created_at", label: "Thời gian", sortable: false },
    { id: "event", label: "Sự kiện", sortable: false },
    { id: "auditable_type", label: "Loại mô hình", sortable: false },
    { id: "user_name", label: "Người dùng", sortable: false },
    { id: "ip_address", label: "Địa chỉ IP", sortable: false },
    { id: "actions", label: "Thao tác", sortable: false },
  ];

  const eventOptions = [
    { value: "created", label: "Tạo mới" },
    { value: "updated", label: "Cập nhật" },
    { value: "deleted", label: "Xóa" },
    { value: "restored", label: "Khôi phục" },
  ];

  const modelTypeOptions = [
    { value: "App\\Models\\Book", label: "Sách" },
    { value: "App\\Models\\Author", label: "Tác giả" },
    { value: "App\\Models\\Category", label: "Danh mục" },
    { value: "App\\Models\\Publisher", label: "Nhà xuất bản" },
    { value: "App\\Models\\User", label: "Người dùng" },
    { value: "App\\Models\\Order", label: "Đơn hàng" },
    { value: "App\\Models\\Review", label: "Đánh giá" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleRefresh}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200">
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Nhật Ký Hệ Thống" hideAddButton />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Activity className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          title="Tổng nhật ký"
          value={stats.total_logs || 0}
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          title="Tạo mới"
          value={stats.events?.created || 0}
        />
        <StatCard
          icon={<Info className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          title="Cập nhật"
          value={stats.events?.updated || 0}
        />
        <StatCard
          icon={<XCircle className="h-6 w-6" />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          title="Xóa"
          value={stats.events?.deleted || 0}
        />
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-grow">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm kiếm nhật ký theo hành động, người dùng hoặc chi tiết..."
            />
          </div>

          {/* Action Buttons */}
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sự kiện
            </label>
            <select
              value={filters.event}
              onChange={(e) => handleFilterChange("event", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <option value="">Tất cả sự kiện</option>
              {eventOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Loại mô hình
            </label>
            <select
              value={filters.auditable_type}
              onChange={(e) =>
                handleFilterChange("auditable_type", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <option value="">Tất cả mô hình</option>
              {modelTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID người dùng
            </label>
            <input
              type="text"
              value={filters.user_id}
              onChange={(e) => handleFilterChange("user_id", e.target.value)}
              placeholder="Lọc theo ID người dùng..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {(pagination.current_page - 1) * pagination.per_page + 1}-
          {Math.min(
            pagination.current_page * pagination.per_page,
            pagination.total
          )}{" "}
          trong tổng số {pagination.total} nhật ký
        </p>
      </div>

      {/* Logs Table */}
      <Table
        columns={columns}
        data={auditLogs}
        renderRow={(log) => {
          const timestamp = formatTimestamp(log.created_at);
          return (
            <tr
              key={log.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <div>
                  <div className="font-medium">{timestamp.date}</div>
                  <div className="text-xs text-gray-400">{timestamp.time}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEventColor(
                    log.event
                  )}`}>
                  {getEventIcon(log.event)}
                  {log.event.charAt(0).toUpperCase() + log.event.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                <div className="max-w-xs truncate" title={log.auditable_type}>
                  {formatModelType(log.auditable_type)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {log.user_name || "N/A"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {log.ip_address || "N/A"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleViewDetails(log)}
                  className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                  title="Xem Chi Tiết">
                  <Eye className="h-5 w-5" />
                </button>
              </td>
            </tr>
          );
        }}
      />

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() =>
              handlePageChange(Math.max(pagination.current_page - 1, 1))
            }
            disabled={pagination.current_page === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
            Trước
          </button>

          <div className="flex gap-1">
            {[...Array(Math.min(5, pagination.last_page))].map((_, index) => {
              const pageNumber =
                pagination.current_page <= 3
                  ? index + 1
                  : pagination.current_page - 2 + index;
              if (pageNumber > pagination.last_page) return null;

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 border rounded-md ${
                    pagination.current_page === pageNumber
                      ? "bg-amber-600 text-white border-amber-600"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}>
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              handlePageChange(
                Math.min(pagination.current_page + 1, pagination.last_page)
              )
            }
            disabled={pagination.current_page === pagination.last_page}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
            Tiếp
          </button>
        </div>
      )}

      {/* Log Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDetailModalOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Chi tiết nhật ký
                </h2>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thời gian
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedLog.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sự kiện
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEventColor(
                        selectedLog.event
                      )}`}>
                      {getEventIcon(selectedLog.event)}
                      {selectedLog.event.charAt(0).toUpperCase() +
                        selectedLog.event.slice(1)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Người dùng
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedLog.user_name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loại mô hình
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatModelType(selectedLog.auditable_type)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ID mô hình
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedLog.auditable_id || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Địa chỉ IP
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedLog.ip_address || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedLog.old_values &&
                  Object.keys(selectedLog.old_values).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Giá trị cũ
                      </label>
                      <pre className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm overflow-x-auto">
                        {JSON.stringify(selectedLog.old_values, null, 2)}
                      </pre>
                    </div>
                  )}

                {selectedLog.new_values &&
                  Object.keys(selectedLog.new_values).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Giá trị mới
                      </label>
                      <pre className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm overflow-x-auto">
                        {JSON.stringify(selectedLog.new_values, null, 2)}
                      </pre>
                    </div>
                  )}

                {selectedLog.user_agent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tác nhân người dùng
                    </label>
                    <p className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md break-all">
                      {selectedLog.user_agent}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {isExportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExportModalOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Xuất nhật ký
                </h2>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Xuất {pagination.total} nhật ký đã lọc theo định dạng bạn muốn.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Download className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800 dark:text-white">
                      Định dạng CSV
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Tương thích với bảng tính
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogManagement;
