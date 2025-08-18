// frontend/src/contexts/CartContext.jsx

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
          const items = serverCart.items || [];
          setCartItems(items);
          // Create unique keys for items with variations
          const itemKeys = items.map(item => {
            return item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
          });
          setSelectedItems(new Set(itemKeys));
        } else {
          // Load from localStorage for guests
          const storedCart = localStorage.getItem("cart");
          if (storedCart) {
            const items = JSON.parse(storedCart);
            setCartItems(items);
            // Create unique keys for items with variations
            const itemKeys = items.map(item => {
              return item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
            });
            setSelectedItems(new Set(itemKeys));
          }
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        // Fallback to localStorage if server fails
        if (user) {
          const storedCart = localStorage.getItem("cart");
          if (storedCart) {
            const items = JSON.parse(storedCart);
            setCartItems(items);
            // Create unique keys for items with variations
            const itemKeys = items.map(item => {
              return item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
            });
            setSelectedItems(new Set(itemKeys));
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
        // Add to server cart with variation support
        const itemData = {
          book_id: book.id,
          quantity: quantity
        };
        
        // Add variation_id if it exists
        if (book.variation_id) {
          itemData.variation_id = book.variation_id;
        }
        
        await cartService.addItem(itemData.book_id, itemData.quantity, itemData.variation_id);
        // Reload cart from server
        const serverCart = await cartService.getCart();
        const items = serverCart.items || [];
        setCartItems(items);
        // Update selectedItems with unique keys
        const itemKeys = items.map(item => {
          return item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
        });
        setSelectedItems(new Set(itemKeys));
      } else {
        // Add to local cart with variation support
        setCartItems((prevItems) => {
          // Create unique identifier for cart item (book_id + variation_id)
          const itemKey = book.variation_id ? `${book.id}_${book.variation_id}` : book.id.toString();
          
          const existingItemIndex = prevItems.findIndex(
            (item) => {
              const existingKey = item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
              return existingKey === itemKey;
            }
          );

          if (existingItemIndex >= 0) {
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
            };
            return updatedItems;
          } else {
            const cartItem = {
              ...book,
              quantity,
              cart_item_key: itemKey // Add unique key for identification
            };
            
            setSelectedItems((prev) => new Set([...prev, itemKey]));
            return [...prevItems, cartItem];
          }
        });
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (itemKey, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemKey);
      return;
    }

    try {
      if (user) {
        // Update on server - use itemKey directly
        await cartService.updateItem(itemKey, quantity);
        // Reload cart from server
        const serverCart = await cartService.getCart();
        const items = serverCart.items || [];
        setCartItems(items);
        // Update selectedItems with unique keys
        const itemKeys = items.map(item => {
          return item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
        });
        setSelectedItems(new Set(itemKeys));
      } else {
        // Update local cart - match by itemKey
        setCartItems((prevItems) =>
          prevItems.map((item) => {
            const currentItemKey = item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
            return currentItemKey === itemKey ? { ...item, quantity } : item;
          })
        );
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemKey) => {
    try {
      if (user) {
        // Remove from server - use itemKey directly
        await cartService.removeItem(itemKey);
        // Reload cart from server
        const serverCart = await cartService.getCart();
        setCartItems(serverCart.items || []);
      } else {
        // Remove from local cart - match by itemKey
        setCartItems((prevItems) => prevItems.filter((item) => {
          const currentItemKey = item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
          return currentItemKey !== itemKey;
        }));
      }
      
      // Also remove from selected items
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  const removeItemsFromCart = async (itemKeys) => {
    console.log('🔍 removeItemsFromCart called with itemKeys:', itemKeys);
    console.log('🛒 Current cart items before removal:', cartItems.map(item => ({ id: item.id, title: item.title, variation_id: item.variation_id })));
    console.log('✅ Current selected items:', Array.from(selectedItems));
    
    try {
      if (user) {
        console.log('👤 User authenticated, calling cartService.removeItems with:', itemKeys);
        await cartService.removeItems(itemKeys);
        // Reload cart from server to ensure consistency
        const serverCart = await cartService.getCart();
        console.log('📦 Server cart after removal:', serverCart.items?.map(item => ({ id: item.id, title: item.title, variation_id: item.variation_id })));
        setCartItems(serverCart.items || []);
      } else {
        console.log('👤 Guest user, filtering local cart');
        // For guests, filter items from local state by matching itemKeys
        setCartItems((prevItems) =>
          prevItems.filter((item) => {
            const currentItemKey = item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
            return !itemKeys.includes(currentItemKey);
          })
        );
      }

      // Update selected items
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        itemKeys.forEach((key) => newSet.delete(key));
        console.log('✅ Updated selected items after removal:', Array.from(newSet));
        return newSet;
      });
    } catch (error) {
      console.error("Failed to remove items from cart:", error);
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
    const itemKeys = cartItems.map((item) => {
      return item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
    });
    setSelectedItems(new Set(itemKeys));
  };

  const deselectAllItems = () => {
    setSelectedItems(new Set());
  };

  const getSelectedItems = () => {
    return cartItems.filter((item) => {
      const itemKey = item.variation_id ? `${item.book_id}_${item.variation_id}` : item.book_id.toString();
      return selectedItems.has(itemKey);
    });
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
          prevItems.filter((item) => !selectedItemIds.includes(item.book_id))
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
        removeItemsFromCart, // Use this instead of clearCart for specific items
    clearCart, // Keep for clearing the whole cart if needed
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
