import apiClient from './apiClient.js';

export const recommendationApi = {
  async generateInsights() {
    const res = await apiClient.post('/insights/generate');
    return res.data;
  },

  async getRecommendations(params = {}) {
    const res = await apiClient.get('/recommendations', { params });
    return res.data;
  },

  async updateStatus(id, status) {
    const res = await apiClient.patch(`/recommendations/${id}`, { status });
    return res.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/recommendations/${id}`);
    return res.data;
  },
};

export default recommendationApi;
