import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { api } from "../services/api";

const OrderContext = createContext();

export const useOrder = () => {
  return useContext(OrderContext);
};

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load orders from API when component mounts
  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch all orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    if (!user) {
      throw new Error("User must be logged in to create an order");
    }

    setLoading(true);
    setError(null);

    try {
      const newOrderData = {
        customerName: user.name,
        customerEmail: user.email,
        ...orderData,
        status: "pending",
        paymentMethod: "cod",
        paymentStatus: "pending",
      };

      const response = await api.post('/orders', newOrderData);
      const newOrder = response.data;

      setOrders((prevOrders) => [newOrder, ...prevOrders]);

      // Clear the cart after successful order creation
      clearCart();

      return newOrder;
    } catch (error) {
      console.error("Failed to create order:", error);
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
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus
      });
      
      const updatedOrder = response.data;

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            return updatedOrder;
          }
          return order;
        })
      );

      return true;
    } catch (error) {
      console.error("Failed to update order status:", error);
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
      const response = await api.put(`/orders/${orderId}/payment`, {
        paymentStatus
      });
      
      const updatedOrder = response.data;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? updatedOrder : order
        )
      );

      return true;
    } catch (error) {
      console.error("Failed to update payment status:", error);
      setError("Failed to update payment status");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch order:", error);
      return orders.find((order) => order.id === orderId); // Fallback to local state
    }
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

  const cancelOrder = async (orderId, cancellationReason) => {
    const order = orders.find((order) => order.id === orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      throw new Error("Cannot cancel this order");
    }

    if (!cancellationReason || cancellationReason.trim().length < 10) {
      throw new Error("Cancellation reason must be at least 10 characters long");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/orders/${orderId}/cancel`, {
        cancellation_reason: cancellationReason
      });
      
      const updatedOrder = response.data;

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            return updatedOrder;
          }
          return order;
        })
      );

      return true;
    } catch (error) {
      console.error("Failed to cancel order:", error);
      setError("Failed to cancel order");
      throw error;
    } finally {
      setLoading(false);
    }
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
    fetchUserOrders,
    fetchAllOrders,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};
