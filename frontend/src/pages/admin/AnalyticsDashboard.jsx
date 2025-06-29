import React, { useState, useEffect } from 'react';
import { PageHeader, StatCard } from '../../components/admin';
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
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChart, setSelectedChart] = useState('revenue');

  // Mock analytics data
  const [analytics] = useState({
    sales: {
      totalRevenue: 125000,
      totalOrders: 1250,
      conversionRate: 3.2,
      dailySales: [
        { date: '2024-01-01', revenue: 4200, orders: 42 },
        { date: '2024-01-02', revenue: 3800, orders: 38 },
        { date: '2024-01-03', revenue: 5100, orders: 51 },
        { date: '2024-01-04', revenue: 4600, orders: 46 },
        { date: '2024-01-05', revenue: 5300, orders: 53 },
        { date: '2024-01-06', revenue: 4900, orders: 49 },
        { date: '2024-01-07', revenue: 5500, orders: 55 },
      ],
      monthlySales: [
        { month: '2023-07', revenue: 95000 },
        { month: '2023-08', revenue: 102000 },
        { month: '2023-09', revenue: 98000 },
        { month: '2023-10', revenue: 115000 },
        { month: '2023-11', revenue: 125000 },
        { month: '2023-12', revenue: 135000 },
      ],
      topProducts: [
        { title: 'The Great Gatsby', revenue: 15000 },
        { title: 'To Kill a Mockingbird', revenue: 12000 },
        { title: '1984', revenue: 10000 },
        { title: 'Pride and Prejudice', revenue: 8500 },
        { title: 'The Catcher in the Rye', revenue: 7200 },
      ],
      categoryPerformance: [
        { category: 'Fiction', revenue: 45000 },
        { category: 'Non-Fiction', revenue: 35000 },
        { category: 'Science', revenue: 25000 },
        { category: 'History', revenue: 20000 },
      ],
    },
    users: {
      totalUsers: 8500,
      userSegments: [
        { segment: 'New Users', count: 2500 },
        { segment: 'Returning Users', count: 4200 },
        { segment: 'VIP Users', count: 1200 },
        { segment: 'Inactive Users', count: 600 },
      ],
      userRegistrations: [
        { date: '2024-01-01', registrations: 25 },
        { date: '2024-01-02', registrations: 32 },
        { date: '2024-01-03', registrations: 28 },
        { date: '2024-01-04', registrations: 35 },
        { date: '2024-01-05', registrations: 42 },
        { date: '2024-01-06', registrations: 38 },
        { date: '2024-01-07', registrations: 45 },
      ],
    },
    inventory: {
      totalProducts: 1250,
      lowStockItems: 45,
      outOfStockItems: 12,
    },
    performance: {
      pageViews: 125000,
      uniqueVisitors: 45000,
      bounceRate: 35,
      averageSessionDuration: 180,
      deviceBreakdown: [
        { device: 'Desktop', sessions: 25000 },
        { device: 'Mobile', sessions: 15000 },
        { device: 'Tablet', sessions: 5000 },
      ],
      topPages: [
        { page: '/books', views: 15000 },
        { page: '/categories', views: 12000 },
        { page: '/authors', views: 8500 },
      ],
    },
  });

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const refreshAnalytics = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
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

  if (loading) {
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

  const { sales, users, inventory, performance } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Bảng Điều Khiển Phân Tích" hideAddButton />
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={refreshAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Doanh Thu"
          value={`$${sales.totalRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          trend="positive"
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={sales.totalOrders?.toLocaleString() || 0}
          icon={ShoppingCart}
          trend="positive"
        />
        <StatCard
          title="Tổng Người Dùng"
          value={users.totalUsers?.toLocaleString() || 0}
          icon={Users}
          trend="positive"
        />
        <StatCard
          title="Tỷ Lệ Chuyển Đổi"
          value={`${sales.conversionRate || 0}%`}
          icon={TrendingUp}
          trend="positive"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Revenue Trend (Last 7 Days)
            </h3>
            <button
              onClick={() => handleExport('sales')}
              className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2">
            {sales.dailySales?.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-green-500 w-full rounded-t transition-all hover:bg-green-600"
                  style={{ height: `${(day.revenue / 6000) * 100}%` }}
                  title={`$${day.revenue}`}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Orders Trend (Last 7 Days)
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <ShoppingCart className="h-4 w-4" />
              {sales.totalOrders} total
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2">
            {sales.dailySales?.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 w-full rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${(day.orders / 60) * 100}%` }}
                  title={`${day.orders} orders`}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
            Top Products by Revenue
          </h3>
          
          <div className="space-y-4">
            {sales.topProducts?.map((product, index) => (
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
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
            Revenue by Category
          </h3>
          
          <div className="space-y-4">
            {sales.categoryPerformance?.map((category, index) => {
              const colors = ['bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500'];
              const percentage = (category.revenue / sales.categoryPerformance.reduce((sum, cat) => sum + cat.revenue, 0)) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ${category.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`${colors[index % colors.length]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Segments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
            User Segments
          </h3>
          
          <div className="space-y-4">
            {users.userSegments?.map((segment, index) => {
              const colors = ['bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-red-500'];
              const percentage = (segment.count / users.totalUsers) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {segment.segment}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {segment.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`${colors[index % colors.length]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
            Monthly Revenue Trend
          </h3>
          
          <div className="h-64 flex items-end justify-between gap-2">
            {sales.monthlySales?.map((month, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-green-500 w-full rounded-t transition-all hover:bg-green-600"
                  style={{ height: `${(month.revenue / 150000) * 100}%` }}
                  title={`$${month.revenue.toLocaleString()}`}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
            Site Performance
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Page Views
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {performance.pageViews?.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Unique Visitors
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {performance.uniqueVisitors?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Bounce Rate</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {performance.bounceRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Avg. Session Duration</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {Math.floor(performance.averageSessionDuration / 60)}m {performance.averageSessionDuration % 60}s
                </span>
              </div>
            </div>

            {/* Top Pages */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">Top Pages</h4>
              <div className="space-y-2">
                {performance.topPages?.slice(0, 3).map((page, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate">
                      {page.page}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;