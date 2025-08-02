import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
<<<<<<< HEAD
    // Return null instead of throwing error to prevent crashes during initialization
    return null;
=======
    throw new Error('useToast must be used within a ToastProvider');
>>>>>>> safety-checkpoint
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
<<<<<<< HEAD

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
=======
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
>>>>>>> safety-checkpoint

    return id;
  }, []);

  const removeToast = useCallback((id) => {
<<<<<<< HEAD
    setToasts(prev => prev.filter(toast => toast.id !== id));
=======
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
>>>>>>> safety-checkpoint
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

<<<<<<< HEAD
  // Predefined toast methods for common actions
=======
  // Predefined toast methods
>>>>>>> safety-checkpoint
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
<<<<<<< HEAD
      duration: 5000, // Longer duration for errors
=======
      duration: 7000, // Errors stay longer
>>>>>>> safety-checkpoint
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

<<<<<<< HEAD
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
=======
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
      title: 'Chào mừng trở lại!',
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
      title: 'Đã nhận đơn hàng mới',
      message: `Order ${orderId} from ${customerName} - $${total.toFixed(2)}`,
      actionText: 'View Orders',
      actionUrl: '/admin/orders',
      duration: 8000,
>>>>>>> safety-checkpoint
    });
  }, [addToast]);

  const showAdminLowStock = useCallback((bookTitle, stock) => {
    return addToast({
      type: 'warning',
      title: 'Low Stock Alert',
<<<<<<< HEAD
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
=======
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
>>>>>>> safety-checkpoint
    });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
<<<<<<< HEAD
    // Generic methods
=======
    // Predefined methods
>>>>>>> safety-checkpoint
    showSuccess,
    showError,
    showWarning,
    showInfo,
<<<<<<< HEAD
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
=======
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
>>>>>>> safety-checkpoint
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};