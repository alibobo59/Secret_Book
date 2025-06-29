import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { X, CheckCircle, XCircle, AlertTriangle, Info, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContainer = () => {
  const { toastQueue, removeToast } = useNotification();

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'order':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getToastBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'order':
        return 'border-l-purple-500';
      case 'system':
        return 'border-l-gray-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toastQueue.map((toast, index) => (
          <motion.div
            key={toast.toastId}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ top: `${index * 80}px` }}
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 border-l-4 ${getToastBorderColor(toast.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getToastIcon(toast.type)}
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {toast.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {toast.message}
                </p>
                {toast.actionUrl && toast.actionText && (
                  <a
                    href={toast.actionUrl}
                    className="inline-block mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    {toast.actionText} →
                  </a>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.toastId)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;