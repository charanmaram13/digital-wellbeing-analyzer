import apiClient from './apiClient.js';

export const goalApi = {
  async getAll(params = {}) {
    const res = await apiClient.get('/goals', { params });
    return res.data;
  },

  async create(data) {
    const res = await apiClient.post('/goals', data);
    return res.data;
  },

  async update(id, data) {
    const res = await apiClient.patch(`/goals/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/goals/${id}`);
    return res.data;
  },
};

export default goalApi;
