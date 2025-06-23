import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { useNotification } from "./NotificationContext";

const OrderContext = createContext();

export const useOrder = () => {
  return useContext(OrderContext);
};

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const {
    notifyOrderPlaced,
    notifyOrderConfirmed,
    notifyOrderShipped,
    notifyOrderDelivered,
    notifyNewOrder,
  } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load orders from localStorage when component mounts
  useEffect(() => {
    const loadOrders = () => {
      try {
        const storedOrders = localStorage.getItem("orders");
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      } catch (error) {
        console.error("Failed to load orders from localStorage:", error);
      }
    };

    loadOrders();
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const createOrder = async (orderData) => {
    if (!user) {
      throw new Error("User must be logged in to create an order");
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newOrder = {
        id: `ORD-${Date.now()}`,
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        ...orderData,
        status: "pending",
        paymentMethod: "cod",
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days from now
      };

      setOrders((prevOrders) => [newOrder, ...prevOrders]);

      // Clear the cart after successful order creation
      clearCart();

      // Send notifications
      notifyOrderPlaced(newOrder.id);

      // Notify admin about new order (simulate admin notification)
      if (user.isAdmin !== true) {
        // In a real app, this would be sent to all admin users
        notifyNewOrder(newOrder.id, newOrder.customerName);
      }

      return newOrder;
    } catch (error) {
      setError("Failed to create order");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            const updatedOrder = {
              ...order,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              // Update payment status if order is confirmed
              paymentStatus:
                newStatus === "confirmed" ? "pending" : order.paymentStatus,
            };

            // Send status update notifications to customer
            switch (newStatus) {
              case "confirmed":
                notifyOrderConfirmed(orderId);
                break;
              case "shipped":
                notifyOrderShipped(orderId);
                break;
              case "delivered":
                notifyOrderDelivered(orderId);
                break;
            }

            return updatedOrder;
          }
          return order;
        })
      );

      return true;
    } catch (error) {
      setError("Failed to update order status");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                paymentStatus,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );

      return true;
    } catch (error) {
      setError("Failed to update payment status");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = (orderId) => {
    return orders.find((order) => order.id === orderId);
  };

  const getUserOrders = (userId) => {
    return orders.filter((order) => order.userId === userId);
  };

  const getAllOrders = () => {
    return orders;
  };

  const getOrdersByStatus = (status) => {
    return orders.filter((order) => order.status === status);
  };

  const cancelOrder = async (orderId) => {
    const order = getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      throw new Error("Cannot cancel this order");
    }

    return updateOrderStatus(orderId, "cancelled");
  };

  const value = {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderById,
    getUserOrders,
    getAllOrders,
    getOrdersByStatus,
    cancelOrder,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};
