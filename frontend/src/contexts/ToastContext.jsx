import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const MAX_TOASTS = 5;

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      ...toast,
      createdAt: Date.now(),
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      // Keep only the latest MAX_TOASTS
      return updatedToasts.slice(0, MAX_TOASTS);
    });

    // Auto-remove toast after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Predefined toast methods
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
      duration: 7000, // Errors stay longer
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

  // Specialized toast methods for common actions
  const showOrderCreated = useCallback((orderId) => {
    return addToast({
      type: 'success',
      title: 'Order Created Successfully',
      message: `Your order ${orderId} has been placed and is being processed.`,
      actionText: 'View Order',
      actionUrl: `/order-confirmation/${orderId}`,
    });
  }, [addToast]);

  const showOrderCancelled = useCallback((orderId) => {
    return addToast({
      type: 'warning',
      title: 'Order Cancelled',
      message: `Order ${orderId} has been cancelled successfully.`,
    });
  }, [addToast]);

  const showBookAdded = useCallback((bookTitle) => {
    return addToast({
      type: 'success',
      title: 'Book Added to Cart',
      message: `"${bookTitle}" has been added to your cart.`,
      actionText: 'View Cart',
      actionUrl: '/cart',
    });
  }, [addToast]);

  const showBookRemoved = useCallback((bookTitle) => {
    return addToast({
      type: 'info',
      title: 'Book Removed',
      message: `"${bookTitle}" has been removed from your cart.`,
    });
  }, [addToast]);

  const showLoginSuccess = useCallback((userName) => {
    return addToast({
      type: 'success',
      title: 'Welcome Back!',
      message: `Hello ${userName}, you've been logged in successfully.`,
    });
  }, [addToast]);

  const showLogoutSuccess = useCallback(() => {
    return addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been logged out successfully.',
    });
  }, [addToast]);

  // Admin-specific toasts
  const showAdminNewOrder = useCallback((orderId, customerName, total) => {
    return addToast({
      type: 'info',
      title: 'New Order Received',
      message: `Order ${orderId} from ${customerName} - $${total.toFixed(2)}`,
      actionText: 'View Orders',
      actionUrl: '/admin/orders',
      duration: 8000,
    });
  }, [addToast]);

  const showAdminLowStock = useCallback((bookTitle, stock) => {
    return addToast({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `"${bookTitle}" is running low (${stock} remaining)`,
      actionText: 'Manage Inventory',
      actionUrl: '/admin/books',
      duration: 10000,
    });
  }, [addToast]);

  const showBulkOperationComplete = useCallback((operation, successCount, errorCount) => {
    const type = errorCount > 0 ? 'warning' : 'success';
    const title = errorCount > 0 ? 'Bulk Operation Completed with Errors' : 'Bulk Operation Successful';
    const message = `${operation}: ${successCount} successful${errorCount > 0 ? `, ${errorCount} failed` : ''}`;
    
    return addToast({
      type,
      title,
      message,
      duration: 8000,
    });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    // Predefined methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // Specialized methods
    showOrderCreated,
    showOrderCancelled,
    showBookAdded,
    showBookRemoved,
    showLoginSuccess,
    showLogoutSuccess,
    showAdminNewOrder,
    showAdminLowStock,
    showBulkOperationComplete,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};