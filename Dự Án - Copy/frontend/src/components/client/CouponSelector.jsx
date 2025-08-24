import React, { useState, useEffect } from "react";
import { useCoupon } from "../../contexts/CouponContext";
import { useToast } from "../../contexts/ToastContext";
import { Tag, Clock, Percent, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

const CouponSelector = ({ orderAmount, onCouponSelected, selectedCoupon }) => {
  const { getActiveCoupons, validateCoupon, loading } = useCoupon();
  const { showError } = useToast();
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [validatingCoupon, setValidatingCoupon] = useState(null);

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      const response = await getActiveCoupons();
      setActiveCoupons(response.data || []);
    } catch (error) {
      console.error("Error fetching active coupons:", error);
      showError("Lỗi", "Không thể tải danh sách mã khuyến mại");
    }
  };

  const handleCouponSelect = async (coupon) => {
    if (selectedCoupon?.id === coupon.id) {
      // Deselect if already selected
      onCouponSelected(null, 0);
      return;
    }

    // Check if coupon is eligible before trying to validate
    if (!isEligible(coupon)) {
      const minAmount = coupon.minimum_amount?.toLocaleString("vi-VN") || "9.999";
      showError(
        "Mã khuyến mại không đủ điều kiện", 
        `Mã khuyến mại này yêu cầu đơn hàng tối thiểu ${minAmount} VND. Đơn hàng hiện tại: ${orderAmount.toLocaleString("vi-VN")} VND`
      );
      return;
    }

    setValidatingCoupon(coupon.id);
    try {
      const response = await validateCoupon(coupon.code, orderAmount);
      onCouponSelected(response.data.coupon, response.data.discount_amount);
    } catch (error) {
      let errorMessage = error.message || "Mã khuyến mại không hợp lệ";
      
      // Handle specific error cases
      if (errorMessage.includes("giá trị tối thiểu") || errorMessage.includes("minimum") || errorMessage.includes("9.999")) {
        const match = errorMessage.match(/([0-9,\.]+)\s*VND/);
        const minAmount = match ? match[1] : coupon.minimum_amount?.toLocaleString("vi-VN") || "9.999";
        errorMessage = `Mã khuyến mại này yêu cầu đơn hàng tối thiểu ${minAmount} VND. Đơn hàng hiện tại: ${orderAmount.toLocaleString("vi-VN")} VND`;
      }
      
      showError("Mã khuyến mại không hợp lệ", errorMessage);
    } finally {
      setValidatingCoupon(null);
    }
  };

  const formatValue = (coupon) => {
    if (coupon.type === "percentage") {
      return `${coupon.value}%`;
    } else {
      return `${coupon.value.toLocaleString("vi-VN")} ₫`;
    }
  };

  const isEligible = (coupon) => {
    return !coupon.minimum_amount || orderAmount >= coupon.minimum_amount;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3">
          <Tag className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Đang tải mã khuyến mại...
          </h3>
        </div>
      </div>
    );
  }

  if (activeCoupons.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3">
          <Tag className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Không có mã khuyến mại nào
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Hiện tại không có mã khuyến mại nào khả dụng.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Tag className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mã khuyến mại có sẵn ({activeCoupons.length})
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
          {activeCoupons.map((coupon) => {
            const eligible = isEligible(coupon);
            const isSelected = selectedCoupon?.id === coupon.id;
            const isValidating = validatingCoupon === coupon.id;
            
            return (
              <div
                key={coupon.id}
                className={`border rounded-lg p-4 transition-all ${
                  isSelected
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 cursor-pointer"
                    : eligible
                    ? "border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-60 cursor-not-allowed pointer-events-none"
                }`}
                {...(eligible ? {
                  onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isValidating) {
                      handleCouponSelect(coupon);
                    }
                  }
                } : {})}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-mono text-sm font-bold px-2 py-1 rounded ${
                        eligible 
                          ? "text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30"
                          : "text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600"
                      }`}>
                        {coupon.code}
                      </span>
                      <div className={`flex items-center gap-1 ${
                        eligible 
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {coupon.type === "percentage" ? (
                          <Percent className="h-4 w-4" />
                        ) : (
                          <DollarSign className="h-4 w-4" />
                        )}
                        <span className="font-semibold">{formatValue(coupon)}</span>
                      </div>
                    </div>
                    
                    <h4 className={`font-medium mb-1 ${
                      eligible 
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {coupon.name}
                    </h4>
                    
                    {coupon.description && (
                      <p className={`text-sm mb-2 ${
                        eligible 
                          ? "text-gray-600 dark:text-gray-400"
                          : "text-gray-500 dark:text-gray-500"
                      }`}>
                        {coupon.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {coupon.minimum_amount && (
                        <span>
                          Đơn tối thiểu: {coupon.minimum_amount.toLocaleString("vi-VN")} ₫
                        </span>
                      )}
                      {coupon.maximum_discount && (
                        <span>
                          Giảm tối đa: {coupon.maximum_discount.toLocaleString("vi-VN")} ₫
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          HSD: {new Date(coupon.end_date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    
                    {!eligible && (
                      <p className="text-xs text-red-500 mt-2">
                        Đơn hàng chưa đủ điều kiện (tối thiểu {coupon.minimum_amount?.toLocaleString("vi-VN")} ₫)
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {isValidating ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
                    ) : isSelected ? (
                      <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {selectedCoupon && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Đã áp dụng mã <span className="font-mono font-bold">{selectedCoupon.code}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CouponSelector;