import { api, fetchCsrfToken } from "./api.js";

const authService = {
  register: async (userData) => {
    try {
      await fetchCsrfToken(); // Ensure CSRF token is set
      const response = await api.post("/register", userData);
      const { user, token } = response.data;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      return { user, token };
    } catch (error) {
      console.error("Register error:", {
        message: error.response?.data?.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      // Preserve the original error structure for detailed handling
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/login", credentials);
      const { user, token } = response.data;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      return { user, token };
    } catch (error) {
      console.error("Login error:", {
        message: error.response?.data?.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      // Preserve the original error structure for detailed handling
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await api.post("/logout");
      }
    } catch (error) {
      console.error("Logout API error:", error.response?.data || error.message);
      // We still proceed to clear local storage even if API call fails
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", {
        message: error.response?.data?.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  resetPassword: async (resetData) => {
    try {
      const response = await api.post("/reset-password", resetData);
      return response.data;
    } catch (error) {
      console.error("Reset password error:", {
        message: error.response?.data?.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};

export default authService;
