import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
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
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
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
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.size === 0) {
      if (toast) {
        toast.showWarning(
          'No items selected',
          'Please select at least one item to proceed to checkout.'
        );
      }
      return;
    }

    if (!user) {
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
          </div>
        </div>
      </div>
    );
  }

  return (
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
      </div>
    </div>
  );
};

export default CartPage;