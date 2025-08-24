import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ChangelogContext = createContext();

export const useChangelog = () => {
  return useContext(ChangelogContext);
};

export const ChangelogProvider = ({ children }) => {
  const { user } = useAuth();
  const [changelogs, setChangelogs] = useState([]);

  // Load changelogs from localStorage
  useEffect(() => {
    const storedChangelogs = localStorage.getItem('changelogs');
    if (storedChangelogs) {
      setChangelogs(JSON.parse(storedChangelogs));
    }
  }, []);

  // Save changelogs to localStorage
  useEffect(() => {
    localStorage.setItem('changelogs', JSON.stringify(changelogs));
  }, [changelogs]);

  const addChangelogEntry = (entityType, entityId, action, changes, oldData = null, newData = null) => {
    const entry = {
      id: Date.now() + Math.random(),
      entityType, // 'book', 'category', 'author', 'user', etc.
      entityId,
      action, // 'create', 'update', 'delete', 'publish', 'unpublish'
      changes, // Description of what changed
      oldData, // Previous state (for updates)
      newData, // New state (for creates/updates)
      userId: user?.id,
      userName: user?.name || 'System',
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100', // In real app, get from request
      userAgent: navigator.userAgent,
    };

    setChangelogs(prev => [entry, ...prev]);
    return entry;
  };

  const getChangelogForEntity = (entityType, entityId) => {
    return changelogs.filter(
      entry => entry.entityType === entityType && entry.entityId === entityId
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getChangelogByType = (entityType) => {
    return changelogs.filter(entry => entry.entityType === entityType)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getAllChangelogs = () => {
    return changelogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const clearOldChangelogs = (daysToKeep = 90) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filteredChangelogs = changelogs.filter(entry => 
      new Date(entry.timestamp) >= cutoffDate
    );

    setChangelogs(filteredChangelogs);
    return changelogs.length - filteredChangelogs.length;
  };

  const value = {
    changelogs,
    addChangelogEntry,
    getChangelogForEntity,
    getChangelogByType,
    getAllChangelogs,
    clearOldChangelogs,
  };

  return (
    <ChangelogContext.Provider value={value}>
      {children}
    </ChangelogContext.Provider>
  );
};