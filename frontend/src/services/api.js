import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rbac_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 & 403 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      // 401: Unauthorized (token missing, invalid, or expired)
      if (response.status === 401) {
        localStorage.removeItem('rbac_token');
        localStorage.removeItem('rbac_user');
        
        // Only redirect if not already on the login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?session_expired=1&redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

