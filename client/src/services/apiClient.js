import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorPayload = error.response?.data?.error || {
      message: error.message || 'Network error or server unavailable',
      code: 'NETWORK_ERROR',
      statusCode: error.response?.status,
    };
    if (error.response?.status) {
      errorPayload.statusCode = error.response.status;
    }
    return Promise.reject(errorPayload);
  }
);

export default apiClient;
