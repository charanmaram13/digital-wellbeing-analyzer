import apiClient from './apiClient.js';

export const focusApi = {
  async getAll() {
    const res = await apiClient.get('/focus-sessions');
    return res.data;
  },

  async getActive() {
    const res = await apiClient.get('/focus-sessions/active');
    return res.data;
  },

  async start(data) {
    const res = await apiClient.post('/focus-sessions', data);
    return res.data;
  },

  async update(id, data) {
    const res = await apiClient.patch(`/focus-sessions/${id}`, data);
    return res.data;
  },
};

export default focusApi;
