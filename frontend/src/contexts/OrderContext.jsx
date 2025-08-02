// Added missing React import
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { useNotification } from "./NotificationContext";
import { api } from "../services/api";

// Removed duplicate functions:
// - Removed old synchronous getOrderById function
// - Removed old cancelOrder function that used updateOrderStatus
// - Kept the new async versions that work with the API

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
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });

  const getUserOrders = useCallback(
    async (forceRefresh = false) => {
      if (!user) {
        throw new Error("User must be logged in to fetch orders");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/orders");
        const userOrders = response.data.data.data || response.data.data || [];
        setOrders(userOrders);
        return userOrders;
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setError("Failed to fetch orders");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Load user orders when component mounts and user is available
  useEffect(() => {
    if (user) {
      getUserOrders().catch((error) => {
        console.error("Failed to load initial orders:", error);
      });
    }
  }, [user, getUserOrders]);

  const createOrder = async (orderData) => {
    if (!user) {
      throw new Error("User must be logged in to create an order");
    }

    setLoading(true);
    setError(null);
  
    try {
      const response = await api.post("/orders", {
        customer_name: user.name,
        customer_email: user.email,
        ...orderData,
        payment_method: orderData.paymentMethod || "cod",
      });
  
      const newOrder = response.data.data;
  
      // Update local state
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
  
      // Clear the cart after successful order creation
      clearCart();
  
      // Send notifications
      notifyOrderPlaced(newOrder.id);
  
      // Notify admin about new order - FIXED CONDITION
      // This should only notify admins, not regular users
      // Remove this from here since it should be handled server-side or in admin context
      
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
      const response = await api.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
  
      const updatedOrder = response.data.data;
  
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            // Send status update notifications ONLY to customers, not admins
            if (user?.role === 'user') {
              switch (newStatus) {
                case "processing":
                  notifyOrderConfirmed(orderId);
                  break;
                case "shipped":
                  notifyOrderShipped(orderId);
                  break;
                case "delivered":
                  notifyOrderDelivered(orderId);
                  break;
              }
            }
            return updatedOrder;
          }
          return order;
        })
      );
      
      return updatedOrder;
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
      const response = await api.patch(`/admin/orders/${orderId}/payment`, {
        payment_status: paymentStatus,
      });

      const updatedOrder = response.data.data;

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      return updatedOrder;
    } catch (error) {
      setError("Failed to update payment status");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setError("Failed to fetch order");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed for this function

  const cancelOrder = useCallback(async (orderId, cancellationReason) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/orders/${orderId}/cancel`, {
        cancellation_reason: cancellationReason,
      });

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "cancelled",
                updated_at: new Date().toISOString(),
              }
            : order
        )
      );

      return response.data.data;
    } catch (error) {
      console.error("Failed to cancel order:", error);
      setError("Failed to cancel order");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed for this function

  const getAllOrders = useCallback(async (page = 1, perPage = 10, filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filters
      });
      
      const response = await api.get(`/admin/orders?${params}`);
      const responseData = response.data.data;
      
      // Handle paginated response structure
      const allOrders = responseData.data || [];
      const paginationData = {
        current_page: responseData.current_page || 1,
        last_page: responseData.last_page || 1,
        per_page: responseData.per_page || 10,
        total: responseData.total || 0,
        from: responseData.from || 0,
        to: responseData.to || 0
      };
      
      setOrders(allOrders);
      setPagination(paginationData);
      
      return {
        orders: allOrders,
        pagination: paginationData
      };
    } catch (error) {
      console.error("Failed to fetch all orders:", error);
      setError("Failed to fetch all orders");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrdersByStatus = (status) => {
    return orders.filter((order) => order.status === status);
  };

  const getOrderStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/admin/orders/stats");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch order statistics:", error);
      setError("Failed to fetch order statistics");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllowedStatuses = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/admin/orders/${orderId}/allowed-statuses`);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch allowed statuses:", error);
      setError("Failed to fetch allowed statuses");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async (page = 1, perPage = 10, filters = {}) => {
    if (user?.isAdmin) {
      return await getAllOrders(page, perPage, filters);
    } else {
      return await getUserOrders(true);
    }
  }, [user, getAllOrders, getUserOrders]);

  const value = {
    orders,
    loading,
    error,
    pagination,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderById,
    getUserOrders,
    getAllOrders,
    getOrdersByStatus,
    getOrderStats,
    getAllowedStatuses,
    refreshOrders,
    cancelOrder,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};
// REMOVE OR COMMENT OUT these lines (105-107):
// if (user.isAdmin !== true) {
//   notifyNewOrder(newOrder.id, newOrder.customer_name || user.name);
// }
