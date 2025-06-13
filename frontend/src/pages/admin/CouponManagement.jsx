import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoupon } from '../../contexts/CouponContext';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Percent,
  DollarSign,
  Users,
  BarChart3,
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const CouponManagement = () => {
  const navigate = useNavigate();
  const {
    getAllCoupons,
    deleteCoupon,
    getCouponStats,
    loading,
    error
  } = useCoupon();

  // State management
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modal states
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponStats, setCouponStats] = useState(null);

  // Load coupons
  const loadCoupons = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        sort_field: sortField,
        sort_direction: sortDirection
      };
      
      const response = await getAllCoupons(params);
      setCoupons(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [currentPage, perPage, searchTerm, statusFilter, typeFilter, sortField, sortDirection]);



  // Handle delete
  const handleDelete = async (coupon) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã khuyến mại "${coupon.code}"?`)) {
      try {
        await deleteCoupon(coupon.id);
        loadCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };



  // View coupon stats
  const handleViewStats = async (coupon) => {
    try {
      const response = await getCouponStats(coupon.id);
      setCouponStats(response.data);
      setSelectedCoupon(coupon);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };



  // Handle edit
  const handleEdit = (coupon) => {
    navigate(`/admin/coupons/edit/${coupon.id}`);
  };

  // Get status icon and color
  const getStatusDisplay = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);
    
    if (!coupon.is_active) {
      return { icon: XCircle, color: 'text-gray-500', text: 'Vô hiệu hóa' };
    }
    
    if (startDate > now) {
      return { icon: Clock, color: 'text-blue-500', text: 'Sắp diễn ra' };
    }
    
    if (endDate < now) {
      return { icon: XCircle, color: 'text-red-500', text: 'Đã hết hạn' };
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { icon: AlertCircle, color: 'text-orange-500', text: 'Hết lượt' };
    }
    
    return { icon: CheckCircle, color: 'text-green-500', text: 'Đang hoạt động' };
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý mã khuyến mại</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Tạo và quản lý các mã khuyến mại cho khách hàng</p>
        </div>
        <button
          onClick={() => navigate('/admin/coupons/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo mã khuyến mại
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm mã hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
          

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả loại</option>
            <option value="percentage">Phần trăm</option>
            <option value="fixed">Số tiền cố định</option>
          </select>

          {/* Refresh */}
          <button
            onClick={loadCoupons}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mã khuyến mại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tên & Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Giá trị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sử dụng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center text-gray-600 dark:text-gray-300">
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Không có mã khuyến mại nào
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const statusDisplay = getStatusDisplay(coupon);
                  const StatusIcon = statusDisplay.icon;
                  
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-gray-900 dark:text-white">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            title="Sao chép mã"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{coupon.name}</div>
                          {coupon.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {coupon.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {coupon.type === 'percentage' ? (
                            <>
                              <Percent className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">{coupon.value}%</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="font-medium">{coupon.value.toLocaleString()}đ</span>
                            </>
                          )}
                        </div>
                        {coupon.minimum_amount && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Tối thiểu: {coupon.minimum_amount.toLocaleString()}đ
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(coupon.start_date).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="text-xs">
                          đến {new Date(coupon.end_date).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span>{coupon.used_count}</span>
                          {coupon.usage_limit && (
                            <span className="text-gray-400 dark:text-gray-500">/{coupon.usage_limit}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1 ${statusDisplay.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{statusDisplay.text}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewStats(coupon)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Xem thống kê"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị {((currentPage - 1) * perPage) + 1} đến {Math.min(currentPage * perPage, coupons.length)} trong tổng số {coupons.length} mã khuyến mại
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>



      {/* Stats Modal */}
      {showStatsModal && couponStats && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Thống kê mã khuyến mại: {selectedCoupon?.code}
              </h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Tổng lượt sử dụng</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
                  {couponStats.coupon.used_count}
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Tổng tiền giảm</span>
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
                  {couponStats.total_discount?.toLocaleString()}đ
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Khách hàng duy nhất</span>
                </div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">
                  {couponStats.unique_users}
                </div>
              </div>
            </div>

            {/* Usage History */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Lịch sử sử dụng</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Khách hàng</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Đơn hàng</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Giảm giá</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {couponStats.usages.data?.map((usage) => (
                      <tr key={usage.id}>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {usage.user?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          #{usage.order?.id || 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">
                          {usage.discount_amount?.toLocaleString()}đ
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(usage.created_at).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default CouponManagement;