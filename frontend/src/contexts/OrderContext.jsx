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

const OrderContext = createContext();

export const useOrder = () => {
  return useContext(OrderContext);
};

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const { clearSelectedItems } = useCart();
  const {
    notifyOrderPlaced,
    notifyOrderConfirmed,
    notifyOrderShipped,
    notifyOrderDelivered,
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
    to: 0,
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
        const userOrders = response.data.data?.data || response.data.data || [];
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

      setOrders((prevOrders) => [newOrder, ...prevOrders]);

      // Remove only the purchased items from the cart (selected items)
      await clearSelectedItems();

      notifyOrderPlaced(newOrder.id);

      return newOrder;
    } catch (error) {
      setError("Failed to create order");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, cancellationReason = null) => {
    setLoading(true);
    setError(null);

    try {
      const requestData = { status: newStatus };
      if (newStatus === "cancelled" && cancellationReason) {
        requestData.cancellation_reason = cancellationReason;
      }

      const response = await api.patch(`/admin/orders/${orderId}/status`, requestData);

      const updatedOrder = response.data.data;

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
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
              default:
                break;
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
  }, []);

  const cancelOrder = useCallback(async (orderId, cancellationReason) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/orders/${orderId}/cancel`, {
        cancellation_reason: cancellationReason,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: "cancelled", updated_at: new Date().toISOString() }
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
  }, []);

  // Admin: fetch all orders with pagination and filters
  const getAllOrders = useCallback(async (page = 1, perPage = 10, filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        ...Object.fromEntries(
          Object.entries(filters || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
        ),
      });

      const response = await api.get(`/admin/orders?${params.toString()}`);
      const responseData = response.data.data || {};
      const allOrders = responseData.data || responseData || [];
      const paginationData = {
        current_page: responseData.current_page || page,
        last_page: responseData.last_page || 1,
        per_page: responseData.per_page || perPage,
        total: responseData.total || (Array.isArray(allOrders) ? allOrders.length : 0),
        from: responseData.from || 0,
        to: responseData.to || 0,
      };

      setOrders(allOrders);
      setPagination(paginationData);

      return { orders: allOrders, pagination: paginationData };
    } catch (error) {
      console.error("Failed to fetch all orders:", error);
      setError("Failed to fetch all orders");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        pagination,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        getOrderById,
        cancelOrder,
        getUserOrders,
        getAllOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
