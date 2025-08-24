import React, { memo, useMemo } from 'react';
import { BookProvider } from './BookContext';
import { CartProvider } from './CartContext';
import { OrderProvider } from './OrderContext';
import { CouponProvider } from './CouponContext';
import { NotificationProvider } from './NotificationContext';
import { ChangelogProvider } from './ChangelogContext';
import { ToastProvider } from './ToastContext';
import { AttributeProvider } from './AttributeContext';
import { VariationProvider } from './VariationContext';

// Memoized providers to prevent unnecessary re-renders
export const MemoizedBookProvider = memo(BookProvider);
export const MemoizedCartProvider = memo(CartProvider);
export const MemoizedOrderProvider = memo(OrderProvider);
export const MemoizedCouponProvider = memo(CouponProvider);
export const MemoizedNotificationProvider = memo(NotificationProvider);
export const MemoizedChangelogProvider = memo(ChangelogProvider);
export const MemoizedToastProvider = memo(ToastProvider);
export const MemoizedAttributeProvider = memo(AttributeProvider);
export const MemoizedVariationProvider = memo(VariationProvider);

// Optimized context wrapper that uses memoized providers
export const OptimizedContextWrapper = memo(({ children }) => {
  // Memoize the provider tree to prevent unnecessary re-renders
  const providerTree = useMemo(() => (
    <MemoizedNotificationProvider>
      <MemoizedBookProvider>
        <MemoizedCartProvider>
          <MemoizedOrderProvider>
            <MemoizedCouponProvider>
              <MemoizedChangelogProvider>
                <MemoizedToastProvider>
                  <MemoizedAttributeProvider>
                    <MemoizedVariationProvider>
                      {children}
                    </MemoizedVariationProvider>
                  </MemoizedAttributeProvider>
                </MemoizedToastProvider>
              </MemoizedChangelogProvider>
            </MemoizedCouponProvider>
          </MemoizedOrderProvider>
        </MemoizedCartProvider>
      </MemoizedBookProvider>
    </MemoizedNotificationProvider>
  ), [children]);

  return providerTree;
});

OptimizedContextWrapper.displayName = 'OptimizedContextWrapper';