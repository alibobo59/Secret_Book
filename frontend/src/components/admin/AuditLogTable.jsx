import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  Activity,
} from "lucide-react";
import { api } from "../../services/api";
import Loading from "./Loading";

const AuditLogTable = ({ modelType, modelId, className = "" }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [filters, setFilters] = useState({
    event: "",
    user_id: "",
    date_from: "",
    date_to: "",
    search: "",
  });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [modelType, modelId, pagination.current_page, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
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

      let response;
      if (modelType && modelId) {
        // Format the model type correctly with backslashes and encode it
        const formattedModelType = modelType.replace(/\/{2,}/g, "\\");
        const encodedModelType = encodeURIComponent(formattedModelType);
        // Get logs for specific model
        response = await api.get(`/audit-logs/${encodedModelType}/${modelId}`, {
          params,
        });
      } else {
        // Get all logs
        response = await api.get("/audit-logs", { params });
      }

      setAuditLogs(response.data.data);
      if (response.data.pagination) {
        // For model-specific audit logs
        setPagination({
          current_page: response.data.pagination.current_page,
          last_page: response.data.pagination.last_page,
          per_page: response.data.pagination.per_page,
          total: response.data.pagination.total,
        });
      } else {
        // For general audit logs
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      }
    } catch (err) {
      setError("Không thể tải nhật ký kiểm tra");
      console.error("Lỗi khi tải nhật ký kiểm tra:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const toggleRowExpansion = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const handleExport = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      if (modelType && modelId) {
        params.auditable_type = modelType;
        params.auditable_id = modelId;
      }

      const response = await api.get("/audit-logs/export", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `audit_logs_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi khi xuất nhật ký kiểm tra:", err);
    }
  };

  const getEventBadgeColor = (event) => {
    switch (event) {
      case "created":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "updated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "deleted":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderChangeDetails = (log) => {
    // Check for enhanced metadata first, then fall back to formatted_changes
    const hasEnhancedMetadata = log.enhanced_metadata && log.enhanced_metadata.change_summary;
    const hasFormattedChanges = log.formatted_changes && log.formatted_changes.length > 0;
    
    if (!hasEnhancedMetadata && !hasFormattedChanges) return null;

    if (hasEnhancedMetadata) {
      return (
        <div className="mt-2 space-y-3">
          {/* Change Summary */}
          {log.enhanced_metadata.change_summary && log.enhanced_metadata.change_summary.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border dark:border-blue-800">
              <div className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-2">
                Tóm Tắt Thay Đổi
              </div>
              <div className="space-y-1">
                {log.enhanced_metadata.change_summary.map((summary, index) => (
                  <div key={index} className="text-sm text-blue-600 dark:text-blue-400">
                    • {summary}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Business Impact */}
          {log.enhanced_metadata.business_impact && log.enhanced_metadata.business_impact.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border dark:border-yellow-800">
              <div className="font-medium text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                Tác Động Kinh Doanh
              </div>
              <div className="space-y-1">
                {log.enhanced_metadata.business_impact.map((impact, index) => (
                  <div key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                    • {impact}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Changed Fields */}
          {log.enhanced_metadata.changed_fields && log.enhanced_metadata.changed_fields.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
              <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                Các Trường Đã Thay Đổi
              </div>
              <div className="flex flex-wrap gap-2">
                {log.enhanced_metadata.changed_fields.map((field, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Fallback to original formatted_changes display
    return (
      <div className="mt-2 space-y-2">
        {log.formatted_changes.map((change, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
            <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
              {change.field}
            </div>
            <div className="text-sm">
              {change.action === "created" && (
                <span className="text-green-600 dark:text-green-400">
                  <strong>Đã Tạo:</strong> {change.new || "N/A"}
                </span>
              )}
              {change.action === "updated" && (
                <div>
                  <span className="text-red-600 dark:text-red-400">
                    <strong>Từ:</strong> {change.old || "N/A"}
                  </span>
                  <br />
                  <span className="text-green-600 dark:text-green-400">
                    <strong>Đến:</strong> {change.new || "N/A"}
                  </span>
                </div>
              )}
              {change.action === "deleted" && (
                <span className="text-red-600 dark:text-red-400">
                  <strong>Đã Xóa:</strong> {change.old || "N/A"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 dark:text-red-400 p-4">{error}</div>;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Nhật Ký Kiểm Tra
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({pagination.total} total)
            </span>
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
              <Filter className="w-4 h-4 mr-1" />
              Bộ Lọc
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600">
              <Download className="w-4 h-4 mr-1" />
              Xuất
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loại Sự Kiện
              </label>
              <select
                value={filters.event}
                onChange={(e) => handleFilterChange("event", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white">
                <option value="">Tất Cả Sự Kiện</option>
                <option value="created">Đã Tạo</option>
                <option value="updated">Đã Cập Nhật</option>
                <option value="deleted">Đã Xóa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Từ Ngày
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Đến Ngày
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tìm Kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng, sự kiện..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sự Kiện
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Người Dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ngày
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Địa Chỉ IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Không tìm thấy nhật ký kiểm tra
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventBadgeColor(
                          log.event
                        )}`}>
                        {log.event}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {log.user_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {((log.enhanced_metadata && log.enhanced_metadata.change_summary) ||
                        (log.formatted_changes && log.formatted_changes.length > 0)) && (
                          <button
                            onClick={() => toggleRowExpansion(log.id)}
                            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                            {expandedRows.has(log.id) ? (
                              <ChevronUp className="w-4 h-4 mr-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 mr-1" />
                            )}
                            Xem Thay Đổi
                          </button>
                        )}
                    </td>
                  </tr>
                  {expandedRows.has(log.id) && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                        <div className="max-w-4xl">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Chi Tiết Thay Đổi:
                          </h4>
                          {renderChangeDetails(log)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị {(pagination.current_page - 1) * pagination.per_page + 1}{" "}
              đến{" "}
              {Math.min(
                pagination.current_page * pagination.per_page,
                pagination.total
              )}{" "}
              trong tổng số {pagination.total} kết quả
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current_page: prev.current_page - 1,
                  }))
                }
                disabled={pagination.current_page === 1}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white dark:bg-gray-800">
                Trước
              </button>
              <span className="px-3 py-2 text-sm dark:text-white">
                Trang {pagination.current_page} / {pagination.last_page}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current_page: prev.current_page + 1,
                  }))
                }
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white dark:bg-gray-800">
                Tiếp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogTable;
