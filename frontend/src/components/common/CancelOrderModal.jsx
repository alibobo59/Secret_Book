import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader } from "lucide-react";

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderNumber, loading = false }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError("Please provide a cancellation reason");
      return;
    }
    
    if (reason.trim().length < 10) {
      setError("Cancellation reason must be at least 10 characters long");
      return;
    }
    
    if (reason.trim().length > 500) {
      setError("Cancellation reason must not exceed 500 characters");
      return;
    }
    
    setError("");
    onConfirm(reason.trim());
  };

  const handleClose = () => {
    if (!loading) {
      setReason("");
      setError("");
      onClose();
    }
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    if (error) {
      setError("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cancel Order
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order #{orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Please provide a reason for cancelling this order. This information helps us improve our service.
                </p>
                
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cancellation Reason *
                </label>
                
                <textarea
                  value={reason}
                  onChange={handleReasonChange}
                  disabled={loading}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    error
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Please explain why you want to cancel this order..."
                  maxLength={500}
                />
                
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {reason.length}/500 characters
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Minimum 10 characters required
                  </div>
                </div>
                
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason.trim() || reason.trim().length < 10}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Order"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CancelOrderModal;