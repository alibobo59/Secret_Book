import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Activity,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
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
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        ...filters,
      };

      // In fetchAuditLogs function, change:
      if (modelType) params.auditable_type = modelType; // Instead of model_type
      if (modelId) params.model_id = modelId;
      if (days) params.days = days;

      const endpoint =
        modelType && modelId
          ? `/audit-logs/${encodeURIComponent(
            modelType
          )}/${modelId}`
        : "/audit-logs";

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
      const params = { ...filters };
      if (modelType) params.model_type = modelType;
      if (modelId) params.model_id = modelId;
      if (days) params.days = days;

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

  const renderChanges = (oldValues, newValues, event) => {
    if (event === "created") {
      return (
        <div className="space-y-1">
          {Object.entries(newValues || {}).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-medium text-gray-600">{key}:</span>
              <span className="ml-2 text-green-600">+ {String(value)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (event === "deleted") {
      return (
        <div className="space-y-1">
          {Object.entries(oldValues || {}).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-medium text-gray-600">{key}:</span>
              <span className="ml-2 text-red-600">- {String(value)}</span>
            </div>
          ))}
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

      return (
        <div className="space-y-1">
          {changes.map(({ key, oldVal, newVal }) => (
            <div key={key} className="text-sm">
              <span className="font-medium text-gray-600">{key}:</span>
              <div className="ml-2">
                <span className="text-red-600">- {String(oldVal)}</span>
                <br />
                <span className="text-green-600">+ {String(newVal)}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">{error}</div>
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
              {exporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Event
              </th>
              {showModelColumn && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Model
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Changes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {auditLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={showModelColumn ? 5 : 4}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No audit logs found
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                    <div className="max-w-xs">
                      {renderChanges(log.old_values, log.new_values, log.event)}
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogTable;
