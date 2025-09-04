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

  
  // Load giỏ hàng dựa theo trạng thái đăng nhập của người dùng
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          // Người dùng đã đăng nhập → lấy giỏ từ server
          const serverCart = await cartService.getCart();
          setCartItems(serverCart.items || []);
        } else {
          // Người dùng khách → lấy giỏ từ localStorage
          const storedCart = localStorage.getItem("cart");
          if (storedCart) {
            setCartItems(JSON.parse(storedCart));
          }
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        // Nếu server lỗi → fallback về localStorage
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


  // Lưu giỏ hàng vào localStorage cho khách (không đăng nhập)
  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loading, user]);


  // Gộp giỏ của khách với giỏ server sau khi đăng nhập
  const mergeGuestCart = async () => {
    try {
      const guestCart = localStorage.getItem("cart");
      if (guestCart && user) {
        const guestCartItems = JSON.parse(guestCart);
        if (guestCartItems.length > 0) {
          const mergeResult = await cartService.mergeCart(guestCartItems);
          setCartItems(mergeResult.cart.items || []);


          // Xóa giỏ hàng khách trong localStorage sau khi gộp thành công
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

        // Người dùng đã đăng nhập → thêm vào giỏ trên server
        await cartService.addItem(book.id, quantity);

        // Tải lại giỏ từ server
        const serverCart = await cartService.getCart();
        setCartItems(serverCart.items || []);
      } else {

        // Người dùng khách → thêm vào giỏ local
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

        // Người dùng đã đăng nhập → cập nhật số lượng trên server
        await cartService.updateItem(bookId, quantity);

        // Tải lại giỏ từ server
        const serverCart = await cartService.getCart();
        setCartItems(serverCart.items || []);
      } else {

        // Người dùng khách → cập nhật giỏ trong local
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

        // Người dùng đã đăng nhập → xóa trên server
        await cartService.removeItem(bookId);

        // Tải lại giỏ từ server
        const serverCart = await cartService.getCart();
        setCartItems(serverCart.items || []);
      } else {

        // Người dùng khách → xóa khỏi giỏ local
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== bookId));
      }
      
      // Đồng thời xóa khỏi danh sách item được chọn
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

        // Người dùng đã đăng nhập → xóa giỏ hàng trên server
        await cartService.clearCart();
      } else {

        // Người dùng khách → xóa giỏ trong localStorage
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


  // Các hàm chọn sản phẩm
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

        // Người dùng đã đăng nhập → xóa các item đã chọn trên server
        for (const itemId of selectedItemIds) {
          await cartService.removeItem(itemId);
        }


        // Tải lại giỏ từ server
        const serverCart = await cartService.getCart();
        setCartItems(serverCart.items || []);
      } else {

        // Người dùng khách → xóa item đã chọn trong giỏ local
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
        mergeGuestCart, 
        
        // Xuất ra hàm gộp giỏ hàng
      }}>
      {children}
    </CartContext.Provider>
  );
};
