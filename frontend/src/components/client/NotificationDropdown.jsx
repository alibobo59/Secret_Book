import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Settings,
  ExternalLink,
  X,
} from 'lucide-react';

const NotificationDropdown = ({ className = "" }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'order':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Limit notifications shown in dropdown
  const displayedNotifications = notifications.slice(0, 5);
  const hasMoreNotifications = notifications.length > 5;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
        
        {unreadCount > 0 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 bg-red-500 rounded-full w-[18px] h-[18px] opacity-75"
          />
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markAllAsRead();
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => {
                    clearAllNotifications();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear all
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No notifications
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <>
                  {displayedNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                        !notification.read ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium line-clamp-1 ${
                              !notification.read 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-amber-500 rounded-full shrink-0 mt-1" />
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {notification.actionUrl && (
                                <Link
                                  to={notification.actionUrl}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                  }}
                                  className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400"
                                >
                                  {notification.actionText || 'View'}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              )}
                              
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                title="Delete notification"
                              >
                                <Trash2 className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {hasMoreNotifications && (
                    <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium"
                      >
                        View all notifications ({notifications.length})
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;