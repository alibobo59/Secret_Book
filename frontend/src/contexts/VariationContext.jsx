import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const VariationContext = createContext();

export const useVariation = () => {
  return useContext(VariationContext);
};

export const VariationProvider = ({ children }) => {
  const { user } = useAuth();
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVariations();
  }, []);

  const loadVariations = () => {
    const storedVariations = localStorage.getItem('bookVariations');
    if (storedVariations) {
      setVariations(JSON.parse(storedVariations));
    } else {
      // Initialize with demo variations for testing
      const demoVariations = [
        // The Great Gatsby variations
        {
          id: 1,
          bookId: 1,
          name: 'Paperback Edition',
          price: 12.99,
          stock: 15,
          sku: 'B1-PB-001',
          image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
          attributes: {
            Format: 'Paperback',
            Edition: '1st Edition',
            Language: 'English'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          bookId: 1,
          name: 'Hardcover Edition',
          price: 19.99,
          stock: 8,
          sku: 'B1-HC-001',
          image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
          attributes: {
            Format: 'Hardcover',
            Edition: '1st Edition',
            Language: 'English'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
          bookId: 1,
          name: 'eBook Edition',
          price: 9.99,
          stock: 999,
          sku: 'B1-EB-001',
          image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
          attributes: {
            Format: 'eBook',
            Edition: '1st Edition',
            Language: 'English'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // Additional variations for other books...
      ];
      
      setVariations(demoVariations);
      localStorage.setItem('bookVariations', JSON.stringify(demoVariations));
    }
  };

  const createVariation = async (variationData) => {
    setLoading(true);
    try {
      const newVariation = {
        id: Date.now(),
        ...variationData,
        sku: variationData.sku || generateSKU(variationData),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedVariations = [...variations, newVariation];
      setVariations(updatedVariations);
      localStorage.setItem('bookVariations', JSON.stringify(updatedVariations));
      
      return newVariation;
    } catch (error) {
      console.error('Failed to create variation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateVariation = async (id, updates) => {
    setLoading(true);
    try {
      const updatedVariations = variations.map(variation =>
        variation.id === id ? { ...variation, ...updates, updatedAt: new Date().toISOString() } : variation
      );
      
      setVariations(updatedVariations);
      localStorage.setItem('bookVariations', JSON.stringify(updatedVariations));
      
      return updatedVariations.find(variation => variation.id === id);
    } catch (error) {
      console.error('Failed to update variation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteVariation = async (id) => {
    setLoading(true);
    try {
      const updatedVariations = variations.filter(variation => variation.id !== id);
      setVariations(updatedVariations);
      localStorage.setItem('bookVariations', JSON.stringify(updatedVariations));
    } catch (error) {
      console.error('Failed to delete variation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getVariationsByBookId = (bookId) => {
    return variations.filter(variation => variation.bookId === parseInt(bookId));
  };

  const getVariationById = (id) => {
    return variations.find(variation => variation.id === id);
  };

  const generateSKU = (variationData) => {
    const timestamp = Date.now().toString().slice(-6);
    const bookPrefix = variationData.bookId ? `B${variationData.bookId}` : 'BK';
    return `${bookPrefix}-${timestamp}`;
  };

  const bulkCreateVariations = async (bookId, variationsData) => {
    setLoading(true);
    try {
      const newVariations = variationsData.map((variationData, index) => ({
        id: Date.now() + index,
        bookId,
        ...variationData,
        sku: variationData.sku || generateSKU({ ...variationData, bookId }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      const updatedVariations = [...variations, ...newVariations];
      setVariations(updatedVariations);
      localStorage.setItem('bookVariations', JSON.stringify(updatedVariations));
      
      return newVariations;
    } catch (error) {
      console.error('Failed to create variations:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    variations,
    loading,
    createVariation,
    updateVariation,
    deleteVariation,
    getVariationsByBookId,
    getVariationById,
    bulkCreateVariations,
    refreshVariations: loadVariations,
  };

  return (
    <VariationContext.Provider value={value}>
      {children}
    </VariationContext.Provider>
  );
};