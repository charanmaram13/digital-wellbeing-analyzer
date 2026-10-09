import apiClient from './apiClient.js';

export const settingsApi = {
  async getSettings() {
    const res = await apiClient.get('/settings');
    return res.data;
  },

  async updateSettings(data) {
    const res = await apiClient.patch('/settings', data);
    return res.data;
  },
};

export default settingsApi;
