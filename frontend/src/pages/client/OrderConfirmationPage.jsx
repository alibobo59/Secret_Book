import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder } from "../../contexts/OrderContext";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
  Download,
  Phone,
  Mail,
} from "lucide-react";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { getOrderById } = useOrder();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orderData = getOrderById(orderId);
    if (orderData) {
      setOrder(orderData);
    } else {
      // If order not found, redirect to orders page
      navigate("/profile/orders");
    }
  }, [orderId, getOrderById, navigate]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The order you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link
            to="/books"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "shipped":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return <Package className="h-5 w-5" />;
      case "processing":
        return <Package className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Thank you for your order. We'll send you a confirmation email
              shortly.
            </p>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Order Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      Order #{order.id}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    Order Items
                  </h3>
                  {order.items.map((item, index) => (
                    <div
                      key={item.bookId || index}
                      className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          Book ID: {item.bookId}
                        </h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {item.quantity}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Shipping Address
                  </h3>
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-medium">
                    {order.shippingAddress.name}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {order.contactInfo.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {order.contactInfo.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>${order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-white">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-800 dark:text-white">
                      Payment Method
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 ml-8">
                    Cash on Delivery (COD)
                  </p>
                </div>

                {/* Estimated Delivery */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-800 dark:text-white">
                      Estimated Delivery
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 ml-8">
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </button>

                  <Link
                    to="/books"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Continue Shopping
                  </Link>

                  <Link
                    to={`/profile/${user?.username}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    View All Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
