import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log("%cAuthContext: login function started.", "color: purple");
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      console.log(
        "%cAuthContext: login service call SUCCEEDED.",
        "color: purple"
      );
      setUser(response.user);
      
      // Trigger cart merge after successful login
      // This will be handled by CartContext useEffect when user changes
      
      return response.user;
    } catch (error) {
      console.log(
        "%cAuthContext: login service call FAILED. Catching error.",
        "color: purple; font-weight: bold;"
      );
      setUser(null);
      console.log(
        "%cAuthContext: Throwing error up to the component.",
        "color: purple;"
      );
      throw error;
    } finally {
      console.log(
        "%cAuthContext: login 'finally' block. Setting loading to false.",
        "color: purple;"
      );
      setLoading(false);
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    setLoading(true);
    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation,
      });
      setUser(response.user);
      
      // Trigger cart merge after successful registration
      // This will be handled by CartContext useEffect when user changes
      
      return response.user;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      // Clear any cart data when logging out
      localStorage.removeItem("cart");
    }
  };

  // Add this getToken function
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Add this hasRole function
  const hasRole = (roles) => {
    if (!user || !user.role) {
      return false;
    }
    
    // If roles is an array, check if user's role is in the array
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    // If roles is a string, check direct match
    return user.role === roles;
  };

  // Add this isAdmin function
  const isAdmin = () => {
    return user && (user.role === 'admin' || user.role === 'mod');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    getToken, // Add this to the exported value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
