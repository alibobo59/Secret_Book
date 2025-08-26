import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import cartService from "../services/cartService";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load cart based on user authentication status
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          // Load from server for authenticated users
          const serverCart = await cartService.getCart();
          setCartItems(serverCart.items || []);
        } else {
          // Load from localStorage for guests
          const storedCart = localStorage.getItem("cart");
          if (storedCart) {
            setCartItems(JSON.parse(storedCart));
          }
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        // Fallback to localStorage if server fails
        if (user) {
          const storedCart = localStorage.getItem("cart");
          if (storedCart) {
            setCartItems(JSON.parse(storedCart));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage for guests only
  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loading, user]);

  // Merge guest cart with user cart after login
  const mergeGuestCart = async () => {
    try {
      const guestCart = localStorage.getItem("cart");
      if (guestCart && user) {
        const guestCartItems = JSON.parse(guestCart);
        if (guestCartItems.length > 0) {
          const mergeResult = await cartService.mergeCart(guestCartItems);
          setCartItems(mergeResult.cart.items || []);
          // Clear guest cart from localStorage after successful merge
          localStorage.removeItem("cart");
        }
      }
    } catch (error) {
      console.error("Failed to merge guest cart:", error);
    }
  };

  const addToCart = async (book, quantity = 1) => {
    try {
      if (user) {
        // Add to server cart
        await cartService.addItem(book.id, quantity);
        // Reload cart from server
        const serverCart = await cartService.getCart();
        setCartItems(serverCart.items || []);
      } else {
        // Add to local cart
        setCartItems((prevItems) => {
          const existingItemIndex = prevItems.findIndex(
            (item) => item.id === book.id
          );

          if (existingItemIndex >= 0) {
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
            };
            return updatedItems;
          } else {
            setSelectedItems((prev) => new Set([...prev, book.id]));
            return [...prevItems, { ...book, quantity }];
          }
        });
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(bookId);
      return;
    }

    try {
      if (user) {
        // Update on server
        await cartService.updateItem(bookId, quantity);
        // Reload cart from server
        const serverCart = await cartService.getCart();
        setCartItems(serverCart.items || []);
      } else {
        // Update local cart
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === bookId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      throw error;
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      if (user) {
        // Remove from server
        await cartService.removeItem(bookId);
        // Reload cart from server
        const serverCart = await cartService.getCart();
        setCartItems(serverCart.items || []);
      } else {
        // Remove from local cart
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== bookId));
      }
      
      // Also remove from selected items
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        // Clear server cart
        await cartService.clearCart();
      } else {
        // Clear local storage
        localStorage.removeItem("cart");
      }
      
      setCartItems([]);
      setSelectedItems(new Set());
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseInt(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Selection functions (unchanged)
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

  const clearSelectedItems = async () => {
    const selectedItemIds = Array.from(selectedItems);
    
    try {
      if (user) {
        // Remove selected items from server
        for (const itemId of selectedItemIds) {
          await cartService.removeItem(itemId);
        }
        // Reload cart from server
        const serverCart = await cartService.getCart();
        setCartItems(serverCart.items || []);
      } else {
        // Remove from local cart
        setCartItems((prevItems) =>
          prevItems.filter((item) => !selectedItemIds.includes(item.id))
        );
      }
      
      setSelectedItems(new Set());
    } catch (error) {
      console.error("Failed to clear selected items:", error);
      throw error;
    }
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
        mergeGuestCart, // Expose merge function
      }}>
      {children}
    </CartContext.Provider>
  );
};
