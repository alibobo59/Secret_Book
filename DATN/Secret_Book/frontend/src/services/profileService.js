import { api } from './api';

class ProfileService {
  // Get user profile
  async getProfile() {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      console.log('profileService.updateProfile được gọi với dữ liệu:', profileData);
      
      const formData = new FormData();
      
      // Add text fields (always include required fields: name)
      Object.keys(profileData).forEach(key => {
        if (key !== 'avatar' && key !== 'email') {
          // Always include all fields, let backend handle validation
          // Convert null/undefined to empty string
          const value = profileData[key] !== null && profileData[key] !== undefined ? profileData[key] : '';
          formData.append(key, value);
          console.log(`Đã thêm ${key} vào FormData với giá trị:`, value);
        }
      });
      
      // Add avatar file if present
      if (profileData.avatar instanceof File) {
        formData.append('avatar', profileData.avatar);
        console.log('Đã thêm avatar vào FormData:', profileData.avatar.name);
      } else {
        console.log('Không có avatar file để gửi');
      }
      
      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
      
      formData.append('_method', 'PUT');

      console.log('Gửi POST request đến /profile với _method=PUT và Content-Type: multipart/form-data');
      
      const response = await api.post('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Nhận response từ server:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Update password
  async updatePassword(passwordData) {
    try {
      const response = await api.put('/profile/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Update password error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Delete avatar
  async deleteAvatar() {
    try {
      const response = await api.delete('/profile/avatar');
      return response.data;
    } catch (error) {
      console.error('Delete avatar error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}

export default new ProfileService();