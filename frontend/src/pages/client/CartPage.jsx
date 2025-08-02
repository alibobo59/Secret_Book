<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
=======
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
>>>>>>> safety-checkpoint
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
<<<<<<< HEAD
  ArrowLeft,
  ArrowRight,
  Package,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Initialize selected items when cart loads
  useEffect(() => {
    if (cartItems.length > 0) {
      const allItemIds = new Set(cartItems.map(item => item.id));
      setSelectedItems(allItemIds);
      setSelectAll(true);
    }
  }, [cartItems]);

  // Update select all state when individual items change
  useEffect(() => {
    const allSelected = cartItems.length > 0 && cartItems.every(item => selectedItems.has(item.id));
    setSelectAll(allSelected);
  }, [selectedItems, cartItems]);

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allItemIds = new Set(cartItems.map(item => item.id));
      setSelectedItems(allItemIds);
    }
    setSelectAll(!selectAll);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
=======
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
>>>>>>> safety-checkpoint
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
<<<<<<< HEAD
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const getSelectedItems = () => {
    return cartItems.filter(item => selectedItems.has(item.id));
  };

  const getSelectedTotal = () => {
    return getSelectedItems().reduce((total, item) => total + (parseFloat(item.price) || 0) * item.quantity, 0);
=======
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
>>>>>>> safety-checkpoint
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.size === 0) {
<<<<<<< HEAD
      if (toast) {
        toast.showWarning(
          'No items selected',
          'Please select at least one item to proceed to checkout.'
        );
      }
=======
      toast?.showError('Không có sản phẩm nào được chọn', 'Vui lòng chọn ít nhất một sản phẩm để tiếp tục');
>>>>>>> safety-checkpoint
      return;
    }

    if (!user) {
<<<<<<< HEAD
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    // Store selected items in sessionStorage for checkout
    const selectedCartItems = getSelectedItems();
    sessionStorage.setItem('checkoutItems', JSON.stringify(selectedCartItems));
    
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/books');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Your cart is empty
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Looks like you haven't added any books to your cart yet. Start exploring our collection!
                </p>
                <button
                  onClick={handleContinueShopping}
                  className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Continue Shopping
                </button>
              </div>
            </motion.div>
=======
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
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bạn cần đăng nhập để xem giỏ hàng
          </p>
          <Link
            to="/login"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Đăng nhập
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
              Có vẻ như bạn chưa thêm sách nào vào giỏ hàng
            </p>
            <Link
              to="/books"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Bắt đầu mua sắm
            </Link>
>>>>>>> safety-checkpoint
          </div>
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleContinueShopping}
              className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Continue Shopping
            </button>
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-8 w-8 text-amber-600 dark:text-amber-500" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Shopping Cart
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {/* Select All Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="font-medium text-gray-800 dark:text-white">
                      Select All ({cartItems.length} items)
                    </span>
                  </label>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  <AnimatePresence>
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6"
                      >
                        <div className="flex gap-4">
                          {/* Checkbox */}
                          <div className="flex items-start pt-2">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                          </div>

                          {/* Book Image */}
                          <div className="shrink-0">
                            <img
                              src={item.cover_image}
                              alt={item.title}
                              className="w-20 h-28 object-cover rounded-md"
                            />
                          </div>

                          {/* Book Details */}
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div className="flex-grow">
                                <Link
                                  to={`/books/${item.id}`}
                                  className="text-lg font-semibold text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                                >
                                  {item.title}
                                </Link>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                  by {typeof item.author === 'object' ? item.author?.name || 'Unknown Author' : item.author}
                                </p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white mt-2">
                                  ${(parseFloat(item.price) || 0).toFixed(2)}
                                </p>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 font-medium text-gray-800 dark:text-white min-w-[60px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Subtotal
                                </p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                  ${((parseFloat(item.price) || 0) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {/* Stock Status */}
                            <div className="mt-3">
                              {item.stock > 10 ? (
                                <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                  <CheckCircle className="h-4 w-4" />
                                  In Stock
                                </span>
                              ) : item.stock > 0 ? (
                                <span className="inline-flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                                  <AlertCircle className="h-4 w-4" />
                                  Only {item.stock} left
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                  <X className="h-4 w-4" />
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  Order Summary
                </h2>

                {/* Selected Items Info */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    <span className="font-medium text-amber-800 dark:text-amber-200">
                      {selectedItems.size} of {cartItems.length} items selected
                    </span>
                  </div>
                  {selectedItems.size !== cartItems.length && (
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Only selected items will be included in your order
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Selected Items ({selectedItems.size})</span>
                    <span>${getSelectedTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (10%)</span>
                    <span>${(getSelectedTotal() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-white">
                      <span>Total</span>
                      <span>${(getSelectedTotal() + getSelectedTotal() * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={selectedItems.size === 0}
                    className="w-full bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <button
                    onClick={handleContinueShopping}
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    🔒 Secure checkout with SSL encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
=======
    <div className="min-h-screen bg-amber-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Giỏ hàng
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
                          của {typeof item.author === 'object' ? item.author?.name || 'Tác giả không xác định' : item.author || 'Tác giả không xác định'}
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
                Tóm tắt đơn hàng
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
                    Miễn phí vận chuyển cho đơn hàng trên 1.200.000 ₫
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
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
>>>>>>> safety-checkpoint
      </div>
    </div>
  );
};

export default CartPage;