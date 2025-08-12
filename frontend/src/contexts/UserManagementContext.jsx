import React, { createContext, useContext, useState } from "react";
import { userService } from "../services";

const UserManagementContext = createContext();

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error(
      "useUserManagement must be used within a UserManagementProvider"
    );
  }
  return context;
};

export const UserManagementProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);

  // Get all users with filters
  const getAllUsers = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getAllUsers(params);
      console.log(params, "day la params");
      // console.log('API Response:', response);
      // console.log('Users data:', response.data);
      // console.log('Response type:', typeof response);
      // console.log('Response keys:', Object.keys(response || {}));
      console.log(response);
      setUsers(response.data || []);
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi tải danh sách người dùng";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get user by ID
  const getUserById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUserById(id);
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi tải thông tin người dùng";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status (lock/unlock account)
  const toggleUserStatus = async (id, reason = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.toggleUserStatus(id, reason);

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, is_active: !user.is_active } : user
        )
      );

      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi thay đổi trạng thái tài khoản";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user information
  const updateUser = async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.updateUser(id, userData);

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, ...response.user } : user
        )
      );

      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi cập nhật thông tin người dùng";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.deleteUser(id);

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa người dùng";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.updateUserRole(userId, role);

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, role } : user))
      );

      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi cập nhật vai trò người dùng";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get user statistics
  const getUserStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUserStats();
      setUserStats(response.data || response);
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi tải thống kê người dùng";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    loading,
    error,
    users,
    userStats,
    getAllUsers,
    getUserById,
    toggleUserStatus,
    updateUser,
    deleteUser,
    updateUserRole,
    getUserStats,
    clearError,
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};

export default UserManagementContext;
