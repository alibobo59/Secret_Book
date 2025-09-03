// src/pages/client/CheckOutPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useOrder } from "../../contexts/OrderContext";
import { useCoupon } from "../../contexts/CouponContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../services/api";
import CouponInput from "../../components/client/CouponInput";
import CouponSelector from "../../components/client/CouponSelector";
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

const CheckoutPage = () => {
  const {
    cartItems,
    getCartTotal,
    getSelectedItems,
    getSelectedTotal,
    getSelectedItemsCount,
    applyStockHints,
  } = useCart();
  const { user } = useAuth();
  const { createOrder, loading } = useOrder();
  const { validateCoupon } = useCoupon();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    province_id: "",
    ward_id: "",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // If province changes, reset ward and load new wards
    if (name === "province_id" && value) {
      setFormData((prev) => ({ ...prev, ward_id: "" }));
      loadWards(value);
    }
  };

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await api.get("/provinces");
        setProvinces(response.data.data || []);
      } catch (error) {
        console.error("Error loading provinces:", error);
        showError("Lỗi", "Không thể tải danh sách tỉnh/thành phố");
      }
    };
    loadProvinces();
  }, []);

  // Load wards when province is selected
  const loadWards = async (provinceId) => {
    if (!provinceId) {
      setWards([]);
      return;
    }

    setLoadingWards(true);
    try {
      const response = await api.get(`/provinces/${provinceId}/wards`);
      setWards(response.data.data || []);
    } catch (error) {
      console.error("Error loading wards:", error);
      showError("Lỗi", "Không thể tải danh sách phường/xã");
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  // Check stock validation when selected items change
  useEffect(() => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length > 0) {
      const outOfStockItems = selectedItems.filter(item => {
        const stock = item.stock_quantity || item.stock || 0;
        return stock === 0 || item.quantity > stock;
      });
      
      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map(item => item.title).join(", ");
        setErrors(prev => ({
          ...prev,
          stock: itemNames
        }));
      } else {
        setErrors(prev => {
          const { stock, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [getSelectedItems]);

  const validateForm = () => {
    const newErrors = {};

    // Add validation for name and email
    if (!formData.name.trim()) newErrors.name = "Họ và tên là bắt buộc";
    if (!formData.email.trim()) newErrors.email = "Email là bắt buộc";
    if (!formData.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!formData.province_id)
      newErrors.province_id = "Tỉnh/Thành phố là bắt buộc";
    if (!formData.ward_id) newErrors.ward_id = "Phường/Xã là bắt buộc";
    if (!formData.address.trim()) newErrors.address = "Địa chỉ là bắt buộc";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Vui lòng nhập email hợp lệ";
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Vui lòng nhập số điện thoại hợp lệ";
    }

    // Stock validation
    const selectedItems = getSelectedItems();
    const outOfStockItems = selectedItems.filter(item => {
      const stock = item.stock_quantity || item.stock || 0;
      return stock === 0 || item.quantity > stock;
    });
    
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.title).join(", ");
      newErrors.stock = itemNames;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || getSelectedItemsCount() === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the order data with proper address structure
      const selectedItems = getSelectedItems();
      console.log('Selected items before mapping:', selectedItems);
      
      const orderData = {
        items: selectedItems.map((item) => {
          const mappedItem = {
            book_id: item.book_id || item.id,
            price: item.price,
            quantity: item.quantity,
            variation_id: item.variation_id || null,
          };
          console.log('Mapping item:', item, 'to:', mappedItem);
          return mappedItem;
        }),
        address: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          province_id: formData.province_id,
          ward_id: formData.ward_id,
          address: formData.address,
        },
        shipping: 0, // Add shipping calculation if needed
        notes: formData.notes,
        coupon_code: appliedCoupon?.code || null,
        paymentMethod: paymentMethod,
      };
      
      console.log('Final order data:', orderData);

      // Use createOrder from OrderContext which automatically clears cart
      const order = await createOrder(orderData);

      if (paymentMethod === "vnpay") {
        // Create VNPay payment
        const paymentResponse = await api.post("/payment/vnpay/create", {
          order_id: order.id,
        });
        window.location.href = paymentResponse.data.payment_url;
      } else {
        // COD - order is already created, just redirect to success
        navigate(`/order-success/${order.id}`);
      }
    } catch (error) {
      console.error("Lỗi gửi đơn hàng:", error);
      const resp = error?.response;
      const data = resp?.data;
      if (resp?.status === 409 && data?.code === 'OUT_OF_STOCK') {
        // Áp dụng stock hints chỉ để hiển thị tồn khả dụng, KHÔNG tự chỉnh số lượng
        try {
          applyStockHints?.(data?.items || []);
        } catch (e) {
          console.warn('applyStockHints failed:', e);
        }
        // Thiết lập lỗi kho để khóa nút Đặt hàng và hiển thị hướng dẫn
        const names = (data?.items || []).map(i => i?.title).filter(Boolean);
        const stockMsg = names.length
          ? names.join(", ")
          : (data?.message || 'Một số sản phẩm đã hết hàng hoặc không đủ số lượng');
        setErrors(prev => ({ ...prev, stock: stockMsg }));
        // Toast lỗi tổng quát
        showError(
          "Hết hàng",
          data?.message || "Một số sản phẩm đã hết hàng hoặc không đủ số lượng. Vui lòng điều chỉnh số lượng trong giỏ hàng."
        );
        return; // giữ nguyên giỏ/SL, yêu cầu người dùng tự điều chỉnh
      }
      showError("Lỗi Đơn Hàng", data?.message || "Đã xảy ra lỗi khi đặt hàng của bạn");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if no items are selected for checkout
  const selectedItems = getSelectedItems();
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thêm sách vào giỏ hàng trước khi thanh toán.
            </p>
            <button
              onClick={() => navigate("/books")}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Duyệt Sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
            <ArrowLeft className="h-5 w-5" />
            Quay lại giỏ hàng
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thanh Toán
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Shipping Information and Payment Method */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Thông Tin Giao Hàng
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập họ và tên người nhận"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Tên người nhận hàng (có thể khác với tên tài khoản)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email * (Thông tin giao hàng)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập email người nhận"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email nhận thông báo đơn hàng (có thể khác với email tài
                    khoản)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Số Điện Thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Tỉnh/Thành Phố *
                  </label>
                  <select
                    name="province_id"
                    value={formData.province_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.province_id ? "border-red-500" : "border-gray-300"
                    }`}>
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.province_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.province_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Phường/Xã *
                  </label>
                  <select
                    name="ward_id"
                    value={formData.ward_id}
                    onChange={handleInputChange}
                    disabled={!formData.province_id || loadingWards}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.ward_id ? "border-red-500" : "border-gray-300"
                    }`}>
                    <option value="">
                      {loadingWards ? "Đang tải..." : "Chọn phường/xã"}
                    </option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  {errors.ward_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ward_id}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Địa Chỉ *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập địa chỉ đầy đủ"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ghi Chú Đơn Hàng (Tùy chọn)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Ghi chú đặc biệt cho đơn hàng của bạn..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Phương Thức Thanh Toán
                </h2>
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-amber-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-amber-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Thanh toán trực tuyến VNPay
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Column 2: Cart Items with Checkboxes and Quantity Controls */}
          <div className="space-y-6">
            {/* Selected Items for Checkout */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sản phẩm đã chọn ({getSelectedItemsCount()})
              </h3>

              {getSelectedItemsCount() === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Chưa có sản phẩm nào được chọn để thanh toán.
                  </p>
                  <button
                    onClick={() => navigate("/cart")}
                    className="mt-4 text-amber-600 hover:text-amber-700 font-medium">
                    Quay lại giỏ hàng để chọn sản phẩm
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {getSelectedItems().map((item) => {
                    // Use SKU as unique identifier
                    const itemKey = item.sku || `fallback_${item.id || item.book_id}_${item.variation_id || ''}`;
                    const stock = item.stock_quantity || item.stock || 0;
                    const isOutOfStock = stock === 0;
                    const isInsufficientStock = item.quantity > stock;
                    const hasStockIssue = isOutOfStock || isInsufficientStock;
                    
                    return (
                      <div
                        key={itemKey}
                        className={`flex items-center space-x-4 p-4 border rounded-lg ${
                          hasStockIssue 
                            ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20" 
                            : "border-gray-200 dark:border-gray-700"
                        }`}>
                        <img
                          src={
                            (item.variation?.image || item.image)
                              ? `http://127.0.0.1:8000/storage/${item.variation?.image || item.image}`
                              : "/placeholder-book.svg"
                          }
                          alt={item.title}
                          className="w-16 h-20 object-cover rounded"
                          onError={(e) => {
                            e.target.src = "/placeholder-book.svg";
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {item.title}
                            {item.variation && (
                              <span className="text-amber-600 dark:text-amber-400 ml-1">
                                {(() => {
                                  console.log('Variation data:', item.variation);
                                  console.log('Attributes:', item.variation.attributes);
                                  console.log('Attributes type:', typeof item.variation.attributes);
                                  
                                  const attributes = item.variation.attributes || {};
                                  if (typeof attributes === 'string') {
                                    try {
                                      const parsed = JSON.parse(attributes);
                                      return `(${Object.entries(parsed)
                                        .map(([key, value]) => `${key}: ${value}`)
                                        .join(', ')})`;
                                    } catch (e) {
                                      console.error('Failed to parse attributes:', e);
                                      return '(Biến thể)';
                                    }
                                  } else if (typeof attributes === 'object' && attributes !== null) {
                                    return `(${Object.entries(attributes)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(', ')})`;
                                  }
                                  return '(Biến thể)';
                                })()
                              }
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            bởi {item.author?.name || "Tác giả không xác định"}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Số lượng: {item.quantity}
                              </span>
                              {hasStockIssue && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                                  {isOutOfStock ? "Hết hàng" : `Chỉ còn ${stock} cuốn`}
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND
                            </span>
                          </div>
                          {hasStockIssue && (
                            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                              {isOutOfStock 
                                ? "Sản phẩm này đã hết hàng" 
                                : `Chỉ còn ${stock} sản phẩm trong kho, vui lòng giảm số lượng`
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Coupon Selector */}
            <CouponSelector
              orderAmount={getSelectedTotal()}
              onCouponSelected={(coupon, discount) => {
                setAppliedCoupon(coupon);
                setDiscountAmount(discount || 0);
              }}
              selectedCoupon={appliedCoupon}
            />

            {/* Manual Coupon Input */}
            {/* <CouponInput
              orderAmount={getSelectedTotal()}
              onCouponApplied={(coupon, discount) => {
                setAppliedCoupon(coupon);
                setDiscountAmount(discount);
              }}
              onCouponRemoved={() => {
                setAppliedCoupon(null);
                setDiscountAmount(0);
              }}
            /> */}

            {/* Order Total and Place Order Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-6">
                {getSelectedItems().map((item) => {
                  const itemKey = item.sku || `fallback_${item.id || item.book_id}_${item.variation_id || ''}`;
                  return (
                  <div
                    key={itemKey}
                    className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      {item.variation && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {(() => {
                            const attributes = item.variation.attributes || {};
                            if (typeof attributes === 'string') {
                              try {
                                const parsed = JSON.parse(attributes);
                                return Object.entries(parsed)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ');
                              } catch (e) {
                                return 'Biến thể';
                              }
                            } else if (typeof attributes === 'object' && attributes !== null) {
                              return Object.entries(attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ');
                            }
                            return 'Biến thể';
                          })()
                        }
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        SL: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {(
                        (parseInt(item.price) || 0) * parseInt(item.quantity)
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
                    </span>
                  </div>
                  );
                })}
              </div>

              {getSelectedItemsCount() === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Vui lòng chọn sản phẩm để thanh toán
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tạm tính
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {getSelectedTotal().toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({appliedCoupon.code})</span>
                      <span>-{discountAmount.toLocaleString("vi-VN")} ₫</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span className="text-gray-900 dark:text-white">
                      Tổng Cộng
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {(getSelectedTotal() - discountAmount).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Đã bỏ hiển thị thông báo lỗi tổng quát; vẫn giữ highlight từng item và disable nút khi có lỗi tồn kho */}

              <button
                type="submit"
                disabled={
                  isSubmitting || loading || getSelectedItemsCount() === 0 || errors.stock
                }
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                {isSubmitting || loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {getSelectedItemsCount() === 0
                      ? "Chọn Sản Phẩm Để Tiếp Tục"
                      : errors.stock
                      ? "Không thể đặt hàng - Sản phẩm hết hàng"
                      : "Đặt hàng"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
