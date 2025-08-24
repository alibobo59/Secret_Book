import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AttributeContext = createContext();

export const useAttribute = () => {
  return useContext(AttributeContext);
};

export const AttributeProvider = ({ children }) => {
  const { user } = useAuth();
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = () => {
    const storedAttributes = localStorage.getItem('bookAttributes');
    if (storedAttributes) {
      setAttributes(JSON.parse(storedAttributes));
    } else {
      // Initialize with default attributes
      const defaultAttributes = [
        {
          id: 1,
          name: 'Format',
          type: 'select',
          required: true,
          options: ['Paperback', 'Hardcover', 'eBook', 'Audiobook'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Edition',
          type: 'select',
          required: false,
          options: ['1st Edition', '2nd Edition', 'Special Edition', 'Limited Edition'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          name: 'Language',
          type: 'select',
          required: false,
          options: ['English', 'Spanish', 'French', 'German', 'Italian'],
          createdAt: new Date().toISOString(),
        },
      ];
      setAttributes(defaultAttributes);
      localStorage.setItem('bookAttributes', JSON.stringify(defaultAttributes));
    }
  };

  const createAttribute = async (attributeData) => {
    setLoading(true);
    try {
      const newAttribute = {
        id: Date.now(),
        ...attributeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedAttributes = [...attributes, newAttribute];
      setAttributes(updatedAttributes);
      localStorage.setItem('bookAttributes', JSON.stringify(updatedAttributes));
      
      return newAttribute;
    } catch (error) {
      console.error('Failed to create attribute:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAttribute = async (id, updates) => {
    setLoading(true);
    try {
      const updatedAttributes = attributes.map(attr =>
        attr.id === id ? { ...attr, ...updates, updatedAt: new Date().toISOString() } : attr
      );
      
      setAttributes(updatedAttributes);
      localStorage.setItem('bookAttributes', JSON.stringify(updatedAttributes));
      
      return updatedAttributes.find(attr => attr.id === id);
    } catch (error) {
      console.error('Failed to update attribute:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAttribute = async (id) => {
    setLoading(true);
    try {
      const updatedAttributes = attributes.filter(attr => attr.id !== id);
      setAttributes(updatedAttributes);
      localStorage.setItem('bookAttributes', JSON.stringify(updatedAttributes));
    } catch (error) {
      console.error('Failed to delete attribute:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAttributeById = (id) => {
    return attributes.find(attr => attr.id === id);
  };

  const value = {
    attributes,
    loading,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    getAttributeById,
    refreshAttributes: loadAttributes,
  };

  return (
    <AttributeContext.Provider value={value}>
      {children}
    </AttributeContext.Provider>
  );
};