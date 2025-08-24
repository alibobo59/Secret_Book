import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const { user } = useAuth();
  const [securityLogs, setSecurityLogs] = useState([]);
  const [securitySettings, setSecuritySettings] = useState({});
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = () => {
    // Load security logs
    const storedLogs = localStorage.getItem('securityLogs');
    if (storedLogs) {
      setSecurityLogs(JSON.parse(storedLogs));
    } else {
      const demoLogs = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          type: 'login_attempt',
          severity: 'info',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          details: 'Successful login',
          userId: user?.id,
          status: 'success'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'failed_login',
          severity: 'warning',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          details: 'Failed login attempt - invalid password',
          userId: null,
          status: 'blocked'
        }
      ];
      setSecurityLogs(demoLogs);
      localStorage.setItem('securityLogs', JSON.stringify(demoLogs));
    }

    // Load security settings
    const storedSettings = localStorage.getItem('securitySettings');
    if (storedSettings) {
      setSecuritySettings(JSON.parse(storedSettings));
    } else {
      const defaultSettings = {
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        passwordMinLength: 8,
        requireSpecialChars: true,
        sessionTimeout: 60,
        enableTwoFactor: false,
        ipWhitelist: [],
        ipBlacklist: []
      };
      setSecuritySettings(defaultSettings);
      localStorage.setItem('securitySettings', JSON.stringify(defaultSettings));
    }

    // Load threats
    const storedThreats = localStorage.getItem('securityThreats');
    if (storedThreats) {
      setThreats(JSON.parse(storedThreats));
    } else {
      const demoThreats = [
        {
          id: 1,
          type: 'brute_force',
          severity: 'high',
          ipAddress: '192.168.1.101',
          description: 'Multiple failed login attempts',
          detectedAt: new Date().toISOString(),
          status: 'active',
          attempts: 8
        }
      ];
      setThreats(demoThreats);
      localStorage.setItem('securityThreats', JSON.stringify(demoThreats));
    }
  };

  const updateSecuritySettings = (newSettings) => {
    const updatedSettings = { ...securitySettings, ...newSettings };
    setSecuritySettings(updatedSettings);
    localStorage.setItem('securitySettings', JSON.stringify(updatedSettings));
  };

  const blockIpAddress = (ipAddress, reason = 'Manual block') => {
    const updatedSettings = {
      ...securitySettings,
      ipBlacklist: [...securitySettings.ipBlacklist, { ip: ipAddress, reason, blockedAt: new Date().toISOString() }]
    };
    setSecuritySettings(updatedSettings);
    localStorage.setItem('securitySettings', JSON.stringify(updatedSettings));
  };

  const unblockIpAddress = (ipAddress) => {
    const updatedSettings = {
      ...securitySettings,
      ipBlacklist: securitySettings.ipBlacklist.filter(item => item.ip !== ipAddress)
    };
    setSecuritySettings(updatedSettings);
    localStorage.setItem('securitySettings', JSON.stringify(updatedSettings));
  };

  const resolveSecurityIncident = (threatId) => {
    const updatedThreats = threats.map(threat =>
      threat.id === threatId ? { ...threat, status: 'resolved', resolvedAt: new Date().toISOString() } : threat
    );
    setThreats(updatedThreats);
    localStorage.setItem('securityThreats', JSON.stringify(updatedThreats));
  };

  const getSecurityMetrics = () => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = securityLogs.filter(log => new Date(log.timestamp) >= last24Hours);
    
    return {
      totalLogs: securityLogs.length,
      recentLogs: recentLogs.length,
      failedLogins: recentLogs.filter(log => log.type === 'failed_login').length,
      successfulLogins: recentLogs.filter(log => log.type === 'login_attempt' && log.status === 'success').length,
      activeThreats: threats.filter(threat => threat.status === 'active').length,
      blockedIPs: securitySettings.ipBlacklist?.length || 0
    };
  };

  const exportSecurityReport = (format = 'json') => {
    const report = {
      generatedAt: new Date().toISOString(),
      metrics: getSecurityMetrics(),
      recentLogs: securityLogs.slice(0, 50),
      threats: threats,
      settings: securitySettings,
    };

    if (format === 'csv') {
      let csv = 'Timestamp,Type,Severity,IP Address,Details,Status\n';
      securityLogs.forEach(log => {
        csv += `${log.timestamp},${log.type},${log.severity},${log.ipAddress},"${log.details}",${log.status}\n`;
      });
      return csv;
    }

    return JSON.stringify(report, null, 2);
  };

  const runSecurityScan = async () => {
    setLoading(true);
    
    // Simulate security scan
    return new Promise((resolve) => {
      setTimeout(() => {
        const scanResults = {
          vulnerabilities: Math.floor(Math.random() * 5),
          warnings: Math.floor(Math.random() * 10) + 5,
          recommendations: [
            'Update SSL certificates',
            'Enable two-factor authentication',
            'Review user permissions',
            'Update security policies',
          ],
          score: Math.floor(Math.random() * 20) + 80, // 80-100
        };
        setLoading(false);
        resolve(scanResults);
      }, 3000);
    });
  };

  const value = {
    securityLogs,
    securitySettings,
    threats,
    loading,
    updateSecuritySettings,
    blockIpAddress,
    unblockIpAddress,
    resolveSecurityIncident,
    getSecurityMetrics,
    exportSecurityReport,
    runSecurityScan,
    refreshData: loadSecurityData,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};