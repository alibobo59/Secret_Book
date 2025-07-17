import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Trash2, CheckSquare, Square } from "lucide-react";
import { useCart } from "../../contexts/CartContext";

import { useNavigate, Link } from "react-router-dom";
import ConfirmRemoveModal from "../common/ConfirmRemoveModal";

const CartDropdown = ({ className = "" }) => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getItemCount,
    selectedItems,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    getSelectedTotal,
    getSelectedItemsCount,
  } = useCart();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    productId: null,
    productTitle: "",
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) {
      const item = cartItems.find((item) => item.id === id);
      setConfirmModal({
        isOpen: true,
        productId: id,
        productTitle: item?.title || "this item",
      });
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleConfirmRemove = () => {
    if (confirmModal.productId) {
      removeFromCart(confirmModal.productId);
    }
    setConfirmModal({ isOpen: false, productId: null, productTitle: "" });
  };

  const handleCancelRemove = () => {
    setConfirmModal({ isOpen: false, productId: null, productTitle: "" });
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const toggleDropdown = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If there's not enough space below (less than 400px) and more space above, show dropdown above
      if (spaceBelow < 400 && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label={`Shopping cart ${
          getItemCount() > 0 ? `(${getItemCount()} items)` : ""
        }`}>
        <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />

        {getItemCount() > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium border-2 border-white dark:border-gray-800">
            {getItemCount() > 99 ? "99+" : getItemCount()}
          </motion.span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden flex flex-col ${
              dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Giỏ Hàng
                </h3>
                {getItemCount() > 0 && (
                  <span className="bg-amber-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {getItemCount()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={() => {
                      if (selectedItems.size === cartItems.length) {
                        deselectAllItems();
                      } else {
                        selectAllItems();
                      }
                    }}
                    className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    {selectedItems.size === cartItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Giỏ hàng của bạn đang trống
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Thêm một số sách để bắt đầu!
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      {/* Checkbox */}
                      <div className="shrink-0 flex items-start pt-2">
                        <button
                          onClick={() => toggleItemSelection(item.id)}
                          className="text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 transition-colors">
                          {selectedItems.has(item.id) ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Book Image */}
                      <div className="shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      </div>

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {typeof item.author === "object"
                            ? item.author?.name || "Tác giả không xác định"
                            : item.author}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(parseInt(item.price) || 0).toLocaleString('vi-VN')} ₫ each
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              {((parseInt(item.price) || 0) * item.quantity).toLocaleString('vi-VN')} ₫
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded transition-colors"
                              title="Remove item">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Đã chọn ({getSelectedItemsCount()}):
                  </span>
                  <span className="font-bold text-lg text-gray-800 dark:text-white">
                    {getSelectedTotal().toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-800 dark:text-white">
                    Tổng cộng:
                  </span>
                  <span className="font-bold text-lg text-gray-800 dark:text-white">
                    {getCartTotal().toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <Link
                  to={getSelectedItemsCount() > 0 ? "/checkout" : "#"}
                  onClick={() => {
                    if (getSelectedItemsCount() > 0) {
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full py-2 px-4 rounded-md transition-colors text-center block font-medium ${
                    getSelectedItemsCount() > 0
                      ? "bg-amber-600 text-white hover:bg-amber-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}>
                  Thanh Toán Đã Chọn
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmRemoveModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        productTitle={confirmModal.productTitle}
      />
    </div>
  );
};

export default CartDropdown;
