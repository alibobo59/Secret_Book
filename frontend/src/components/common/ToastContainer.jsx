import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import Toast from './Toast';

const ToastContainer = () => {
  const toastContext = useToast();
  
  // Return null if toast context is not available
  if (!toastContext) {
    return null;
  }

  const { toasts, removeToast } = toastContext;

  // Create portal to render toasts outside the normal component tree
  const toastRoot = document.getElementById('toast-root') || document.body;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 30
              }
            }}
            exit={{ 
              opacity: 0, 
              x: 300, 
              scale: 0.9,
              transition: { duration: 0.3 }
            }}
            className="pointer-events-auto"
            style={{ zIndex: 9999 - index }}
          >
            <Toast toast={toast} onRemove={removeToast} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    toastRoot
  );
};

export default ToastContainer;