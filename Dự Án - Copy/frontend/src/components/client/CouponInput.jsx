import React, { useState } from "react";
import { useCoupon } from "../../contexts/CouponContext";
import { useToast } from "../../contexts/ToastContext";
import { Percent, X, Check, Loader } from "lucide-react";

const CouponInput = ({ orderAmount, onCouponApplied, onCouponRemoved }) => {
  const { validateCoupon } = useCoupon();
  const { showSuccess, showError } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setValidationError("Vui lòng nhập mã khuyến mại");
      return;
    }

    setIsValidating(true);
    setValidationError("");

    try {
      const response = await validateCoupon(couponCode, orderAmount);
      
      if (response.success && response.data) {
        const discount = response.data.discount_amount;
        const coupon = response.data.coupon;
        setAppliedCoupon(coupon);
        setDiscountAmount(discount);
        onCouponApplied(coupon, discount);
        showSuccess("Thành công", `Áp dụng mã khuyến mại thành công! Giảm ${discount.toLocaleString("vi-VN")} ₫`);
      } else {
        setValidationError(response.message || "Mã khuyến mại không hợp lệ");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      let errorMessage = error.message || error.response?.data?.message || "Có lỗi xảy ra khi kiểm tra mã khuyến mại";
      
      // Handle specific error cases
      if (errorMessage.includes("giá trị tối thiểu") || errorMessage.includes("minimum") || errorMessage.includes("9.999")) {
        // Extract minimum amount from error message if possible
        const match = errorMessage.match(/([0-9,\.]+)\s*VND/);
        const minAmount = match ? match[1] : "9.999";
        errorMessage = `Mã khuyến mại này yêu cầu đơn hàng tối thiểu ${minAmount} VND. Đơn hàng hiện tại: ${orderAmount.toLocaleString("vi-VN")} VND`;
      }
      
      setValidationError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setValidationError("");
    onCouponRemoved();
    showSuccess("Đã xóa", "Đã xóa mã khuyến mại");
  };

  const handleInputChange = (e) => {
    setCouponCode(e.target.value.toUpperCase());
    setValidationError("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <Percent className="h-6 w-6 text-amber-600 dark:text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Mã Khuyến Mại
        </h3>
      </div>

      {!appliedCoupon ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={handleInputChange}
              placeholder="Nhập mã khuyến mại"
              className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                validationError ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isValidating}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isValidating || !couponCode.trim()}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Kiểm tra...
                </>
              ) : (
                "Áp dụng"
              )}
            </button>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <X className="h-4 w-4" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {appliedCoupon.code}
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {appliedCoupon.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-green-800 dark:text-green-200">
                -{discountAmount.toLocaleString("vi-VN")} ₫
              </p>
              <button
                onClick={handleRemoveCoupon}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>

          {appliedCoupon.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {appliedCoupon.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponInput;