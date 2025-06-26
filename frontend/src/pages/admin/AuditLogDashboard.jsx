import React, { useState, useEffect } from "react";
import {
  Activity,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Filter,
  Download,
  Search,
} from "lucide-react";
import AuditLogTable from "../../components/AuditLogTable";
import Loading from "../../components/admin/Loading";
import { api } from "../../services/api";

const AuditLogDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7");
  const [selectedModel, setSelectedModel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);

  const timeRanges = [
    { value: "1", label: "Last 24 hours" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "", label: "All time" },
  ];

  const modelTypes = [
    { value: "", label: "All Models" },
    { value: "App\\Models\\Book", label: "Books" },
    { value: "App\\Models\\Author", label: "Authors" },
    { value: "App\\Models\\Category", label: "Categories" },
    { value: "App\\Models\\Publisher", label: "Publishers" },
    { value: "App\\Models\\User", label: "Users" },
    { value: "App\\Models\\Order", label: "Orders" },
  ];

  useEffect(() => {
    fetchStats();
  }, [selectedTimeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedTimeRange) {
        params.days = selectedTimeRange;
      }

      const response = await api.get("/audit-logs/stats", { params });
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching audit stats:", err);
      setError("Failed to load audit statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {};
      if (selectedTimeRange) params.days = selectedTimeRange;
      if (selectedModel) params.model_type = selectedModel;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get("/audit-logs/export", {
        params,
        responseType: "blob",
      });

      // Create download link
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
        return "text-green-600 bg-green-100";
      case "updated":
        return "text-amber-600 bg-amber-100";
      case "deleted":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <Activity className="w-6 h-6 mr-3 text-amber-600" />
            Audit Log Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and track all system activities and changes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Activities
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-200">
                  {stats.total_activities || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Created Records
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-200">
                  {stats.created_count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Updated Records
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-200">
                  {stats.updated_count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Deleted Records
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-200">
                  {stats.deleted_count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity by Model Type */}
      {stats && stats.by_model && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Activity by Model Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(stats.by_model).map(([model, count]) => {
              const modelName = model.split("\\").pop();
              return (
                <div
                  key={model}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    {modelName}
                  </span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity by Event Type */}
      {stats && stats.by_event && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Recent Activity by Event Type
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.by_event).map(([event, count]) => (
              <div key={event} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getEventTypeColor(event)
                  }`}>
                    {event.charAt(0).toUpperCase() + event.slice(1)}
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range
            </label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-amber-500 focus:border-amber-500">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Model Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model Type
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-amber-500 focus:border-amber-500">
              <option value="">All Models</option>
              <option value="App\\Models\\User">Users</option>
              <option value="App\\Models\\Book">Books</option>
              <option value="App\\Models\\BorrowRecord">Borrow Records</option>
              <option value="App\\Models\\Category">Categories</option>
              <option value="App\\Models\\Author">Authors</option>
              <option value="App\\Models\\Publisher">Publishers</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Audit Log Details
        </h3>
        <AuditLogTable
          modelType={selectedModel}
          searchTerm={searchTerm}
          days={selectedTimeRange}
          showModelColumn={true}
        />
      </div>
    </div>
  );
};

export default AuditLogDashboard;
