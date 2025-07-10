import { api } from "./api.js";

const userService = {
  // Get all users (Admin only)
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get("/admin/users", { params });
      // console.log('userService - Full axios response:', response);
      // console.log('userService - response.data:', response.data);
      // console.log('userService - response.data.data:', response.data?.data);
      return response.data;
    } catch (error) {
      console.error("Get users error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get user by ID (Admin only)
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get user error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Toggle user active status (Admin only)
  toggleUserStatus: async (id, reason = "") => {
    try {
      const response = await api.patch(`/admin/users/${id}/toggle-status`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Toggle user status error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Update user (Admin only)
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(
        "Update user error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Delete user (Admin only)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        "Delete user error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get user statistics (Admin only)
  getUserStats: async () => {
    try {
      const response = await api.get("/admin/users/stats");
      return response.data;
    } catch (error) {
      console.error(
        "Get user stats error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Update user role (Admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, { role });
      return response.data;
    } catch (error) {
      console.error(
        "Update user role error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default userService;
