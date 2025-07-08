// frontend/src/contexts/CartContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    const loadCart = () => {
      try {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const addToCart = (book, quantity = 1) => {
    setCartItems((prevItems) => {
      // Check if the item is already in the cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === book.id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if the item is already in the cart
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Add new item to cart and automatically select it
        setSelectedItems((prev) => new Set([...prev, book.id]));
        return [...prevItems, { ...book, quantity }];
      }
    });
  };

  const updateQuantity = (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === bookId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (bookId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== bookId));
    // Also remove from selected items
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(bookId);
      return newSet;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedItems(new Set());
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Keep price as integer (cents)
      const price = parseInt(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Selection functions
  const toggleItemSelection = (itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    setSelectedItems(new Set(cartItems.map((item) => item.id)));
  };

  const deselectAllItems = () => {
    setSelectedItems(new Set());
  };

  const getSelectedItems = () => {
    return cartItems.filter((item) => selectedItems.has(item.id));
  };

  const getSelectedTotal = () => {
    return getSelectedItems().reduce((total, item) => {
      const price = parseInt(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  };

  const getSelectedItemsCount = () => {
    return selectedItems.size;
  };

  const clearSelectedItems = () => {
    const selectedItemIds = Array.from(selectedItems);
    setCartItems((prevItems) =>
      prevItems.filter((item) => !selectedItemIds.includes(item.id))
    );
    setSelectedItems(new Set());
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getItemCount,
        toggleItemSelection,
        selectAllItems,
        deselectAllItems,
        getSelectedItems,
        getSelectedTotal,
        getSelectedItemsCount,
        clearSelectedItems,
      }}>
      {children}
    </CartContext.Provider>
  );
};
