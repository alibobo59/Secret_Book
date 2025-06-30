import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useOrder } from "../../contexts/OrderContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../services/api";
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
  Plus,
  Minus,
} from "lucide-react";

const CheckoutPage = () => {
  const {
    cartItems,
    getCartTotal,
    getSelectedItems,
    getSelectedTotal,
    getSelectedItemsCount,
    toggleItemSelection,
    selectedItems: selectedItemIds,
    updateQuantity,
  } = useCart();
  const { user } = useAuth();
  const { createOrder, loading } = useOrder();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: "",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

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
  };

  const validateForm = () => {
    const newErrors = {};

    // Name and email are read-only and pre-filled from user profile, so no validation needed
    if (!formData.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!formData.city.trim()) newErrors.city = "Thành phố là bắt buộc";
    if (!formData.address.trim()) newErrors.address = "Địa chỉ là bắt buộc";

    // Phone validation (basic)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Vui lòng nhập số điện thoại hợp lệ";
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
      const orderData = {
        items: getSelectedItems().map((item) => ({
          book_id: item.id,
          price: item.price,
          quantity: item.quantity,
        })),
        address: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
        },
        shipping: 0, // Add shipping calculation if needed
        notes: formData.notes,
      };
  
      const response = await api.post("/orders", orderData);
      const order = response.data.data;
  
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
      showError("Lỗi Đơn Hàng", "Đã xảy ra lỗi khi đặt hàng của bạn");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if cart is empty
  const selectedItems = getSelectedItems();
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thêm sách vào giỏ hàng trước khi thanh toán.
            </p>
            <button
              onClick={() => navigate("/books")}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Browse Books
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
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Checkout
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
                  Shipping Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-500 cursor-not-allowed"
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This field cannot be changed during checkout</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-500 cursor-not-allowed"
                    placeholder="Nhập email của bạn"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This field cannot be changed during checkout</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number *
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
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập thành phố"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Address *
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
                    Order Notes (Optional)
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
                  Payment Method
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
                    Cash on Delivery (COD)
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
                    VNPay Online Payment
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Column 2: Cart Items with Checkboxes and Quantity Controls */}
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cart Items ({cartItems.length})
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedItemIds.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <img
                      src={item.image || "/placeholder-book.jpg"}
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {item.author?.name || "Unknown Author"}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity:
                          </span>
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}{" "}
                          VND
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total and Place Order Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {getSelectedItems().map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {(
                        (parseInt(item.price) || 0) * parseInt(item.quantity)
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
                    </span>
                  </div>
                ))}
              </div>

              {getSelectedItemsCount() === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Please select items to checkout
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    {getSelectedTotal().toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting || loading || getSelectedItemsCount() === 0
                }
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                {isSubmitting || loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {getSelectedItemsCount() === 0
                      ? "Select Items to Continue"
                      : "Place Order"}
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
