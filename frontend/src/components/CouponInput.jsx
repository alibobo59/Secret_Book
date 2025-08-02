import React, { useState } from 'react';
import { useCoupon } from '../contexts/CouponContext';
import { Tag, Check, X, Loader2, AlertCircle } from 'lucide-react';

const CouponInput = ({ orderAmount, onCouponApplied, onCouponRemoved, appliedCoupon }) => {
  const { validateCoupon, loading } = useCoupon();
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Vui lòng nhập mã khuyến mại');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await validateCoupon(couponCode.trim().toUpperCase(), orderAmount);
      
      if (response.success) {
        onCouponApplied({
          code: couponCode.trim().toUpperCase(),
          coupon: response.data.coupon,
          discountAmount: response.data.discount_amount,
          finalAmount: response.data.final_amount
        });
        setCouponCode('');
        setError('');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCouponCode('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-5 h-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">Mã khuyến mại</h3>
      </div>

      {appliedCoupon ? (
        // Applied coupon display
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">
                  {appliedCoupon.code}
                </div>
                <div className="text-sm text-green-700">
                  {appliedCoupon.coupon.name}
                </div>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-green-600 hover:text-green-800 p-1"
              title="Bỏ mã khuyến mại"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Giảm giá:</span>
              <span className="font-medium text-green-600">
                -{appliedCoupon.discountAmount.toLocaleString()}đ
              </span>
            </div>
            {appliedCoupon.coupon.type === 'percentage' && (
              <div className="text-xs text-gray-500 mt-1">
                Giảm {appliedCoupon.coupon.value}%
                {appliedCoupon.coupon.maximum_discount && (
                  <span> (tối đa {appliedCoupon.coupon.maximum_discount.toLocaleString()}đ)</span>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Coupon input form
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="Nhập mã khuyến mại"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isValidating}
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              disabled={isValidating || !couponCode.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kiểm tra...
                </>
              ) : (
                'Áp dụng'
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Nhập mã khuyến mại để được giảm giá cho đơn hàng của bạn
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput;