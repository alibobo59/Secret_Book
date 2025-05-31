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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load cart khi user thay đổi
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          const serverCart = await cartService.getCart();
          setCartItems(serverCart.items || []);
        } else {
          const storedCart = localStorage.getItem("cart");
          if (storedCart) {
            setCartItems(JSON.parse(storedCart));
          }
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        // fallback về localStorage
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

  // Lưu cart vào localStorage khi là guest
  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loading, user]);

  return (
    <CartContext.Provider value={{ cartItems, loading, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
};
