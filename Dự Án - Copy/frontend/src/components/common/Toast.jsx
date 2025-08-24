import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(100);

  const duration = toast.duration || 5000;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return Math.max(0, newProgress);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-white dark:bg-gray-800',
          border: 'border-l-4 border-green-500',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          progressColor: 'bg-green-500',
        };
      case 'error':
        return {
          bg: 'bg-white dark:bg-gray-800',
          border: 'border-l-4 border-red-500',
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          progressColor: 'bg-red-500',
        };
      case 'warning':
        return {
          bg: 'bg-white dark:bg-gray-800',
          border: 'border-l-4 border-yellow-500',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          progressColor: 'bg-yellow-500',
        };
      case 'info':
      default:
        return {
          bg: 'bg-white dark:bg-gray-800',
          border: 'border-l-4 border-blue-500',
          icon: <Info className="h-5 w-5 text-blue-500" />,
          progressColor: 'bg-blue-500',
        };
    }
  };

  const styles = getToastStyles();

  const handleAction = () => {
    if (toast.actionUrl) {
      navigate(toast.actionUrl);
      removeToast(toast.id);
    }
  };

  const handleClose = () => {
    removeToast(toast.id);
  };

  return (
    <div
      className={`
        ${styles.bg} ${styles.border}
        rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
        max-w-sm w-full overflow-hidden
        transform transition-all duration-300 ease-in-out
        hover:shadow-xl hover:scale-105
      `}
    >
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full ${styles.progressColor} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Toast content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {styles.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {toast.message}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="flex-shrink-0 ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Đóng thông báo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Action button */}
            {toast.actionText && toast.actionUrl && (
              <div className="mt-3">
                <button
                  onClick={handleAction}
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                >
                  {toast.actionText}
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;