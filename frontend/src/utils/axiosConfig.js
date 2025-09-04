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
    // Check for token in all possible localStorage keys
    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
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
