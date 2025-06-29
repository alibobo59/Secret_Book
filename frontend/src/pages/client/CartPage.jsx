import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  CheckSquare,
  Square,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const {
    cartItems,
    selectedItems,
    removeFromCart,
    updateQuantity,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    getSelectedTotal,
    getSelectedItems,
    getSelectedItemsCount,
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.size === 0) {
      toast?.showError('Không có sản phẩm nào được chọn', 'Vui lòng chọn ít nhất một sản phẩm để tiếp tục');
      return;
    }

    if (!user) {
      toast?.showError('Vui lòng đăng nhập', 'Bạn cần đăng nhập để thanh toán');
      navigate('/login');
      return;
    }

    navigate('/checkout');
  };

  const selectedTotal = getSelectedTotal(); // in cents
  const selectedCount = getSelectedItemsCount();
  const tax = Math.round(selectedTotal * 0.08); // 8% tax in cents
  const shipping = selectedTotal > 1200000 ? 0 : 120000; // 1,200,000 VND threshold, 120,000 VND shipping
  const finalTotal = selectedTotal + tax + shipping; // all in cents

  if (!user) {
    return (
      <div className="min-h-screen bg-amber-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Vui Lòng Đăng Nhập
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bạn cần đăng nhập để xem giỏ hàng của mình
          </p>
          <Link
            to="/login"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Đăng Nhập Ngay
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Có vẻ như bạn chưa thêm cuốn sách nào vào giỏ hàng
            </p>
            <Link
              to="/books"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Bắt Đầu Mua Sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Giỏ Hàng
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {cartItems.length} sản phẩm trong giỏ hàng của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Select All Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                  >
                    {selectedItems.size === cartItems.length ? (
                      <CheckSquare className="h-5 w-5 text-amber-600" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                    <span className="font-medium">
                      Chọn Tất Cả ({cartItems.length} sản phẩm)
                    </span>
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Đã chọn {selectedCount} trong {cartItems.length} sản phẩm
                  </span>
                </div>
              </div>

              {/* Cart Items List */}
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <button
                        onClick={() => toggleItemSelection(item.id)}
                        className="mt-2 text-gray-400 hover:text-amber-600 transition-colors"
                      >
                        {selectedItems.has(item.id) ? (
                          <CheckSquare className="h-5 w-5 text-amber-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>

                      {/* Book Image */}
                      <div className="w-20 h-28 flex-shrink-0">
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/books/${item.id}`}
                          className="block hover:text-amber-600 transition-colors"
                        >
                          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1 line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          của {item.author}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-800 dark:text-white">
                            {(parseInt(item.price) || 0).toLocaleString('vi-VN')} ₫
                          </span>
                          {item.original_price && parseInt(item.original_price) > parseInt(item.price) && (
                            <span className="text-sm text-gray-500 line-through">
                              {(parseInt(item.original_price) || 0).toLocaleString('vi-VN')} ₫
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[3rem] text-gray-800 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          aria-label="Xóa sản phẩm"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.stock < 5 && (
                      <div className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                        Chỉ còn {item.stock} sản phẩm trong kho
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Tóm Tắt Đơn Hàng
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính ({selectedCount} sản phẩm)</span>
                  <span>{selectedTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Thuế</span>
                  <span>{tax.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phí vận chuyển</span>
                  <span>{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')} ₫`}</span>
                </div>
                {shipping > 0 && (
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    Miễn phí vận chuyển cho đơn hàng trên 1,200,000 ₫
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white">
                    <span>Tổng cộng</span>
                    <span>{finalTotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={selectedCount === 0 || isProcessing}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Tiến Hành Thanh Toán
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <Link
                  to="/books"
                  className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 text-sm transition-colors"
                >
                  Tiếp Tục Mua Sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;