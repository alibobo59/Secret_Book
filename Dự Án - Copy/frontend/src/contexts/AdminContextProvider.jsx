import React, { lazy, Suspense } from 'react';
import { useAuth } from './AuthContext';

// Lazy load admin-only contexts
const UserManagementProvider = lazy(() => 
  import('./UserManagementContext').then(module => ({ 
    default: module.UserManagementProvider 
  }))
);

const AnalyticsProvider = lazy(() => 
  import('./AnalyticsContext').then(module => ({ 
    default: module.AnalyticsProvider 
  }))
);

const ReviewManagementProvider = lazy(() => 
  import('./ReviewManagementContext').then(module => ({ 
    default: module.ReviewManagementProvider 
  }))
);

const OrderManagementProvider = lazy(() => 
  import('./OrderManagementContext').then(module => ({ 
    default: module.OrderManagementProvider 
  }))
);

// Loading fallback component
const AdminContextLoading = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-600"></div>
  </div>
);

// Admin Context Provider that conditionally loads admin contexts
export const AdminContextProvider = ({ children }) => {
  const { user, hasRole } = useAuth();

  // Only load admin contexts if user is admin or mod
  const isAdminUser = user && hasRole(['admin', 'mod']);

  if (!isAdminUser) {
    // For non-admin users, just return children without admin contexts
    return children;
  }

  // For admin users, load all admin contexts with lazy loading
  return (
    <Suspense fallback={<AdminContextLoading />}>
      <UserManagementProvider>
        <ReviewManagementProvider>
          <OrderManagementProvider>
            <AnalyticsProvider>
              {children}
            </AnalyticsProvider>
          </OrderManagementProvider>
        </ReviewManagementProvider>
      </UserManagementProvider>
    </Suspense>
  );
};

export default AdminContextProvider;