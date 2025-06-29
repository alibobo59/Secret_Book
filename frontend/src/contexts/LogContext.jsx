import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const LogContext = createContext();

export const useLog = () => {
  return useContext(LogContext);
};

export const LogProvider = ({ children }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load logs from localStorage when component mounts
  useEffect(() => {
    const loadLogs = () => {
      try {
        const storedLogs = localStorage.getItem('systemLogs');
        if (storedLogs) {
          const parsedLogs = JSON.parse(storedLogs);
          setLogs(parsedLogs);
        } else {
          // Initialize with some demo logs
          const demoLogs = generateDemoLogs();
          setLogs(demoLogs);
          localStorage.setItem('systemLogs', JSON.stringify(demoLogs));
        }
      } catch (error) {
        console.error('Failed to load logs from localStorage:', error);
      }
    };

    loadLogs();
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem('systemLogs', JSON.stringify(logs));
    }
  }, [logs]);

  // Generate demo logs for initial data
  const generateDemoLogs = () => {
    const logTypes = ['info', 'warning', 'error', 'success', 'security'];
    const actions = [
      'User login',
      'User logout',
      'Order placed',
      'Order updated',
      'Book added',
      'Book updated',
      'User registered',
      'Password changed',
      'Admin login',
      'System backup',
      'Database update',
      'Security scan',
      'Failed login attempt',
      'Payment processed',
      'Inventory updated',
      'Category created',
      'User deleted',
      'Order cancelled',
      'System maintenance',
      'Email sent'
    ];

    const users = [
      'John Doe',
      'Jane Smith',
      'Admin User',
      'Bob Johnson',
      'Alice Williams',
      'System',
      'Anonymous'
    ];

    const demoLogs = [];
    const now = new Date();

    for (let i = 0; i < 100; i++) {
      const randomDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
      
      demoLogs.push({
        id: Date.now() + i,
        timestamp: randomDate.toISOString(),
        type: randomType,
        action: randomAction,
        user: randomUser,
        userId: randomUser === 'System' ? null : Math.floor(Math.random() * 100) + 1,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: generateLogDetails(randomAction, randomUser),
        module: getModuleFromAction(randomAction),
        severity: getSeverityFromType(randomType),
      });
    }

    return demoLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const generateLogDetails = (action, user) => {
    const details = {
      'User login': `${user} successfully logged into the system`,
      'User logout': `${user} logged out of the system`,
      'Order placed': `New order #ORD-${Math.floor(Math.random() * 10000)} placed by ${user}`,
      'Order updated': `Order status updated to 'shipped' by ${user}`,
      'Book added': `New book "${getRandomBookTitle()}" added to inventory`,
      'Book updated': `Book information updated for "${getRandomBookTitle()}"`,
      'User registered': `New user account created for ${user}`,
      'Password changed': `${user} changed their password`,
      'Admin login': `Administrator ${user} accessed admin dashboard`,
      'System backup': 'Automated system backup completed successfully',
      'Database update': 'Database schema updated to version 2.1.3',
      'Security scan': 'Security vulnerability scan completed',
      'Failed login attempt': `Failed login attempt for user ${user}`,
      'Payment processed': `Payment of $${(Math.random() * 100).toFixed(2)} processed successfully`,
      'Inventory updated': `Stock levels updated for ${Math.floor(Math.random() * 50)} items`,
      'Category created': `New category "${getRandomCategory()}" created`,
      'User deleted': `User account for ${user} was deleted`,
      'Order cancelled': `Order #ORD-${Math.floor(Math.random() * 10000)} cancelled by ${user}`,
      'System maintenance': 'Scheduled system maintenance completed',
      'Email sent': `Notification email sent to ${user}`,
    };

    return details[action] || `${action} performed by ${user}`;
  };

  const getRandomBookTitle = () => {
    const titles = [
      'The Great Gatsby',
      'To Kill a Mockingbird',
      'Pride and Prejudice',
      '1984',
      'The Hobbit',
      'Harry Potter',
      'The Catcher in the Rye',
      'Lord of the Rings'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const getRandomCategory = () => {
    const categories = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Biography'];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  const getModuleFromAction = (action) => {
    if (action.includes('User') || action.includes('login') || action.includes('Password')) return 'Authentication';
    if (action.includes('Order')) return 'Orders';
    if (action.includes('Book') || action.includes('Inventory')) return 'Inventory';
    if (action.includes('Payment')) return 'Payments';
    if (action.includes('System') || action.includes('Database')) return 'System';
    if (action.includes('Security')) return 'Security';
    if (action.includes('Email')) return 'Communications';
    return 'General';
  };

  const getSeverityFromType = (type) => {
    switch (type) {
      case 'error': return 'High';
      case 'warning': return 'Medium';
      case 'security': return 'High';
      case 'success': return 'Low';
      case 'info': return 'Low';
      default: return 'Low';
    }
  };

  // Add new log entry
  const addLog = (logData) => {
    const newLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      user: user?.name || 'System',
      userId: user?.id || null,
      ipAddress: '192.168.1.100', // In real app, get from request
      userAgent: navigator.userAgent,
      severity: getSeverityFromType(logData.type),
      module: logData.module || 'General',
      ...logData,
    };

    setLogs(prevLogs => [newLog, ...prevLogs]);
    return newLog;
  };

  // Log user actions
  const logUserAction = (action, details = '', type = 'info', module = 'General') => {
    return addLog({
      type,
      action,
      details,
      module,
    });
  };

  // Log system events
  const logSystemEvent = (action, details = '', type = 'info') => {
    return addLog({
      type,
      action,
      details,
      user: 'System',
      userId: null,
      module: 'System',
    });
  };

  // Log security events
  const logSecurityEvent = (action, details = '', severity = 'Medium') => {
    return addLog({
      type: 'security',
      action,
      details,
      module: 'Security',
      severity,
    });
  };

  // Get logs with filters
  const getFilteredLogs = (filters = {}) => {
    let filteredLogs = [...logs];

    if (filters.type && filters.type !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.type === filters.type);
    }

    if (filters.module && filters.module !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.module === filters.module);
    }

    if (filters.severity && filters.severity !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }

    if (filters.user && filters.user !== 'all') {
      filteredLogs = filteredLogs.filter(log => 
        log.user.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filters.dateTo)
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(searchTerm) ||
        log.details.toLowerCase().includes(searchTerm) ||
        log.user.toLowerCase().includes(searchTerm)
      );
    }

    return filteredLogs;
  };

  // Clear old logs (keep last N days)
  const clearOldLogs = (daysToKeep = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );

    setLogs(filteredLogs);
    return logs.length - filteredLogs.length; // Return number of deleted logs
  };

  // Export logs
  const exportLogs = (filters = {}, format = 'json') => {
    const logsToExport = getFilteredLogs(filters);
    
    if (format === 'csv') {
      return exportToCSV(logsToExport);
    } else {
      return JSON.stringify(logsToExport, null, 2);
    }
  };

  const exportToCSV = (logs) => {
    const headers = ['Timestamp', 'Type', 'Action', 'User', 'Module', 'Severity', 'IP Address', 'Details'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.type,
        `"${log.action}"`,
        `"${log.user}"`,
        log.module,
        log.severity,
        log.ipAddress,
        `"${log.details}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  };

  // Get log statistics
  const getLogStats = (days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentLogs = logs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );

    const stats = {
      total: recentLogs.length,
      byType: {},
      byModule: {},
      bySeverity: {},
      byDay: {},
    };

    recentLogs.forEach(log => {
      // Count by type
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      
      // Count by module
      stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      
      // Count by day
      const day = new Date(log.timestamp).toDateString();
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    return stats;
  };

  const value = {
    logs,
    loading,
    addLog,
    logUserAction,
    logSystemEvent,
    logSecurityEvent,
    getFilteredLogs,
    clearOldLogs,
    exportLogs,
    getLogStats,
  };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
};