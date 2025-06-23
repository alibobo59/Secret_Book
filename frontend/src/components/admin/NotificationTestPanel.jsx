import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bell,
  Package,
  AlertTriangle,
  Info,
  CheckCircle,
  Settings,
  Gift,
  BookOpen,
} from 'lucide-react';

const NotificationTestPanel = () => {
  const { user } = useAuth();
  const {
    addNotification,
    notifyOrderPlaced,
    notifyOrderConfirmed,
    notifyOrderShipped,
    notifyOrderDelivered,
    notifyNewOrder,
    notifyLowStock,
    notifySystemMaintenance,
    notifyNewBookAdded,
    notifyPromotionalOffer,
  } = useNotification();

  const testNotifications = [
    {
      title: 'Test Order Placed',
      action: () => notifyOrderPlaced('ORD-TEST-001'),
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      title: 'Test Order Confirmed',
      action: () => notifyOrderConfirmed('ORD-TEST-001'),
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Test Order Shipped',
      action: () => notifyOrderShipped('ORD-TEST-001'),
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Test Order Delivered',
      action: () => notifyOrderDelivered('ORD-TEST-001'),
      icon: CheckCircle,
      color: 'bg-green-600',
    },
    {
      title: 'Test Low Stock Alert',
      action: () => notifyLowStock('The Great Gatsby', 3),
      icon: AlertTriangle,
      color: 'bg-yellow-500',
    },
    {
      title: 'Test System Maintenance',
      action: () => notifySystemMaintenance(),
      icon: Settings,
      color: 'bg-gray-500',
    },
    {
      title: 'Test New Book Added',
      action: () => notifyNewBookAdded('The Midnight Library'),
      icon: BookOpen,
      color: 'bg-indigo-500',
    },
    {
      title: 'Test Promotional Offer',
      action: () => notifyPromotionalOffer(25),
      icon: Gift,
      color: 'bg-pink-500',
    },
  ];

  // Add admin-specific notifications
  if (user?.isAdmin) {
    testNotifications.splice(4, 0, {
      title: 'Test New Order (Admin)',
      action: () => notifyNewOrder('ORD-TEST-002', 'John Doe'),
      icon: Package,
      color: 'bg-orange-500',
    });
  }

  const handleCustomNotification = () => {
    addNotification({
      title: 'Custom Test Notification',
      message: 'This is a custom notification created for testing purposes.',
      type: 'info',
      actionUrl: '/books',
      actionText: 'Browse Books',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-6 w-6 text-amber-600 dark:text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Notification Test Panel
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Use these buttons to test different types of notifications. They will appear in the notification dropdown.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testNotifications.map((notification, index) => {
          const Icon = notification.icon;
          return (
            <button
              key={index}
              onClick={notification.action}
              className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className={`p-2 rounded-full ${notification.color} text-white`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {notification.title}
              </span>
            </button>
          );
        })}
        
        {/* Custom notification button */}
        <button
          onClick={handleCustomNotification}
          className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left"
        >
          <div className="p-2 rounded-full bg-amber-500 text-white">
            <Info className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            Custom Notification
          </span>
        </button>
      </div>

      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> These are test notifications for development purposes. 
          In a production environment, notifications would be triggered by actual system events.
        </p>
      </div>
    </div>
  );
};

export default NotificationTestPanel;