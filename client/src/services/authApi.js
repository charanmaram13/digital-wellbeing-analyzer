import apiClient from './apiClient.js';

export const authApi = {
  async register(data) {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  async login(data) {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },

  async logout() {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },

  async me() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

export default authApi;
