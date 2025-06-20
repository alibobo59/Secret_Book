import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { t } = useLanguage();

  const handleQuantityChange = (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(bookId, newQuantity);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-white mb-8">
        {t("cart.title")}
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
            <ShoppingBag className="h-8 w-8 text-amber-600 dark:text-amber-500" />
          </div>
          <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-4">
            {t("cart.empty.title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t("cart.empty.message")}
          </p>
          <Link
            to="/books"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
            {t("nav.books")}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Shipping Information and Payment Method */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-6">
                {t("cart.shippingInfo")}
              </h2>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="shippingName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("cart.shippingName")}
                  </label>
                  <input
                    type="text"
                    id="shippingName"
                    name="shippingName"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t("cart.shippingNamePlaceholder")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="shippingAddress"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("cart.shippingAddress")}
                  </label>
                  <input
                    type="text"
                    id="shippingAddress"
                    name="shippingAddress"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t("cart.shippingAddressPlaceholder")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="shippingCity"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("cart.shippingCity")}
                  </label>
                  <input
                    type="text"
                    id="shippingCity"
                    name="shippingCity"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t("cart.shippingCityPlaceholder")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="shippingPostalCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("cart.shippingPostalCode")}
                  </label>
                  <input
                    type="text"
                    id="shippingPostalCode"
                    name="shippingPostalCode"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    placeholder={t("cart.shippingPostalCodePlaceholder")}
                  />
                </div>
              </form>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-6 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-500" />
                {t("cart.paymentMethod")}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cashOnDelivery"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    defaultChecked
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                  />
                  <label
                    htmlFor="cashOnDelivery"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t("cart.cashOnDelivery")}
                  </label>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Cart Items and Summary */}
          <div className="space-y-8">
            {/* Cart Items */}
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex gap-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
                  {/* Book Image */}
                  <Link to={`/books/${item.id}`} className="shrink-0">
                    <img
                      src={item.cover_image}
                      alt={item.title}
                      className="w-24 h-32 object-cover rounded-md"
                    />
                  </Link>

                  {/* Book Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          to={`/books/${item.id}`}
                          className="text-lg font-medium text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-500">
                          {item.title}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400">
                          {t("book.by")} {item.author.name}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        aria-label="Remove item">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          aria-label="Decrease quantity">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center text-gray-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          aria-label="Increase quantity">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-lg font-medium text-gray-800 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-gray-800 dark:text-white mb-6">
                {t("cart.summary")}
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t("cart.subtotal")}</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t("cart.shipping")}</span>
                  <span>{t("cart.free")}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-lg font-medium text-gray-800 dark:text-white">
                    <span>{t("cart.total")}</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t("cart.vat")}
                  </p>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                {t("cart.checkout")}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
