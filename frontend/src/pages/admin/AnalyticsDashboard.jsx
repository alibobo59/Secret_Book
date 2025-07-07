import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { PageHeader, StatCard, Loading } from '../../components/admin';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  MousePointer,
  Package,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
} from 'lucide-react';

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
    clearError
  } = useAnalytics();
  
  const [selectedPeriod, setSelectedPeriod] = useState('30_days');
  const [selectedChart, setSelectedChart] = useState('revenue');
  const [localLoading, setLocalLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Removed mock data - using only backend data

  useEffect(() => {
    if (!user || (!isAdmin() && !isMod())) {
      return;
    }
    
    loadAnalyticsData();
  }, [user, selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLocalLoading(true);
      clearError();
      await getDashboardStats(selectedPeriod);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRefreshAnalytics = async () => {
    await loadAnalyticsData();
  };

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
  };

  const handleExportData = async () => {
    if (!user || (!isAdmin() && !isMod())) {
      alert('Bạn không có quyền xuất dữ liệu.');
      return;
    }

    try {
      setLocalLoading(true);
      const exportData = await exportAnalytics({
        period: selectedPeriod,
        format: 'json'
      });
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Xuất dữ liệu thất bại. Vui lòng thử lại.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleExport = (type) => {
    // Mock export functionality
    const data = `Type,Value\n${type},${Math.random() * 1000}`;
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Authentication check
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Yêu cầu đăng nhập</h2>
          <p className="text-gray-600">Vui lòng đăng nhập để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin() && !isMod()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  // Use real data from backend only
  const displayData = analytics || dashboardStats;
  const isLoading = loading || localLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bảng Điều Khiển Phân Tích" hideAddButton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { sales, users, inventory, performance } = displayData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title="Bảng Điều Khiển Phân Tích" hideAddButton />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="7_days">7 ngày qua</option>
              <option value="30_days">30 ngày qua</option>
              <option value="90_days">90 ngày qua</option>
              <option value="1_year">1 năm qua</option>
            </select>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAnalytics}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={handleExportData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Xuất dữ liệu
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Doanh Thu"
          value={sales?.totalRevenue ? `${sales.totalRevenue.toLocaleString('vi-VN')} VNĐ` : 'N/A'}
          icon={<DollarSign className="h-6 w-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Đơn Hàng"
          value={sales?.totalOrders ? sales.totalOrders.toLocaleString('vi-VN') : 'N/A'}
          icon={<ShoppingCart className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Khách Hàng"
          value={users?.totalUsers ? users.totalUsers.toLocaleString('vi-VN') : 'N/A'}
          icon={<Users className="h-6 w-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Sản Phẩm"
          value={inventory?.totalProducts ? inventory.totalProducts.toLocaleString('vi-VN') : 'N/A'}
          icon={<Package className="h-6 w-6" />}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Doanh Thu Theo Thời Gian
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedChart('revenue')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  selectedChart === 'revenue'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                }`}
                disabled={isLoading}
              >
                Doanh thu
              </button>
              <button
                onClick={() => setSelectedChart('orders')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  selectedChart === 'orders'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                }`}
                disabled={isLoading}
              >
                Đơn hàng
              </button>
            </div>
          </div>
          
          <div className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 dark:text-gray-400">Đang tải biểu đồ...</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-end justify-between gap-2">
                {sales?.dailySales?.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-green-500 w-full rounded-t transition-all hover:bg-green-600"
                      style={{ height: `${(day.revenue / 6000) * 100}%` }}
                      title={`${day.revenue.toLocaleString('vi-VN')} VNĐ`}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {new Date(day.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )) || (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Phân Tích Người Dùng
            </h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tổng người dùng</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {isLoading ? (
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  users?.totalUsers ? users.totalUsers.toLocaleString('vi-VN') : 'N/A'
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Người dùng mới</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {isLoading ? (
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  users?.userRegistrations ? users.userRegistrations.reduce((sum, day) => sum + day.registrations, 0).toLocaleString('vi-VN') : 'N/A'
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Phân khúc người dùng</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {isLoading ? (
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  users?.userSegments ? `${users.userSegments.length} nhóm` : 'N/A'
                )}
              </span>
            </div>
          </div>
          
          <div className="h-32">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-1"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải...</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-center">
                  <PieChart className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Biểu đồ người dùng</p>
                  <p className="text-xs text-gray-400 mt-1">Dữ liệu cho {selectedPeriod.replace('_', ' ')}</p>
                </div>
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
            ) : (
              sales?.topProducts?.map((product, index) => (
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
                    {product.revenue.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu sản phẩm</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Category Performance */}
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
            ) : (
              sales?.categoryPerformance?.map((category, index) => {
                const colors = ['bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500'];
                const percentage = (category.revenue / sales.categoryPerformance.reduce((sum, cat) => sum + cat.revenue, 0)) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {category.revenue.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }) || (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu danh mục</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* User Segments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Phân Khúc Người Dùng
            </h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              users?.userSegments?.map((segment, index) => {
                const colors = ['bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-red-500'];
                const percentage = (segment.count / users.totalUsers) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {segment.segment}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {segment.count.toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }) || (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu phân khúc</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Doanh Thu Hàng Tháng
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
                  <p className="text-gray-500 dark:text-gray-400">Đang tải biểu đồ...</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-end justify-between gap-2">
                {sales?.monthlySales?.map((month, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-green-500 w-full rounded-t transition-all hover:bg-green-600"
                      style={{ height: `${Math.min((month.revenue / 150000) * 100, 100)}%` }}
                      title={`${month.revenue?.toLocaleString('vi-VN')} VNĐ`}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {new Date(month.month + '-01').toLocaleDateString('vi-VN', { month: 'short' })}
                    </span>
                  </div>
                )) || (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu doanh thu</p>
                    </div>
                  </div>
                )}
              </div>
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
                    performance?.pageViews?.toLocaleString('vi-VN') || 'N/A'
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
                    performance?.uniqueVisitors?.toLocaleString('vi-VN') || 'N/A'
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tỷ lệ thoát</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {isLoading ? (
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    performance?.bounceRate ? `${performance.bounceRate}%` : 'N/A'
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Thời gian phiên trung bình</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {isLoading ? (
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    performance?.averageSessionDuration ? 
                      `${Math.floor(performance.averageSessionDuration / 60)}p ${performance.averageSessionDuration % 60}s` : 'N/A'
                  )}
                </span>
              </div>
            </div>

            {/* Top Pages */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">Trang phổ biến nhất</h4>
              <div className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))
                ) : (
                  performance?.topPages?.slice(0, 3).map((page, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400 truncate">
                        {page.page}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {page.views?.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )) || (
                    <div className="text-center py-4">
                      <Globe className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Không có dữ liệu trang</p>
                    </div>
                  )
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