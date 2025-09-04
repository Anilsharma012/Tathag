import axios from 'axios';
import { API_BASE } from './apiBase';

if (typeof window !== 'undefined' && !window.__API_BASE_LOGGED_CLIENT__) {
  console.info('API_BASE', API_BASE);
  window.__API_BASE_LOGGED_CLIENT__ = true;
}

export const http = axios.create({ baseURL: API_BASE, withCredentials: true, timeout: 20000 });

const resolveToken = () => {
  const fromLocal = localStorage.getItem('adminToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
  const fromSession = sessionStorage.getItem('token');
  const fromWindow = typeof window !== 'undefined' ? window.__TOKEN__ : null;
  return fromLocal || fromSession || fromWindow || null;
};

http.interceptors.request.use((config) => {
  const token = resolveToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const showSessionBanner = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('session-expired-banner')) return;
  const div = document.createElement('div');
  div.id = 'session-expired-banner';
  div.textContent = 'Session expired';
  div.style.cssText = 'position:fixed;top:10px;right:10px;background:#fff3cd;color:#856404;border:1px solid #ffeeba;padding:8px 12px;border-radius:8px;z-index:9999;font:14px/1.2 system-ui';
  document.body.appendChild(div);
  setTimeout(()=>{ div.remove(); }, 1500);
};

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      showSessionBanner();
      try {
        const p = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
        const target = p.startsWith('/student') ? '/login' : '/admin';
        setTimeout(()=>{ window.location.href = target; }, 1500);
      } catch {
        setTimeout(()=>{ window.location.href = '/admin/login'; }, 1500);
      }
    }
    return Promise.reject(err);
  }
);

export const req = async (method, url, options = {}) => {
  const m = method.toLowerCase();
  try { console.log(`Making ${m.toUpperCase()} request to: ${API_BASE}${url}`); } catch {}
  switch (m) {
    case 'get': return http.get(url, options);
    case 'post': return http.post(url, options?.data ?? options.body ?? options);
    case 'put': return http.put(url, options?.data ?? options.body ?? options);
    case 'delete': return http.delete(url, options);
    default: return http(m, url, options);
  }
};

export default http;
export { API_BASE };
