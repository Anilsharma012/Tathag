import axios from 'axios';
import { API_BASE } from './apiBase';
import { toast } from 'react-toastify';

const resolveToken = () => {
  const fromLocal = localStorage.getItem('adminToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
  const fromSession = sessionStorage.getItem('token');
  const fromWindow = typeof window !== 'undefined' ? window.__TOKEN__ : null;
  return fromLocal || fromSession || fromWindow || null;
};

const crm = axios.create({ baseURL: API_BASE, withCredentials: true, timeout: 20000 });

crm.interceptors.request.use((config) => {
  const token = resolveToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

crm.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      try { toast.error('Session expired'); } catch {}
      setTimeout(()=>{ window.location.href = '/admin'; }, 1500);
    }
    return Promise.reject(error);
  }
);

export default crm;
