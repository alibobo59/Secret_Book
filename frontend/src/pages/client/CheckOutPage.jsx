import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useOrder } from "../../contexts/OrderContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import {
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Truck,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

const CheckoutPage = () => {
  const { cartItems, getCartTotal } = useCart();
  const { user } = useAuth();
  const { createOrder, loading } = useOrder();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.postalCode.trim())
      newErrors.postalCode = "Postal code is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (basic)
    const phoneRegex = /^0\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          bookId: item.id,
          title: item.title,
          author: item.author,
          price: item.price,
          quantity: item.quantity,
          coverImage: item.cover_image,
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
        },
        subtotal: getCartTotal(),
        shipping: 0, // Free shipping
        tax: getCartTotal() * 0.1, // 10% tax
        total: getCartTotal() + getCartTotal() * 0.1,
        notes: formData.notes,
      };

      const order = await createOrder(orderData);

      // Redirect to order confirmation page
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add some books to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate("/books")}
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Continue Shopping
          </button>
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
          className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate("/cart")}
              className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 mb-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Cart
            </button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Checkout
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Contact Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white ${
                          errors.lastName
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white ${
                            errors.email
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Enter your email"
                        />
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white ${
                            errors.phone
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Enter your phone number"
                        />
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Shipping Address
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white ${
                          errors.address
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter your street address"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white ${
                            errors.city
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Enter your city"
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white ${
                            errors.postalCode
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Enter postal code"
                        />
                        {errors.postalCode && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.postalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Any special instructions for your order..."
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

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="cod"
                        name="payment"
                        value="cod"
                        checked
                        readOnly
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <label
                        htmlFor="cod"
                        className="flex items-center gap-3 cursor-pointer">
                        <Truck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            Cash on Delivery (COD)
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Pay when your order is delivered to your doorstep
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          by{" "}
                          {typeof item.author === "object"
                            ? item.author?.name || "Unknown Author"
                            : item.author}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (10%)</span>
                    <span>${(getCartTotal() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-white">
                      <span>Total</span>
                      <span>
                        ${(getCartTotal() + getCartTotal() * 0.1).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || loading}
                  className="w-full mt-6 bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 transition-colors disabled:bg-amber-400 disabled:cursor-not-allowed flex items-center justify-center">
                  {isSubmitting || loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
