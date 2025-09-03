// frontend/src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import cartService from "../services/cartService";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// helper: sinh key hiển thị/selection cho item local
const localKeyOf = (item) =>
  item.clientKey ||
  item.sku ||
  `fallback_${item.id || item.book_id}_${item.variation_id || ""}`;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Chuẩn hóa cart server -> thêm clientKey cho từng item
  const normalizeServerItems = (serverItems = []) =>
    serverItems.map((it) => ({
      ...it,
      clientKey: it.sku || it.variant_sku || `server_${it.id}`,
    }));

  // Load cart
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          const serverCart = await cartService.getCart();
          const items = normalizeServerItems(serverCart.items || []);
          setCartItems(items);
          setSelectedItems(new Set());
        } else {
          const storedCart = localStorage.getItem("cart");
          if (storedCart) {
            const items = JSON.parse(storedCart).map((it) => ({
              ...it,
              clientKey: localKeyOf(it),
            }));
            setCartItems(items);
            setSelectedItems(new Set());
          }
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        if (user) {
          const storedCart = localStorage.getItem("cart");
          if (storedCart) {
            const items = JSON.parse(storedCart).map((it) => ({
              ...it,
              clientKey: localKeyOf(it),
            }));
            setCartItems(items);
            setSelectedItems(new Set());
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [user]);

  // Save cart local cho guest
  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loading, user]);

  // Merge guest cart sau login
  const mergeGuestCart = async () => {
    try {
      const guestCart = localStorage.getItem("cart");
      if (guestCart && user) {
        const guestCartItems = JSON.parse(guestCart);
        if (guestCartItems.length > 0) {
          const merged = await cartService.mergeCart(guestCartItems);
          const items = normalizeServerItems(merged.items || merged.cart?.items || []);
          setCartItems(items);
          localStorage.removeItem("cart");
        }
      }
    } catch (error) {
      console.error("Failed to merge guest cart:", error);
    }
  };

  // Add to cart
  const addToCart = async (book, quantity = 1) => {
    try {
      if (user) {
        const payload = { book_id: book.id, quantity };
        if (book.variation_id) payload.variation_id = book.variation_id;

        await cartService.addItem(payload.book_id, payload.quantity, payload.variation_id);

        const serverCart = await cartService.getCart();
        const items = normalizeServerItems(serverCart.items || []);
        setCartItems(items);
      } else {
        setCartItems((prev) => {
          const itemKey = book.sku || `fallback_${book.id}_${book.variation_id || ""}`;
          const idx = prev.findIndex(
            (item) => localKeyOf(item) === itemKey
          );
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
            return updated;
          }
          const cartItem = {
            ...book,
            quantity,
            sku: itemKey,
            clientKey: itemKey,
          };
          return [...prev, cartItem];
        });
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  // Update quantity
  const updateQuantity = async (itemKey, quantity) => {
    if (quantity <= 0) return await removeFromCart(itemKey);

    try {
      if (user) {
        const item = cartItems.find((i) => (i.clientKey || i.sku) === itemKey);
        if (!item) throw new Error("Cart item not found in state");
        await cartService.updateItem(item.id, quantity); // dùng cartItemId

        const serverCart = await cartService.getCart();
        const items = normalizeServerItems(serverCart.items || []);
        setCartItems(items);
      } else {
        setCartItems((prev) =>
          prev.map((i) =>
            (i.clientKey || i.sku) === itemKey ? { ...i, quantity } : i
          )
        );
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      throw error;
    }
  };

  // Remove single
  const removeFromCart = async (itemKey) => {
    try {
      if (user) {
        const item = cartItems.find((i) => (i.clientKey || i.sku) === itemKey);
        if (!item) throw new Error("Cart item not found in state");
        await cartService.removeItem(item.id); // dùng cartItemId

        const serverCart = await cartService.getCart();
        const items = normalizeServerItems(serverCart.items || []);
        setCartItems(items);
      } else {
        setCartItems((prev) => prev.filter((i) => (i.clientKey || i.sku) !== itemKey));
      }

      setSelectedItems((prev) => {
        const ns = new Set(prev);
        ns.delete(itemKey);
        return ns;
      });
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  // Remove many
  const removeItemsFromCart = async (itemKeys) => {
    try {
      if (user) {
        // map clientKey -> cartItemId
        const ids = cartItems
          .filter((i) => itemKeys.includes(i.clientKey || i.sku))
          .map((i) => i.id);

        await cartService.removeItems(ids);

        const serverCart = await cartService.getCart();
        const items = normalizeServerItems(serverCart.items || []);
        setCartItems(items);
      } else {
        setCartItems((prev) => prev.filter((i) => !itemKeys.includes(i.clientKey || i.sku)));
      }

      setSelectedItems((prev) => {
        const ns = new Set(prev);
        itemKeys.forEach((k) => ns.delete(k));
        return ns;
      });
    } catch (error) {
      console.error("Failed to remove items from cart:", error);
      throw error;
    }
  };

  // Clear all
  const clearCart = async () => {
    try {
      if (user) {
        await cartService.clearCart();
      } else {
        localStorage.removeItem("cart");
      }
      setCartItems([]);
      setSelectedItems(new Set());
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  };

  const getCartTotal = () =>
    cartItems.reduce((total, item) => {
      const price = parseInt(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);

  const getItemCount = () =>
    cartItems.reduce((count, item) => count + (parseInt(item.quantity) || 0), 0);

  // Selection
  const toggleItemSelection = (clientKey) => {
    setSelectedItems((prev) => {
      const ns = new Set(prev);
      ns.has(clientKey) ? ns.delete(clientKey) : ns.add(clientKey);
      return ns;
    });
  };

  const selectAllItems = () => {
    const keys = cartItems.map((i) => i.clientKey || i.sku || localKeyOf(i));
    setSelectedItems(new Set(keys));
  };

  const deselectAllItems = () => setSelectedItems(new Set());

  const getSelectedItems = () =>
    cartItems.filter((i) => selectedItems.has(i.clientKey || i.sku || localKeyOf(i)));

  const getSelectedTotal = () =>
    getSelectedItems().reduce((total, item) => {
      const price = parseInt(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);

  const getSelectedItemsCount = () => selectedItems.size;

  const clearSelectedItems = async () => {
    const keys = Array.from(selectedItems);
    try {
      if (user) {
        const ids = cartItems
          .filter((i) => keys.includes(i.clientKey || i.sku || localKeyOf(i)))
          .map((i) => i.id);
        for (const id of ids) await cartService.removeItem(id);

        const serverCart = await cartService.getCart();
        const items = normalizeServerItems(serverCart.items || []);
        setCartItems(items);
      } else {
        setCartItems((prev) => prev.filter((i) => !keys.includes(i.clientKey || i.sku || localKeyOf(i))));
      }
      setSelectedItems(new Set());
    } catch (error) {
      console.error("Failed to clear selected items:", error);
      throw error;
    }
  };

  // UI-only: apply stock hints for items (used when server returns OUT_OF_STOCK conflicts)
  const applyStockHints = (hints = []) => {
    if (!Array.isArray(hints) || hints.length === 0) return;
    setCartItems((prev) =>
      prev.map((i) => {
        const match = hints.find((h) => {
          const hBook = h.book_id ?? h.id;
          const hVar = h.variation_id ?? h.variant_id ?? h.variation?.id ?? null;
          const iBook = i.book_id ?? i.id;
          const iVar = i.variation_id ?? null;
          return String(hBook) === String(iBook) && String(hVar ?? '') === String(iVar ?? '');
        });
        if (match) {
          const availableRaw = match.available ?? match.stock_available ?? match.stock_quantity ?? match.stock ?? 0;
          const available = parseInt(availableRaw) || 0;
          return { ...i, stock_quantity: available, stock: available };
        }
        return i;
      })
    );
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
        removeItemsFromCart,
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
        mergeGuestCart,
        applyStockHints,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
