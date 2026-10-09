import axios from 'axios';

// Normalize base URL to ensure /api/v1 prefix is always guaranteed
const resolveBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || envUrl.trim() === '') {
    return '/api/v1';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v1')) {
    return trimmed;
  }
  if (trimmed.endsWith('/api')) {
    return `${trimmed}/v1`;
  }
  return `${trimmed}/api/v1`;
};

const baseURL = resolveBaseURL();

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token if available
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token =
        localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore storage access errors in private/sandboxed modes
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
