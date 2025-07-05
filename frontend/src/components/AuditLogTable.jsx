import React, { useState, useEffect, Fragment } from "react";
import {
  Calendar,
  User,
  Activity,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Clock,
  Info,
} from "lucide-react";
import { api } from "../services/api";
import Loading from "./admin/Loading";

const AuditLogTable = ({
  modelType = "",
  modelId = "",
  searchTerm = "",
  days = "",
  showModelColumn = false,
  className = "",
}) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    event: "",
    dateFrom: "",
    dateTo: "",
    search: searchTerm || "",
  });
  const [exporting, setExporting] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchAuditLogs();
  }, [modelType, modelId, currentPage, filters, days]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchTerm || "" }));
  }, [searchTerm]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);

      // --- START: CORRECTED LOGIC ---
      const isModelSpecific = modelType && modelId;

      const endpoint = isModelSpecific
        ? `/audit-logs/${encodeURIComponent(modelType.replace(/\/\//g, '\\'))}/${modelId}`
        : "/audit-logs";

      // Base parameters that apply to both endpoints
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        ...filters,
      };

      // Only add these parameters if we are using the general endpoint
      if (!isModelSpecific) {
        if (modelType) params.auditable_type = modelType;
        if (modelId) params.model_id = modelId;
      }

      if (days) params.days = days;
      // --- END: CORRECTED LOGIC ---

      const response = await api.get(endpoint, { params });

      setAuditLogs(response.data.data || response.data);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || response.data.length);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      // --- START: CORRECTED LOGIC ---
      const params = { ...filters };
      // Use the correct and consistent parameter name: auditable_type
      if (modelType) params.auditable_type = modelType;
      if (modelId) params.model_id = modelId;
      if (days) params.days = days;
      // --- END: CORRECTED LOGIC ---

      const response = await api.get("/audit-logs/export", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting audit logs:", err);
      alert("Failed to export audit logs");
    } finally {
      setExporting(false);
    }
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case "created":
        return "bg-green-100 text-green-800";
      case "updated":
        return "bg-amber-100 text-amber-800";
      case "deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatModelName = (modelType) => {
    return modelType ? modelType.split("\\").pop() : "Unknown";
  };

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const toggleRowExpansion = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const openDetailModal = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedLog(null);
    setShowDetailModal(false);
  };

  const getFieldLabel = (key) => {
    const fieldLabels = {
      title: 'Title',
      name: 'Name',
      description: 'Description',
      price: 'Price',
      stock_quantity: 'Số lượng tồn kho',
      category_id: 'Category',
      author_id: 'Author',
      publisher_id: 'Publisher',
      email: 'Email',
      status: 'Status',
      payment_status: 'Payment Status',
      total_amount: 'Total Amount',
      shipping_address: 'Shipping Address',
      bio: 'Biography',
      address: 'Address',
      sku: 'SKU',
      image: 'Image',
      created_at: 'Created At',
      updated_at: 'Updated At'
    };
    return fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'Không có';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  const renderChanges = (oldValues, newValues, event, logId, isModal = false) => {
    const isExpanded = expandedRows.has(logId) || isModal;
    
    if (event === "created") {
      const entries = Object.entries(newValues || {});
      const visibleEntries = isExpanded ? entries : entries.slice(0, 2);
      
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            {visibleEntries.map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {getFieldLabel(key)}:
                </span>
                <div className="ml-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-400">
                  <span className="text-green-700 dark:text-green-300 font-mono text-xs">
                    {formatValue(value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {entries.length > 2 && !isModal && (
             <button
               onClick={() => toggleRowExpansion(logId)}
               className="flex items-center text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
             >
               {isExpanded ? (
                 <><ChevronUp className="w-3 h-3 mr-1" /> Ẩn bớt</>
               ) : (
                 <><ChevronDown className="w-3 h-3 mr-1" /> Hiện thêm {entries.length - 2}</>
               )}
             </button>
           )}
        </div>
      );
    }

    if (event === "deleted") {
      const entries = Object.entries(oldValues || {});
      const visibleEntries = isExpanded ? entries : entries.slice(0, 2);
      
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            {visibleEntries.map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {getFieldLabel(key)}:
                </span>
                <div className="ml-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                  <span className="text-red-700 dark:text-red-300 font-mono text-xs line-through">
                    {formatValue(value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {entries.length > 2 && (
            <button
              onClick={() => toggleRowExpansion(logId)}
              className="flex items-center text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              {isExpanded ? (
                <><ChevronUp className="w-3 h-3 mr-1" /> Ẩn bớt</>
              ) : (
                <><ChevronDown className="w-3 h-3 mr-1" /> Hiện thêm {entries.length - 2}</>
              )}
            </button>
          )}
        </div>
      );
    }

    if (event === "updated") {
      const changes = [];
      const allKeys = new Set([
        ...Object.keys(oldValues || {}),
        ...Object.keys(newValues || {}),
      ]);

      allKeys.forEach((key) => {
        const oldVal = oldValues?.[key];
        const newVal = newValues?.[key];
        if (oldVal !== newVal) {
          changes.push({ key, oldVal, newVal });
        }
      });

      if (changes.length === 0) {
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            Không phát hiện thay đổi
          </div>
        );
      }

      const visibleChanges = isExpanded ? changes : changes.slice(0, 2);

      return (
        <div className="space-y-2">
          <div className="space-y-3">
            {visibleChanges.map(({ key, oldVal, newVal }) => (
              <div key={key} className="text-sm">
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getFieldLabel(key)}:
                </div>
                <div className="ml-2 space-y-1">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                    <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Before:</span>
                    <div className="text-red-700 dark:text-red-300 font-mono text-xs mt-1">
                      {formatValue(oldVal)}
                    </div>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-400">
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">After:</span>
                    <div className="text-green-700 dark:text-green-300 font-mono text-xs mt-1">
                      {formatValue(newVal)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {changes.length > 2 && (
            <button
              onClick={() => toggleRowExpansion(logId)}
              className="flex items-center text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              {isExpanded ? (
                <><ChevronUp className="w-3 h-3 mr-1" /> Ẩn bớt</>
              ) : (
                <><ChevronDown className="w-3 h-3 mr-1" /> Hiện thêm {changes.length - 2} thay đổi</>
              )}
            </button>
          )}
          {changes.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {changes.length} trường đã thay đổi
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderDetailModal = () => {
    if (!selectedLog || !showDetailModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getEventTypeColor(selectedLog.event).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Chi tiết nhật ký kiểm toán
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatModelName(selectedLog.auditable_type)} #{selectedLog.auditable_id}
                </p>
              </div>
            </div>
            <button
              onClick={closeDetailModal}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loại sự kiện
                  </label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getEventTypeColor(selectedLog.event)}`}>
                    {selectedLog.event.charAt(0).toUpperCase() + selectedLog.event.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loại mô hình
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatModelName(selectedLog.auditable_type)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID bản ghi
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    #{selectedLog.auditable_id}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Người dùng
                  </label>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {selectedLog.user_name || 'System'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Địa chỉ IP
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {selectedLog.ip_address || 'Không có'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày & Giờ
                  </label>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      <div>{new Date(selectedLog.created_at).toLocaleDateString()}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {new Date(selectedLog.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Changes Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-amber-500" />
                Thay đổi chi tiết
              </h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                {renderChanges(selectedLog.old_values, selectedLog.new_values, selectedLog.event, selectedLog.id, true)}
              </div>
            </div>

            {/* Raw Data Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Dữ liệu thô
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Giá trị cũ
                    </label>
                    <pre className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Giá trị mới
                    </label>
                    <pre className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={closeDetailModal}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Event Filter */}
            <select
              value={filters.event}
              onChange={(e) => handleFilterChange("event", e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
              <option value="">All Events</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
            </select>

            {/* Date From */}
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="From Date"
            />

            {/* Date To */}
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="To Date"
            />
          </div>

          <div className="flex gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search audit logs..."
                className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">
              <Download className="w-4 h-4 mr-2" />
              {exporting ? "Đang xuất..." : "Xuất"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sự kiện
              </th>
              {showModelColumn && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mô hình
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Thay đổi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ngày
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {auditLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={showModelColumn ? 6 : 5}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Không tìm thấy nhật ký kiểm toán
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(
                        log.event
                      )}`}>
                      {log.event.charAt(0).toUpperCase() + log.event.slice(1)}
                    </span>
                  </td>
                  {showModelColumn && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {formatModelName(log.auditable_type)} #{log.auditable_id}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {log.user_name || "System"}
                        </div>
                        {log.ip_address && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {log.ip_address}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      {renderChanges(log.old_values, log.new_values, log.event, log.id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-gray-200">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <div>
                        <div>
                          {new Date(log.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openDetailModal(log)}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số {totalItems}{" "}
              kết quả
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Trước
              </button>

              <span className="text-sm text-gray-700 dark:text-gray-300">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                Tiếp
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      {showDetailModal && selectedLog && renderDetailModal()}
    </div>
  );
};

export default AuditLogTable;
