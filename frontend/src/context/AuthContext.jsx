import React, { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService";

// Create the context
const AuthContext = createContext();

// Create a custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated when the component mounts
    const checkAuth = () => {
      const user = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();

      setCurrentUser(user);
      setIsAuthenticated(isAuth);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setCurrentUser(authService.getCurrentUser());
    setIsAuthenticated(true);
    return response;
  };

  // Register function
  const register = async (userData) => {
    const response = await authService.register(userData);
    setCurrentUser(authService.getCurrentUser());
    setIsAuthenticated(true);
    return response;
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
