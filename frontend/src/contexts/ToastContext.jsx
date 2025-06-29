import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return null instead of throwing error to prevent crashes during initialization
    return null;
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    
    const newToast = {
      id,
      type: toast.type || 'info', // success, error, warning, info
      title: toast.title,
      message: toast.message,
      duration: toast.duration || (toast.type === 'error' ? 5000 : 3000),
      action: toast.action || null, // { label: 'View Order', onClick: () => {} }
      isAdmin: toast.isAdmin || false,
      timestamp: new Date().toISOString(),
      ...toast,
    };

    setToasts(prev => [newToast, ...prev]);

    // Auto dismiss after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Predefined toast methods for common actions
  const showSuccess = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addToast]);

  const showError = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 5000, // Longer duration for errors
      ...options,
    });
  }, [addToast]);

  const showWarning = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [addToast]);

  const showInfo = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addToast]);

  // User-specific toast methods
  const showLoginSuccess = useCallback((userName) => {
    return showSuccess(
      'Welcome back!',
      `Hello ${userName}, you're successfully logged in.`,
      {
        action: {
          label: 'View Profile',
          onClick: () => window.location.href = `/profile/${userName}`,
        },
      }
    );
  }, [showSuccess]);

  const showLogoutSuccess = useCallback(() => {
    return showInfo(
      'Logged out',
      'You have been successfully logged out.',
    );
  }, [showInfo]);

  const showItemAddedToCart = useCallback((bookTitle) => {
    return showSuccess(
      'Added to cart',
      `"${bookTitle}" has been added to your cart.`,
      {
        action: {
          label: 'View Cart',
          onClick: () => window.location.href = '/checkout',
        },
      }
    );
  }, [showSuccess]);

  const showItemRemovedFromCart = useCallback((bookTitle) => {
    return showInfo(
      'Removed from cart',
      `"${bookTitle}" has been removed from your cart.`,
    );
  }, [showInfo]);

  const showOrderCreated = useCallback((orderId) => {
    return showSuccess(
      'Order placed successfully!',
      `Your order #${orderId} has been placed and is being processed.`,
      {
        action: {
          label: 'View Order',
          onClick: () => window.location.href = `/order-confirmation/${orderId}`,
        },
      }
    );
  }, [showSuccess]);

  const showOrderCancelled = useCallback((orderId) => {
    return showWarning(
      'Order cancelled',
      `Order #${orderId} has been cancelled successfully.`,
    );
  }, [showWarning]);

  // Admin-specific toast methods
  const showAdminNewOrder = useCallback((orderId, customerName, amount) => {
    return addToast({
      type: 'info',
      title: 'New Order Received',
      message: `Order #${orderId} from ${customerName} - $${amount.toFixed(2)}`,
      duration: 5000, // Longer for admin notifications
      isAdmin: true,
      action: {
        label: 'Manage Order',
        onClick: () => window.location.href = '/admin/orders',
      },
    });
  }, [addToast]);

  const showAdminLowStock = useCallback((bookTitle, stock) => {
    return addToast({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `"${bookTitle}" - Only ${stock} items remaining`,
      duration: 0, // Persistent until manually dismissed
      isAdmin: true,
      action: {
        label: 'Manage Inventory',
        onClick: () => window.location.href = '/admin/books',
      },
    });
  }, [addToast]);

  const showAdminUserRegistered = useCallback((userEmail) => {
    return addToast({
      type: 'success',
      title: 'New User Registered',
      message: `${userEmail} has joined the platform`,
      isAdmin: true,
      action: {
        label: 'View Users',
        onClick: () => window.location.href = '/admin/users',
      },
    });
  }, [addToast]);

  const showAdminSystemError = useCallback((error, details) => {
    return addToast({
      type: 'error',
      title: 'System Error',
      message: `${error}${details ? ` - ${details}` : ''}`,
      duration: 0, // Persistent for critical errors
      isAdmin: true,
    });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    // Generic methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // User-specific methods
    showLoginSuccess,
    showLogoutSuccess,
    showItemAddedToCart,
    showItemRemovedFromCart,
    showOrderCreated,
    showOrderCancelled,
    // Admin-specific methods
    showAdminNewOrder,
    showAdminLowStock,
    showAdminUserRegistered,
    showAdminSystemError,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};