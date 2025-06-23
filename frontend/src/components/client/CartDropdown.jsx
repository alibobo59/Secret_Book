import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNavigate, Link } from "react-router-dom";
import ConfirmRemoveModal from "../common/ConfirmRemoveModal";

const CartDropdown = ({ className = "" }) => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getItemCount,
  } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    productId: null,
    variationId: null,
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

  const handleQuantityChange = (bookId, newQuantity, variationId = null) => {
    if (newQuantity <= 0) {
      const itemKey = variationId ? `${bookId}-${variationId}` : `${bookId}`;
      const item = cartItems.find((item) => {
        const existingKey = item.selectedVariation 
          ? `${item.book.id}-${item.selectedVariation.id}`
          : `${item.book.id}`;
        return existingKey === itemKey;
      });
      setConfirmModal({
        isOpen: true,
        productId: bookId,
        variationId: variationId,
        productTitle: item?.book?.title || "this item",
      });
    } else {
      updateQuantity(bookId, newQuantity, variationId);
    }
  };

  const handleConfirmRemove = () => {
    if (confirmModal.productId) {
      removeFromCart(confirmModal.productId, confirmModal.variationId);
    }
    setConfirmModal({ isOpen: false, productId: null, variationId: null, productTitle: "" });
  };

  const handleCancelRemove = () => {
    setConfirmModal({ isOpen: false, productId: null, variationId: null, productTitle: "" });
  };

  const handleRemoveItem = (bookId, variationId = null) => {
    removeFromCart(bookId, variationId);
  };

  const toggleDropdown = () => {
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
            className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium border-2 border-white dark:border-gray-800">
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
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {t("nav.cart")}
                </h3>
                {getItemCount() > 0 && (
                  <span className="bg-amber-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {getItemCount()}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-64 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Add some books to get started!
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {cartItems.map((item) => {
                    const itemKey = item.selectedVariation 
                      ? `${item.book.id}-${item.selectedVariation.id}`
                      : `${item.book.id}`;
                    const price = item.selectedVariation ? item.selectedVariation.price : item.book.price;
                    
                    return (
                    <motion.div
                      key={itemKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      {/* Book Image */}
                      <div className="shrink-0">
                        <img
                          src={item.book.image}
                          alt={item.book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      </div>

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1">
                          {item.book.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {typeof item.book.author === "object"
                            ? item.book.author?.name || "Unknown Author"
                            : item.book.author}
                        </p>
                        {item.selectedVariation && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            {Object.entries(item.selectedVariation.attributes || {}).map(([key, value]) => 
                              `${key}: ${value}`
                            ).join(', ')}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ${(parseFloat(price) || 0).toFixed(2)} each
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.book.id, item.quantity - 1, item.selectedVariation?.id)
                              }
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.book.id, item.quantity + 1, item.selectedVariation?.id)
                              }
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                              $
                              {
                                ((parseFloat(price) || 0) * item.quantity).toFixed(2)
                              }
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.book.id, item.selectedVariation?.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded transition-colors"
                              title="Remove item">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-800 dark:text-white">
                    Total:
                  </span>
                  <span className="font-bold text-lg text-gray-800 dark:text-white">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors text-center block font-medium">
                  Checkout
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
