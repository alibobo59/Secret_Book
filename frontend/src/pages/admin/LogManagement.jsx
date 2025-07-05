import React, { useState, useEffect } from 'react';
import { useLog } from "../../contexts/LogContext";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LogManagement = () => {
  const { logs, getFilteredLogs, clearOldLogs, exportLogs, getLogStats } = useLog();
  
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    module: "all",
    severity: "all",
    user: "",
    dateFrom: "",
    dateTo: "",
  });
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);

  // Update filtered logs when filters change
  useEffect(() => {
    const filtered = getFilteredLogs({
      ...filters,
      search: searchTerm,
    });

    // Apply sorting
    const sorted = filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "timestamp") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredLogs(sorted);
    setCurrentPage(1); // Reset to first page when filters change
  }, [logs, filters, searchTerm, sortField, sortDirection, getFilteredLogs]);

  // Update stats
  useEffect(() => {
    setStats(getLogStats(7));
  }, [logs, getLogStats]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleExport = (format) => {
    const exportData = exportLogs(filters, format);
    const blob = new Blob([exportData], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  const handleClearOldLogs = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa các nhật ký cũ hơn 30 ngày không? Hành động này không thể hoàn tác.')) {
      const deletedCount = clearOldLogs(30);
      alert(`${deletedCount} nhật ký cũ đã được xóa.`);
    }
  };

  const getLogTypeIcon = (type) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'security':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low':
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const columns = [
    { id: "timestamp", label: "Thời gian", sortable: true },
    { id: "type", label: "Loại", sortable: true },
    { id: "action", label: "Hành động", sortable: true },
    { id: "user", label: "Người dùng", sortable: true },
    { id: "module", label: "Mô-đun", sortable: true },
    { id: "severity", label: "Mức độ", sortable: true },
    { id: "actions", label: "Thao tác", sortable: false },
  ];

  const typeOptions = [
    { value: "info", label: "Thông tin" },
    { value: "success", label: "Thành công" },
    { value: "warning", label: "Cảnh báo" },
    { value: "error", label: "Lỗi" },
    { value: "security", label: "Bảo mật" },
  ];

  const moduleOptions = [
    { value: "Authentication", label: "Xác thực" },
    { value: "Orders", label: "Đơn hàng" },
    { value: "Inventory", label: "Tồn kho" },
    { value: "Payments", label: "Thanh toán" },
    { value: "System", label: "Hệ thống" },
    { value: "Security", label: "Bảo mật" },
    { value: "Communications", label: "Liên lạc" },
    { value: "General", label: "Tổng quát" },
  ];

  const severityOptions = [
    { value: "Low", label: "Thấp" },
    { value: "Medium", label: "Trung bình" },
    { value: "High", label: "Cao" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Nhật Ký Hệ Thống"
        hideAddButton
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Activity className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          title="Tổng nhật ký (7 ngày)"
          value={stats.total || 0}
        />
        <StatCard
          icon={<XCircle className="h-6 w-6" />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          title="Lỗi"
          value={stats.byType?.error || 0}
        />
        <StatCard
          icon={<AlertTriangle className="h-6 w-6" />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          title="Cảnh báo"
          value={stats.byType?.warning || 0}
        />
        <StatCard
          icon={<Shield className="h-6 w-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          title="Sự Kiện Bảo Mật"
          value={stats.byType?.security || 0}
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
          <div className="flex gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4" />
              Xuất
            </button>
            <button
              onClick={handleClearOldLogs}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              <Trash2 className="h-4 w-4" />
              Xóa cũ
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loại
                </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <option value="all">Tất cả loại</option>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô-đun
                </label>
            <select
              value={filters.module}
              onChange={(e) => handleFilterChange("module", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <option value="all">Tất cả mô-đun</option>
              {moduleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mức độ
                </label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange("severity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <option value="all">Tất cả mức độ</option>
              {severityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Người dùng
                </label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => handleFilterChange("user", e.target.value)}
              placeholder="Lọc theo người dùng..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} trong tổng số {filteredLogs.length} nhật ký
        </p>
      </div>

      {/* Logs Table */}
      <Table
        columns={columns}
        data={currentLogs}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        renderRow={(log) => {
          const timestamp = formatTimestamp(log.timestamp);
          return (
            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <div>
                  <div className="font-medium">{timestamp.date}</div>
                  <div className="text-xs text-gray-400">{timestamp.time}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getLogTypeColor(log.type)}`}>
                  {getLogTypeIcon(log.type)}
                  {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                <div className="max-w-xs truncate" title={log.action}>
                  {log.action}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {log.user}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {log.module}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                  {log.severity}
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
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
            Trước
          </button>
          
          <div className="flex gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNumber = currentPage <= 3 ? index + 1 : currentPage - 2 + index;
              if (pageNumber > totalPages) return null;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-2 border rounded-md ${
                    currentPage === pageNumber
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                  {pageNumber}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
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
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loại
                    </label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getLogTypeColor(selectedLog.type)}`}>
                      {getLogTypeIcon(selectedLog.type)}
                      {selectedLog.type.charAt(0).toUpperCase() + selectedLog.type.slice(1)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Người dùng
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedLog.user}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mô-đun
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedLog.module}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mức độ
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedLog.severity)}`}>
                      {selectedLog.severity}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Địa chỉ IP
                </label>
                    <p className="text-gray-900 dark:text-white">{selectedLog.ipAddress}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hành động
                </label>
                  <p className="text-gray-900 dark:text-white">{selectedLog.action}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chi tiết
                </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    {selectedLog.details}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tác nhân người dùng
                </label>
                  <p className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
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
                Xuất {filteredLogs.length} nhật ký đã lọc theo định dạng bạn muốn.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleExport('json')}
                  className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Download className="h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800 dark:text-white">Định dạng JSON</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Định dạng máy có thể đọc</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('csv')}
                  className="w-full flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Download className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800 dark:text-white">Định dạng CSV</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tương thích với bảng tính</div>
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