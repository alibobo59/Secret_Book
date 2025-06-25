import { api, fetchCsrfToken } from "./api.js";

const authService = {
  register: async (userData) => {
    try {
      console.log("Attempting to fetch CSRF token...");
      const success = await fetchCsrfToken();
      if (!success) {
        throw new Error("Failed to fetch CSRF token");
      }
      console.log(
        "CSRF token fetched successfully, sending register request:",
        userData
      );
      const response = await api.post("/register", userData);

      console.log("posting register");
      console.log("Register response:", response.data);
      const { user, token } = response.data;
      if (token) {
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
      console.log("Sending login request:", credentials);
      const response = await api.post("/login", credentials);
      console.log("Login response:", response.data);
      const { user, token } = response.data;
      if (token) {
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
        console.log("Sending logout request...");
        await api.post("/logout");
        console.log("Logout successful");
      }
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
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
      console.error("Error parsing user:", error);
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default authService;
