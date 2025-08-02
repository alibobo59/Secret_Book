import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import profileService from "../../services/profileService";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Package,
} from "lucide-react";

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();

  // Removed tab functionality - only profile section remains
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [editedUser, setEditedUser] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
  });



  // Fetch profile data and orders on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await profileService.getProfile();
        if (response.success) {
          setProfileData(response.data);
          setEditedUser({
            name: response.data.name || "",
            phone: response.data.phone || "",
            address: response.data.address || "",
            bio: response.data.bio || "",
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải hồ sơ");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(editedUser);
      // Validate required fields
      if (!editedUser.name) {
        setError("Tên là bắt buộc");
        setLoading(false);
        return;
      }

      const response = await profileService.updateProfile(editedUser);
      if (response.success) {
        setProfileData(response.data);
        setIsEditing(false);
        // Show success message (you can add a toast notification here)
      }
    } catch (err) {
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        setError(errorMessages.join(", "));
      } else {
        setError(err.response?.data?.message || "Không thể cập nhật hồ sơ");
      }
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setEditedUser({
        name: profileData.name || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        bio: profileData.bio || "",
      });
    }
    setIsEditing(false);
    setError(null);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="animate-pulse">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex-grow text-center md:text-left">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-48"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-64"></div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </motion.div>
        )}

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profileData?.avatar ? (
                <img
                  src={profileData.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                profileData?.name?.charAt(0) || user?.name?.charAt(0) || "N"
              )}
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {profileData?.name || user?.name || "Tên Người Dùng"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {profileData?.bio || "Chưa có tiểu sử"}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Tham gia{" "}
                  {profileData?.created_at
                    ? new Date(profileData.created_at).toLocaleDateString()
                    : "Không rõ"}
                </div>

              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8">
          <div className="p-6">
            {/* Profile Section */}
            {(
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Thông Tin Cá Nhân
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors">
                      <Edit3 className="h-4 w-4" />
                      Chỉnh Sửa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                        <Save className="h-4 w-4" />
                        Lưu
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                        <X className="h-4 w-4" />
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Họ và Tên <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.name}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, name: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${
                          !editedUser.name
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Nhập họ và tên của bạn"
                        required
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-800 dark:text-gray-200">
                          {editedUser.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Địa Chỉ Email
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-600 rounded-md">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {profileData?.email || "Không có sẵn"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        (Chỉ đọc)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Số Điện Thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedUser.phone}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-800 dark:text-gray-200">
                          {editedUser.phone}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Địa Chỉ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.address}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-800 dark:text-gray-200">
                          {editedUser.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Avatar Upload Section */}
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ảnh Đại Diện
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                        {profileData?.avatar ? (
                          <img
                            src={profileData.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          profileData?.name?.charAt(0) ||
                          user?.name?.charAt(0) ||
                          "N"
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setEditedUser({ ...editedUser, avatar: file });
                            }
                          }}
                          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/20 dark:file:text-amber-400"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          PNG, JPG, GIF tối đa 2MB
                        </p>
                      </div>
                      {profileData?.avatar && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await profileService.deleteAvatar();
                              // Refresh profile data
                              const response =
                                await profileService.getProfile();
                              if (response.success) {
                                setProfileData(response.data);
                              }
                            } catch (err) {
                              setError(
                                err.response?.data?.message ||
                                  "Không thể xóa ảnh đại diện"
                              );
                            }
                          }}
                          className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-sm">
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tiểu Sử
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedUser.bio}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, bio: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span className="text-gray-800 dark:text-gray-200">
                        {editedUser.bio}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
