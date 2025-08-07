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

    setValidatingCoupon(coupon.id);
    try {
      const response = await validateCoupon(coupon.code, orderAmount);
      onCouponSelected(response.data.coupon, response.data.discount_amount);
    } catch (error) {
      showError("Mã khuyến mại không hợp lệ", error.message);
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
    return !coupon.min_order_amount || orderAmount >= coupon.min_order_amount;
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
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                    : eligible
                    ? "border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    : "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                }`}
                onClick={() => eligible && !isValidating && handleCouponSelect(coupon)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                        {coupon.code}
                      </span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        {coupon.type === "percentage" ? (
                          <Percent className="h-4 w-4" />
                        ) : (
                          <DollarSign className="h-4 w-4" />
                        )}
                        <span className="font-semibold">{formatValue(coupon)}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {coupon.name}
                    </h4>
                    
                    {coupon.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {coupon.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {coupon.min_order_amount && (
                        <span>
                          Đơn tối thiểu: {coupon.min_order_amount.toLocaleString("vi-VN")} ₫
                        </span>
                      )}
                      {coupon.max_discount_amount && (
                        <span>
                          Giảm tối đa: {coupon.max_discount_amount.toLocaleString("vi-VN")} ₫
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
                        Đơn hàng chưa đủ điều kiện (tối thiểu {coupon.min_order_amount?.toLocaleString("vi-VN")} ₫)
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