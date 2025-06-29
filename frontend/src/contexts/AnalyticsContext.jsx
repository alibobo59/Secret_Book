import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  return useContext(AnalyticsContext);
};

export const AnalyticsProvider = ({ children }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    sales: {},
    users: {},
    inventory: {},
    performance: {},
  });
  const [loading, setLoading] = useState(false);

  // Generate mock analytics data
  const generateAnalyticsData = () => {
    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7);
    }).reverse();

    return {
      sales: {
        totalRevenue: 125430.50,
        totalOrders: 1247,
        averageOrderValue: 100.58,
        conversionRate: 3.2,
        dailySales: last30Days.map(date => ({
          date,
          revenue: Math.floor(Math.random() * 5000) + 1000,
          orders: Math.floor(Math.random() * 50) + 10,
        })),
        monthlySales: last12Months.map(month => ({
          month,
          revenue: Math.floor(Math.random() * 50000) + 20000,
          orders: Math.floor(Math.random() * 500) + 100,
        })),
        topProducts: [
          { id: 1, title: 'The Great Gatsby', sales: 156, revenue: 2028.44 },
          { id: 2, title: 'To Kill a Mockingbird', sales: 134, revenue: 2008.66 },
          { id: 3, title: '1984', sales: 128, revenue: 1789.72 },
          { id: 4, title: 'Pride and Prejudice', sales: 112, revenue: 1230.88 },
          { id: 5, title: 'The Hobbit', sales: 98, revenue: 1567.02 },
        ],
        categoryPerformance: [
          { category: 'Fiction', sales: 450, revenue: 15678.90 },
          { category: 'Fantasy', sales: 320, revenue: 12456.80 },
          { category: 'Romance', sales: 280, revenue: 9876.40 },
          { category: 'Mystery', sales: 197, revenue: 7654.30 },
        ],
      },
      users: {
        totalUsers: 5847,
        activeUsers: 2341,
        newUsers: 156,
        userGrowth: 12.5,
        userRegistrations: last30Days.map(date => ({
          date,
          registrations: Math.floor(Math.random() * 20) + 5,
        })),
        userSegments: [
          { segment: 'New Customers', count: 1234, percentage: 21.1 },
          { segment: 'Returning Customers', count: 2890, percentage: 49.4 },
          { segment: 'VIP Customers', count: 567, percentage: 9.7 },
          { segment: 'Inactive', count: 1156, percentage: 19.8 },
        ],
        topCustomers: [
          { id: 1, name: 'John Doe', orders: 23, spent: 2456.78 },
          { id: 2, name: 'Jane Smith', orders: 19, spent: 2134.56 },
          { id: 3, name: 'Bob Johnson', orders: 17, spent: 1987.43 },
          { id: 4, name: 'Alice Williams', orders: 15, spent: 1765.32 },
          { id: 5, name: 'Charlie Brown', orders: 14, spent: 1654.21 },
        ],
      },
      inventory: {
        totalProducts: 1247,
        lowStockItems: 23,
        outOfStockItems: 8,
        totalValue: 234567.89,
        stockMovement: last30Days.map(date => ({
          date,
          sold: Math.floor(Math.random() * 100) + 20,
          restocked: Math.floor(Math.random() * 50) + 10,
        })),
        categoryStock: [
          { category: 'Fiction', inStock: 456, lowStock: 12, outOfStock: 3 },
          { category: 'Fantasy', inStock: 234, lowStock: 8, outOfStock: 2 },
          { category: 'Romance', inStock: 189, lowStock: 5, outOfStock: 1 },
          { category: 'Mystery', inStock: 167, lowStock: 4, outOfStock: 2 },
        ],
      },
      performance: {
        pageViews: 45678,
        uniqueVisitors: 12345,
        bounceRate: 34.5,
        averageSessionDuration: 245, // seconds
        topPages: [
          { page: '/books', views: 12345, uniqueViews: 8901 },
          { page: '/', views: 9876, uniqueViews: 7654 },
          { page: '/books/1', views: 5432, uniqueViews: 4321 },
          { page: '/checkout', views: 3456, uniqueViews: 2987 },
          { page: '/cart', views: 2345, uniqueViews: 1987 },
        ],
        deviceBreakdown: [
          { device: 'Desktop', percentage: 45.6, sessions: 5678 },
          { device: 'Mobile', percentage: 38.2, sessions: 4756 },
          { device: 'Tablet', percentage: 16.2, sessions: 2019 },
        ],
      },
    };
  };

  useEffect(() => {
    if (user?.isAdmin) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAnalytics(generateAnalyticsData());
        setLoading(false);
      }, 1000);
    }
  }, [user]);

  const refreshAnalytics = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalytics(generateAnalyticsData());
      setLoading(false);
    }, 1000);
  };

  const getDateRangeData = (startDate, endDate, dataType) => {
    // In a real app, this would filter data by date range
    return analytics[dataType] || {};
  };

  const exportAnalytics = (dataType, format = 'csv') => {
    const data = analytics[dataType];
    if (!data) return '';

    if (format === 'csv') {
      // Convert to CSV format
      let csv = '';
      if (dataType === 'sales' && data.dailySales) {
        csv = 'Date,Revenue,Orders\n';
        data.dailySales.forEach(item => {
          csv += `${item.date},${item.revenue},${item.orders}\n`;
        });
      }
      return csv;
    }

    return JSON.stringify(data, null, 2);
  };

  const value = {
    analytics,
    loading,
    refreshAnalytics,
    getDateRangeData,
    exportAnalytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};