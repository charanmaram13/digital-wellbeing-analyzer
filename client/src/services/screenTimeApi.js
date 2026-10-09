import apiClient from './apiClient.js';

export const screenTimeApi = {
  async getAll(params = {}) {
    const res = await apiClient.get('/screen-time', { params });
    return res;
  },

  async getById(id) {
    const res = await apiClient.get(`/screen-time/${id}`);
    return res.data;
  },

  async create(data) {
    const res = await apiClient.post('/screen-time', data);
    return res.data;
  },

  async update(id, data) {
    const res = await apiClient.patch(`/screen-time/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/screen-time/${id}`);
    return res.data;
  },

  async importCSV(csvContent) {
    const res = await apiClient.post('/screen-time/import', { csv: csvContent });
    return res.data;
  },

  async exportCSV() {
    // Direct browser download
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    window.open(`${baseURL}/screen-time/export`, '_blank');
  },
};

export default screenTimeApi;
