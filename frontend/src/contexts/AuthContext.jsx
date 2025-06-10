import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
}; // AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login({ email, password });
      setUser(response.user);
      return response.user;
    } catch (error) {
      const message = error.message || "Failed to login";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation,
      });
      setUser(response.user);
      return response.user;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to register";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (user) {
        await authService.logout();
      }
      setUser(null);
      setError(null);
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  const getToken = () => localStorage.getItem("token"); // Add token retrieval

  const isAdmin = () => user?.role === "admin";
  const isMod = () => user?.role === "mod";
  const isUser = () => user?.role === "user";
  const hasRole = (roles) =>
    user && Array.isArray(roles) && roles.includes(user.role);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    getToken, // Expose token retrieval
    isAdmin,
    isMod,
    isUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
