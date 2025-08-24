import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRefund } from '../../contexts/RefundContext';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  ArrowLeft,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const RefundStats = () => {
  const navigate = useNavigate();
  const { refundStats, loading, fetchRefundStats } = useRefund();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchRefundStats({
      date_from: dateRange.from,
      date_to: dateRange.to
    });
  }, [fetchRefundStats, dateRange]);

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'processing':
        return <Clock className="h-6 w-6 text-blue-500" />;
      default:
        return <FileText className="h-6 w-6 text-yellow-500" />;
    }
  };

  const StatCard = ({ title, value, icon, color = 'blue', trend = null, subtitle = null }) => {
    return (
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`p-3 rounded-md bg-${color}-100`}>
                {icon}
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{value}</div>
                  {trend && (
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      trend.type === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend.type === 'increase' ? (
                        <TrendingUp className="h-4 w-4 flex-shrink-0 self-center" />
                      ) : (
                        <TrendingDown className="h-4 w-4 flex-shrink-0 self-center" />
                      )}
                      <span className="ml-1">{trend.value}%</span>
                    </div>
                  )}
                </dd>
                {subtitle && (
                  <dd className="text-sm text-gray-500 mt-1">{subtitle}</dd>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/refunds')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thống kê hoàn tiền</h1>
            <p className="text-gray-600">Tổng quan về các yêu cầu hoàn tiền</p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Khoảng thời gian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {refundStats && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Tổng số yêu cầu"
              value={refundStats.total_refunds || 0}
              icon={<FileText className="h-6 w-6 text-blue-500" />}
              color="blue"
            />
            <StatCard
              title="Tổng tiền hoàn"
              value={formatCurrency(refundStats.total_refund_amount || 0)}
              icon={<DollarSign className="h-6 w-6 text-green-500" />}
              color="green"
            />
            <StatCard
              title="Hoàn thành"
              value={refundStats.completed_refunds || 0}
              icon={<CheckCircle className="h-6 w-6 text-green-500" />}
              color="green"
              subtitle={`${((refundStats.completed_refunds || 0) / (refundStats.total_refunds || 1) * 100).toFixed(1)}% tổng số`}
            />
            <StatCard
              title="Thất bại"
              value={refundStats.failed_refunds || 0}
              icon={<XCircle className="h-6 w-6 text-red-500" />}
              color="red"
              subtitle={`${((refundStats.failed_refunds || 0) / (refundStats.total_refunds || 1) * 100).toFixed(1)}% tổng số`}
            />
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Phân bố theo trạng thái</h2>
              <div className="space-y-4">
                {refundStats.status_breakdown && Object.entries(refundStats.status_breakdown).map(([status, data]) => (
                  <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getStatusIcon(status)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {status === 'pending' && 'Chờ xử lý'}
                          {status === 'processing' && 'Đang xử lý'}
                          {status === 'completed' && 'Hoàn thành'}
                          {status === 'failed' && 'Thất bại'}
                          {status === 'cancelled' && 'Đã hủy'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {data.count} yêu cầu
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(data.total_amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {((data.count / (refundStats.total_refunds || 1)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Phân bố theo loại</h2>
              <div className="space-y-4">
                {refundStats.type_breakdown && Object.entries(refundStats.type_breakdown).map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 rounded-md bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {type === 'full' ? 'Hoàn tiền toàn phần' : 'Hoàn tiền một phần'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {data.count} yêu cầu
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(data.total_amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {((data.count / (refundStats.total_refunds || 1)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Method Breakdown */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Phân bố theo phương thức</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {refundStats.method_breakdown && Object.entries(refundStats.method_breakdown).map(([method, data]) => (
                <div key={method} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {method === 'vnpay' && 'VNPay'}
                      {method === 'bank_transfer' && 'Chuyển khoản'}
                      {method === 'cash' && 'Tiền mặt'}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {data.count} yêu cầu
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(data.total_amount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {((data.count / (refundStats.total_refunds || 1)) * 100).toFixed(1)}% tổng số
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Refunds */}
          {refundStats.recent_refunds && refundStats.recent_refunds.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Hoàn tiền gần đây</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã hoàn tiền
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn hàng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {refundStats.recent_refunds.map((refund) => (
                      <tr key={refund.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{refund.refund_number || refund.id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{refund.order?.order_number || refund.order_id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(refund.refund_amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            refund.status === 'completed' ? 'bg-green-100 text-green-800' :
                            refund.status === 'failed' ? 'bg-red-100 text-red-800' :
                            refund.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {refund.status === 'pending' && 'Chờ xử lý'}
                            {refund.status === 'processing' && 'Đang xử lý'}
                            {refund.status === 'completed' && 'Hoàn thành'}
                            {refund.status === 'failed' && 'Thất bại'}
                            {refund.status === 'cancelled' && 'Đã hủy'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(refund.created_at).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RefundStats;