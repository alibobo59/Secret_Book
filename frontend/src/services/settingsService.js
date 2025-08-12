import { api } from './api';

class SettingsService {
  async getShippingSettings() {
    try {
      const response = await api.get('/admin/settings/shipping');
      return response.data;
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
      // Return default values if API fails
      return {
        standardShippingCost: 30000,
        expressShippingCost: 50000,
        freeShippingThreshold: 500000,
        estimatedDeliveryDays: 3,
        expressDeliveryDays: 1
      };
    }
  }

  async saveSettings(settings) {
    try {
      const response = await api.post('/admin/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async getAllSettings() {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching all settings:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;