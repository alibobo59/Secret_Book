import React, { useState, useEffect } from "react";
import { useUserManagement } from "../../contexts/UserManagementContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Shield,
  UserCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const { user, hasRole } = useAuth();
  const {
    loading,
    error,
    users,
    userStats,
    getAllUsers,
    toggleUserStatus,
    updateUser,
    deleteUser,
    updateUserRole,
    getUserStats,
    clearError,
  } = useUserManagement();

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    role: "",
    page: 1,
    per_page: 15,
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [newRole, setNewRole] = useState("");
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    // console.log("Current user:", user);
    // console.log("Has admin role:", hasRole(["admin"]));
    console.log("useEffect at admin");
    if (user && hasRole(["admin"])) {
      loadUsers();
      loadUserStats();
    }
  }, [user, filters]);

  const loadUsers = async () => {
    try {
      const response = await getAllUsers(filters);
      console.log(response, "this is from usermanagement");
      if (response.data) {
        setPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
        });
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  const loadUserStats = async () => {
    try {
      await getUserStats();
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadUsers();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleToggleStatus = async () => {
    try {
      await toggleUserStatus(selectedUser.id, lockReason);
      setShowStatusModal(false);
      setSelectedUser(null);
      setLockReason("");
      toast.success(
        selectedUser.is_active
          ? "Tài khoản đã được khóa thành công"
          : "Tài khoản đã được mở khóa thành công"
      );
      loadUsers();
      loadUserStats();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Không thể thay đổi trạng thái tài khoản");
    }
  };

  const handleUpdateRole = async () => {
    try {
      await updateUserRole(selectedUser.id, newRole);
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole("");
      toast.success("Vai trò đã được cập nhật thành công");
      loadUsers();
      loadUserStats();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Không thể cập nhật vai trò");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success("Người dùng đã được xóa thành công");
      loadUsers();
      loadUserStats();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Không thể xóa người dùng");
    }
  };

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setShowStatusModal(true);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "mod":
        return "Điều hành viên";
      case "user":
        return "Người dùng";
      default:
        return "Không xác định";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "mod":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (!user || !hasRole(["admin"])) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">
          Bạn không có quyền truy cập tính năng này.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-amber-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Quản lý Người dùng
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Quản lý tài khoản và phân quyền người dùng
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* User Statistics */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Tổng người dùng
              </h3>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                {userStats.total_users || 0}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400">
                Đang hoạt động
              </h3>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                {userStats.active_users || 0}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                Bị khóa
              </h3>
              <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                {userStats.inactive_users || 0}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Người dùng mới
              </h3>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                {userStats.new_users_this_month || 0}
              </p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-gray-200">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Bị khóa</option>
            </select>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-gray-200">
              <option value="">Tất cả vai trò</option>
              <option value="user">Người dùng</option>
              <option value="mod">Điều hành viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center space-x-2">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Tìm kiếm</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({
                  search: "",
                  status: "",
                  role: "",
                  page: 1,
                  per_page: 15,
                });
                loadUsers();
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center justify-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        </form>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-amber-600"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate max-w-[150px]">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200 truncate max-w-[200px]">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                          user.role
                        )}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                        {user.is_active ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openRoleModal(user)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Thay đổi vai trò">
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStatusModal(user)}
                          className={`${
                            user.is_active
                              ? "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              : "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          }`}
                          title={
                            user.is_active
                              ? "Khóa tài khoản"
                              : "Mở khóa tài khoản"
                          }>
                          {user.is_active ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Xóa người dùng">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị {(pagination.current_page - 1) * pagination.per_page + 1}{" "}
              đến{" "}
              {Math.min(
                pagination.current_page * pagination.per_page,
                pagination.total
              )}{" "}
              trong tổng số {pagination.total} người dùng
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from(
                { length: Math.min(5, pagination.last_page) },
                (_, i) => {
                  const page = i + Math.max(1, pagination.current_page - 2);
                  if (page > pagination.last_page) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded-md ${
                        page === pagination.current_page
                          ? "bg-amber-600 text-white border-amber-600"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}>
                      {page}
                    </button>
                  );
                }
              )}

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Toggle Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">
                {selectedUser.is_active
                  ? "Khóa tài khoản"
                  : "Mở khóa tài khoản"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Bạn có chắc chắn muốn{" "}
                {selectedUser.is_active ? "khóa" : "mở khóa"} tài khoản của{" "}
                <strong>{selectedUser.name}</strong>?
              </p>
              {selectedUser.is_active && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lý do khóa tài khoản:
                  </label>
                  <textarea
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-gray-200"
                    rows="3"
                    placeholder="Nhập lý do khóa tài khoản..."
                  />
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedUser(null);
                    setLockReason("");
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500">
                  Hủy
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                    selectedUser.is_active
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}>
                  {loading
                    ? "Đang xử lý..."
                    : selectedUser.is_active
                    ? "Khóa tài khoản"
                    : "Mở khóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Update Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">
                Thay đổi vai trò
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Thay đổi vai trò cho <strong>{selectedUser.name}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vai trò mới:
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-gray-200">
                  <option value="user">Người dùng</option>
                  <option value="mod">Điều hành viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setNewRole("");
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500">
                  Hủy
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={loading || newRole === selectedUser.role}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">
                  {loading ? "Đang cập nhật..." : "Cập nhật vai trò"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">
                Xóa người dùng
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Bạn có chắc chắn muốn xóa tài khoản của{" "}
                <strong>{selectedUser.name}</strong>?
                <br />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Hành động này không thể hoàn tác!
                </span>
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500">
                  Hủy
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
                  {loading ? "Đang xóa..." : "Xóa người dùng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
