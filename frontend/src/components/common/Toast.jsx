import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (toast.duration / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            handleRemove();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastConfig = () => {
    const baseConfig = {
      success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-500 dark:text-green-400',
        titleColor: 'text-green-800 dark:text-green-200',
        messageColor: 'text-green-700 dark:text-green-300',
        progressColor: 'bg-green-500',
      },
      error: {
        icon: XCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-500 dark:text-red-400',
        titleColor: 'text-red-800 dark:text-red-200',
        messageColor: 'text-red-700 dark:text-red-300',
        progressColor: 'bg-red-500',
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        iconColor: 'text-yellow-500 dark:text-yellow-400',
        titleColor: 'text-yellow-800 dark:text-yellow-200',
        messageColor: 'text-yellow-700 dark:text-yellow-300',
        progressColor: 'bg-yellow-500',
      },
      info: {
        icon: Info,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-500 dark:text-blue-400',
        titleColor: 'text-blue-800 dark:text-blue-200',
        messageColor: 'text-blue-700 dark:text-blue-300',
        progressColor: 'bg-blue-500',
      },
    };

    const config = baseConfig[toast.type] || baseConfig.info;

    // Add admin-specific styling
    if (toast.isAdmin) {
      return {
        ...config,
        bgColor: config.bgColor + ' border-l-4 border-l-amber-500',
        borderColor: config.borderColor + ' shadow-lg',
      };
    }

    return config;
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`relative w-full max-w-sm ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg overflow-hidden`}
        >
          {/* Progress bar */}
          {toast.duration > 0 && (
            <div className="absolute top-0 left-0 h-1 bg-gray-200 dark:bg-gray-700 w-full">
              <motion.div
                className={`h-full ${config.progressColor}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <Icon className={`h-5 w-5 ${config.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-grow">
                    <h4 className={`font-medium text-sm ${config.titleColor}`}>
                      {toast.title}
                    </h4>
                    {toast.message && (
                      <p className={`text-sm mt-1 ${config.messageColor}`}>
                        {toast.message}
                      </p>
                    )}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={handleRemove}
                    className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Action button */}
                {toast.action && (
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        toast.action.onClick();
                        handleRemove();
                      }}
                      className={`inline-flex items-center gap-1 text-sm font-medium ${config.iconColor} hover:underline`}
                    >
                      {toast.action.label}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin badge */}
          {toast.isAdmin && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                Admin
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;