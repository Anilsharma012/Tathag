// utils/axiosConfig.js
import axios from "axios";

// Don't set baseURL since components already use full paths like "/api/courses"
// This prevents double /api prefixes
console.log("Axios configured without baseURL to prevent double /api prefix");

// Remove baseURL to let components use their own paths
// axios.defaults.baseURL = undefined;
axios.defaults.withCredentials = true;
axios.defaults.timeout = 20000;

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    // Respect explicit header if already provided by the caller
    const hasAuth = !!(config.headers && config.headers.Authorization);
    // Prefer admin token for admin routes; otherwise fallback
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!hasAuth && token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Clear all possible token keys on unauthorized
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default axios;
