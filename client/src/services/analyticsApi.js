import apiClient from './apiClient.js';

export const analyticsApi = {
  async getOverview() {
    const res = await apiClient.get('/analytics/overview');
    return res.data;
  },

  async getDaily(params = {}) {
    const res = await apiClient.get('/analytics/daily', { params });
    return res.data;
  },

  async getWeekly() {
    const res = await apiClient.get('/analytics/weekly');
    return res.data;
  },

  async getCategories(params = {}) {
    const res = await apiClient.get('/analytics/categories', { params });
    return res.data;
  },

  async getPatterns() {
    const res = await apiClient.get('/analytics/patterns');
    return res.data;
  },

  async getWellbeingScore(params = {}) {
    const res = await apiClient.get('/analytics/wellbeing-score', { params });
    return res.data;
  },
};

export default analyticsApi;
