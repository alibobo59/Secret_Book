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
      const formData = new FormData();
      
      // Add text fields (always include required fields: name)
      Object.keys(profileData).forEach(key => {
        if (key !== 'avatar' && key !== 'email' && profileData[key] !== null && profileData[key] !== undefined) {
          // Always include required fields (name) even if empty
          // For optional fields, include even if empty (backend will handle validation)
          formData.append(key, profileData[key] || '');
        }
      });
      
      // Add avatar file if present
      if (profileData.avatar instanceof File) {
        formData.append('avatar', profileData.avatar);
      }
      
      // Debug: Log FormData contents
      console.log('FormData being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await api.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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