import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const CancelOrderModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  orderNumber, 
  loading = false 
}) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const predefinedReasons = [
    'Changed my mind',
    'Found a better price elsewhere',
    'No longer need the item',
    'Ordered by mistake',
    'Delivery taking too long',
    'Other'
  ];

  const handleConfirm = () => {
    const reason = selectedReason === 'Other' ? cancellationReason : selectedReason;
    if (reason.trim()) {
      onConfirm(reason);
      // Reset form
      setCancellationReason('');
      setSelectedReason('');
    }
  };

  const handleClose = () => {
    setCancellationReason('');
    setSelectedReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cancel Order
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to cancel order <span className="font-semibold text-gray-900 dark:text-white">{orderNumber}</span>?
          </p>

          {/* Reason Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for cancellation *
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((reason) => (
                <label key={reason} className="flex items-center">
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    disabled={loading}
                    className="mr-2 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason Input */}
          {selectedReason === 'Other' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Please specify
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                disabled={loading}
                placeholder="Nhập lý do hủy đơn hàng..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Once cancelled, this action cannot be undone. If you've already paid, a refund will be processed according to our refund policy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !selectedReason || (selectedReason === 'Other' && !cancellationReason.trim())}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{loading ? 'Cancelling...' : 'Cancel Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;