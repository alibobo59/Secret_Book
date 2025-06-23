import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    const loadCart = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const addToCart = (book, quantity = 1, selectedVariation = null) => {
    setCartItems(prevItems => {
      // Create unique identifier for cart item (book + variation)
      const itemKey = selectedVariation 
        ? `${book.id}-${selectedVariation.id}`
        : `${book.id}`;
      
      const existingItem = prevItems.find(item => {
        const existingKey = item.selectedVariation 
          ? `${item.book.id}-${item.selectedVariation.id}`
          : `${item.book.id}`;
        return existingKey === itemKey;
      });
      
      if (existingItem) {
        return prevItems.map(item => {
          const existingKey = item.selectedVariation 
            ? `${item.book.id}-${item.selectedVariation.id}`
            : `${item.book.id}`;
          return existingKey === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      } else {
        return [...prevItems, { book, quantity, selectedVariation }];
      }
    });
  };

  const updateQuantity = (bookId, newQuantity, variationId = null) => {
    if (newQuantity <= 0) {
      removeFromCart(bookId, variationId);
      return;
    }
    
    const itemKey = variationId ? `${bookId}-${variationId}` : `${bookId}`;
    
    setCartItems(prevItems =>
      prevItems.map(item => {
        const existingKey = item.selectedVariation 
          ? `${item.book.id}-${item.selectedVariation.id}`
          : `${item.book.id}`;
        return existingKey === itemKey
          ? { ...item, quantity: newQuantity }
          : item;
      })
    );
  };

  const removeFromCart = (bookId, variationId = null) => {
    const itemKey = variationId ? `${bookId}-${variationId}` : `${bookId}`;
    
    setCartItems(prevItems => 
      prevItems.filter(item => {
        const existingKey = item.selectedVariation 
          ? `${item.book.id}-${item.selectedVariation.id}`
          : `${item.book.id}`;
        return existingKey !== itemKey;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.selectedVariation ? item.selectedVariation.price : item.book.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};