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
      setError("Failed to fetch audit logs");
      console.error("Error fetching audit logs:", err);
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
      console.error("Error exporting audit logs:", err);
    }
  };

  const getEventBadgeColor = (event) => {
    switch (event) {
      case "created":
        return "bg-green-100 text-green-800";
      case "updated":
        return "bg-blue-100 text-blue-800";
      case "deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <div className="bg-blue-50 p-3 rounded border">
              <div className="font-medium text-sm text-blue-700 mb-2">
                Change Summary
              </div>
              <div className="space-y-1">
                {log.enhanced_metadata.change_summary.map((summary, index) => (
                  <div key={index} className="text-sm text-blue-600">
                    • {summary}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Business Impact */}
          {log.enhanced_metadata.business_impact && log.enhanced_metadata.business_impact.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded border">
              <div className="font-medium text-sm text-yellow-700 mb-2">
                Business Impact
              </div>
              <div className="space-y-1">
                {log.enhanced_metadata.business_impact.map((impact, index) => (
                  <div key={index} className="text-sm text-yellow-600">
                    • {impact}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Changed Fields */}
          {log.enhanced_metadata.changed_fields && log.enhanced_metadata.changed_fields.length > 0 && (
            <div className="bg-gray-50 p-3 rounded border">
              <div className="font-medium text-sm text-gray-700 mb-2">
                Changed Fields
              </div>
              <div className="flex flex-wrap gap-2">
                {log.enhanced_metadata.changed_fields.map((field, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
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
          <div key={index} className="bg-gray-50 p-3 rounded border">
            <div className="font-medium text-sm text-gray-700 mb-1">
              {change.field}
            </div>
            <div className="text-sm">
              {change.action === "created" && (
                <span className="text-green-600">
                  <strong>Created:</strong> {change.new || "N/A"}
                </span>
              )}
              {change.action === "updated" && (
                <div>
                  <span className="text-red-600">
                    <strong>From:</strong> {change.old || "N/A"}
                  </span>
                  <br />
                  <span className="text-green-600">
                    <strong>To:</strong> {change.new || "N/A"}
                  </span>
                </div>
              )}
              {change.action === "deleted" && (
                <span className="text-red-600">
                  <strong>Deleted:</strong> {change.old || "N/A"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Audit Logs
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({pagination.total} total)
            </span>
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={filters.event}
                onChange={(e) => handleFilterChange("event", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Events</option>
                <option value="created">Đã Tạo</option>
                <option value="updated">Đã Cập Nhật</option>
                <option value="deleted">Đã Xóa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ Ngày
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến Ngày
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search user, event..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No audit logs found
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-gray-50">
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
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {log.user_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {((log.enhanced_metadata && log.enhanced_metadata.change_summary) ||
                        (log.formatted_changes && log.formatted_changes.length > 0)) && (
                          <button
                            onClick={() => toggleRowExpansion(log.id)}
                            className="flex items-center text-blue-600 hover:text-blue-800">
                            {expandedRows.has(log.id) ? (
                              <ChevronUp className="w-4 h-4 mr-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 mr-1" />
                            )}
                            View Changes
                          </button>
                        )}
                    </td>
                  </tr>
                  {expandedRows.has(log.id) && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-50">
                        <div className="max-w-4xl">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Change Details:
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
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.current_page - 1) * pagination.per_page + 1}{" "}
              to{" "}
              {Math.min(
                pagination.current_page * pagination.per_page,
                pagination.total
              )}{" "}
              of {pagination.total} results
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
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <span className="px-3 py-2 text-sm">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current_page: prev.current_page + 1,
                  }))
                }
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogTable;
