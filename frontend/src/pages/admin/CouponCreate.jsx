import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoupon } from '../../contexts/CouponContext';
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Percent,
  DollarSign
} from 'lucide-react';

const CouponCreate = () => {
  const navigate = useNavigate();
  const { createCoupon, generateCouponCode, loading } = useCoupon();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minimum_amount: '',
    maximum_discount: '',
    usage_limit: '',
    usage_limit_per_user: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    try {
      await createCoupon(formData);
      navigate('/admin/coupons');
    } catch (error) {
      console.error('Error creating coupon:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  // Generate random code
  const handleGenerateCode = async () => {
    try {
      const response = await generateCouponCode();
      const code = response.data?.code || response.code;
      setFormData(prev => ({ ...prev, code }));
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/coupons')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tạo mã khuyến mại mới</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Tạo mã khuyến mại cho khách hàng</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mã khuyến mại *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={(e) => handleChange({
                  target: {
                    name: 'code',
                    value: e.target.value.toUpperCase()
                  }
                })}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  errors.code ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="VD: SUMMER2024"
                required
              />
              <button
                type="button"
                onClick={handleGenerateCode}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                title="Tạo mã ngẫu nhiên"
              >
                <RefreshCw className="w-4 h-4" />
                Tạo mã
              </button>
            </div>
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code[0]}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên khuyến mại *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="VD: Khuyến mại mùa hè"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              rows="3"
              placeholder="Mô tả chi tiết về khuyến mại..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
            )}
          </div>

          {/* Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại giảm giá *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.type ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá trị *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.value ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={formData.type === 'percentage' ? 'VD: 10' : 'VD: 50000'}
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {formData.type === 'percentage' ? (
                    <Percent className="w-4 h-4 text-gray-400" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value[0]}</p>
              )}
            </div>
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn hàng tối thiểu (đ)
              </label>
              <input
                type="number"
                name="minimum_amount"
                value={formData.minimum_amount}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.minimum_amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="VD: 100000"
                min="0"
              />
              {errors.minimum_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.minimum_amount[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giảm tối đa (đ)
              </label>
              <input
                type="number"
                name="maximum_discount"
                value={formData.maximum_discount}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.maximum_discount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="VD: 200000"
                min="0"
              />
              {errors.maximum_discount && (
                <p className="mt-1 text-sm text-red-600">{errors.maximum_discount[0]}</p>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới hạn sử dụng tổng
              </label>
              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.usage_limit ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="VD: 100"
                min="1"
              />
              {errors.usage_limit && (
                <p className="mt-1 text-sm text-red-600">{errors.usage_limit[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới hạn mỗi người
              </label>
              <input
                type="number"
                name="usage_limit_per_user"
                value={formData.usage_limit_per_user}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.usage_limit_per_user ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="VD: 1"
                min="1"
              />
              {errors.usage_limit_per_user && (
                <p className="mt-1 text-sm text-red-600">{errors.usage_limit_per_user[0]}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.start_date ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.end_date ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date[0]}</p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Kích hoạt mã khuyến mại
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/coupons')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Đang tạo...' : 'Tạo mã khuyến mại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponCreate;