import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAnalytics } from "../../contexts/AnalyticsContext";
import { PageHeader, StatCard, Loading } from "../../components/admin";
import { DoughnutChart, LineChart, BarChart } from "../../components/charts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  Package,
  AlertTriangle,
  Eye,
  MousePointer,
  Timer,
  Star,
  Award,
  Target,
  Activity,
  BarChart3,
  PieChart,
  TrendingDown,
  Globe,
} from "lucide-react";

const AnalyticsDashboard = () => {
  const { user, isAdmin, isMod } = useAuth();
  const {
    analytics,
    loading,
    error,
    dashboardStats,
    refreshAnalytics,
    getDashboardStats,
    exportAnalytics,
    formatStatsForDisplay,
    calculatePercentageChange,
    getTrendDirection,
    clearError,
  } = useAnalytics();

  const [selectedChart, setSelectedChart] = useState("revenue");
  const [localLoading, setLocalLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [orderStats, setOrderStats] = useState(null);
  const [lowPerformingBooks, setLowPerformingBooks] = useState([]);

  useEffect(() => {
    if (!user || (!isAdmin() && !isMod())) {
      return;
    }

    loadAnalyticsData();
  }, [user]);



  const loadAnalyticsData = async () => {
    try {
      setLocalLoading(true);
      clearError();
      const data = await getDashboardStats("30d", dateRange.startDate, dateRange.endDate);
      console.log("Analytics data:", data);
      
      // Load additional statistics
      await Promise.all([
        loadOrderStatistics(),
        loadLowPerformingBooks()
      ]);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const loadOrderStatistics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/order-stats?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrderStats(data);
      }
    } catch (error) {
      console.error('Failed to load order statistics:', error);
    }
  };

  const loadLowPerformingBooks = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/low-performing-books?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLowPerformingBooks(data);
      }
    } catch (error) {
      console.error('Failed to load low performing books:', error);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyDateFilter = () => {
    loadAnalyticsData();
    loadOrderStatistics();
    loadLowPerformingBooks();
  };

  const handleRefreshAnalytics = async () => {
    await loadAnalyticsData();
  };

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
  };

  const handleExportData = async () => {
    if (!user || (!isAdmin() && !isMod())) {
      alert("Bạn không có quyền xuất dữ liệu.");
      return;
    }

    try {
      setLocalLoading(true);
      const exportData = await exportAnalytics({
        period: selectedPeriod,
        format: "json",
      });

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${selectedPeriod}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Authentication check
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vui lòng đăng nhập để truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin() && !isMod()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Bạn không có quyền truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  const displayData = analytics || dashboardStats;
  const isLoading = loading || localLoading;

  if (isLoading && !displayData) {
    // Improved loading state check
    return (
      <div className="space-y-6">
        <PageHeader title="Bảng Điều Khiển Phân Tích" hideAddButton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { sales, users, inventory, performance } = displayData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title="Bảng Điều Khiển Phân Tích" hideAddButton />

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Bộ lọc theo khoảng thời gian</h4>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Từ ngày:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Đến ngày:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <button
            onClick={applyDateFilter}
            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm">
            Áp dụng
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-300 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Lỗi tải dữ liệu
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAnalytics}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>
            <button
              onClick={handleExportData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="h-4 w-4" />
              Xuất dữ liệu
            </button>
          </div>
        </div>


       </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Doanh Thu"
          value={
            sales?.totalRevenue
              ? `${Number(sales.totalRevenue).toLocaleString("vi-VN")} VNĐ`
              : "N/A"
          }
          icon={<DollarSign className="h-6 w-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Đơn Hàng"
          value={
            sales?.totalOrders
              ? sales.totalOrders.toLocaleString("vi-VN")
              : "N/A"
          }
          icon={<ShoppingCart className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Khách Hàng"
          value={
            users?.totalUsers ? users.totalUsers.toLocaleString("vi-VN") : "N/A"
          }
          icon={<Users className="h-6 w-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Sản Phẩm"
          value={
            inventory?.totalProducts
              ? inventory.totalProducts.toLocaleString("vi-VN")
              : "N/A"
          }
          icon={<Package className="h-6 w-6" />}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">



      </div>

      {/* Order Statistics by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Thống Kê Đơn Hàng Theo Trạng Thái
            </h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))
            ) : orderStats ? (
              Object.entries(orderStats).map(([status, count], index) => {
                const statusLabels = {
                  pending: 'Chờ xử lý',
                  processing: 'Đang xử lý',
                  shipped: 'Đã gửi',
                  delivered: 'Đã giao',
                  cancelled: 'Đã hủy'
                };
                const statusColors = {
                  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                };
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {statusLabels[status] || status}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {Number(count).toLocaleString('vi-VN')} đơn
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Không có dữ liệu đơn hàng
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Low Performing Books */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Sách Có Doanh Thu Thấp
            </h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))
            ) : lowPerformingBooks.length > 0 ? (
              lowPerformingBooks.map((book, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800 dark:text-white truncate block">
                        {book.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Số lượng bán: {book.sold_quantity || 0}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {Number(book.revenue || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Không có sách có doanh thu thấp
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Sản Phẩm Bán Chạy
            </h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))
            ) : sales?.topProducts?.length > 0 ? (
              sales.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {product.title}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {Number(product.revenue).toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Không có dữ liệu sản phẩm
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Category Performance - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Hiệu Suất Danh Mục
            </h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 animate-pulse"></div>
                </div>
              ))
            ) : sales?.categoryPerformance?.length > 0 ? (
              (() => {
                // Tính tổng doanh thu MỘT LẦN bên ngoài vòng lặp
                const totalRevenue = sales.categoryPerformance.reduce(
                  (sum, cat) => sum + Number(cat.revenue || 0), // Đảm bảo cộng số học
                  0
                );

                return sales.categoryPerformance.map((category, index) => {
                  const colors = [
                    "bg-amber-500",
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-red-500",
                  ];

                  const currentRevenue = Number(category.revenue || 0);

                  // Tính toán phần trăm, tránh chia cho 0
                  const percentage =
                    totalRevenue > 0
                      ? Math.round((currentRevenue / totalRevenue) * 100)
                      : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {category.category ||
                            category.name ||
                            "Không xác định"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {currentRevenue.toLocaleString("vi-VN")} VNĐ
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`${
                            colors[index % colors.length]
                          } h-2 rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                });
              })()
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Không có dữ liệu danh mục
                </p>
              </div>
            )}
          </div>
        </div>


      </div>



      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Biểu Đồ Doanh Thu Hàng Tháng
            </h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>

          <div className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Đang tải biểu đồ...
                  </p>
                </div>
              </div>
            ) : (
              (() => {
                if (!sales?.monthlySales?.length) {
                  return (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Không có dữ liệu doanh thu
                        </p>
                      </div>
                    </div>
                  );
                }

                const chartData = {
                  labels: sales.monthlySales.map((month) =>
                    new Date(month.month + "-01").toLocaleDateString("vi-VN", {
                      month: "long",
                      year: "numeric",
                    })
                  ),
                  datasets: [
                    {
                      label: "Doanh thu hàng tháng (VNĐ)",
                      data: sales.monthlySales.map((month) => month.revenue),
                      backgroundColor: "#22c55e",
                      borderColor: "#16a34a",
                      borderWidth: 1,
                    },
                  ],
                };

                return (
                  <BarChart
                    data={chartData}
                    title="Doanh thu hàng tháng"
                    height={250}
                    showLegend={false}
                    colors={["#22c55e"]}
                  />
                );
              })()
            )}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Hiệu Suất Website
            </h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Lượt xem
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                  ) : (
                    performance?.pageViews?.toLocaleString("vi-VN") || "N/A"
                  )}
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Khách duy nhất
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                  ) : (
                    performance?.uniqueVisitors?.toLocaleString("vi-VN") ||
                    "N/A"
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Tỷ lệ thoát
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {isLoading ? (
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : performance?.bounceRate ? (
                    `${performance.bounceRate}%`
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Thời gian phiên trung bình
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {isLoading ? (
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : performance?.averageSessionDuration ? (
                    `${Math.floor(performance.averageSessionDuration / 60)}p ${
                      performance.averageSessionDuration % 60
                    }s`
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>
            </div>

            {/* Top Pages */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                Trang phổ biến nhất
              </h4>
              <div className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))
                ) : performance?.topPages?.length > 0 ? (
                  performance.topPages.slice(0, 3).map((page, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400 truncate">
                        {page.page}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {page.views?.toLocaleString("vi-VN")}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Globe className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Không có dữ liệu trang
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
