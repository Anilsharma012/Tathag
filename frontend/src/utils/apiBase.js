let ENV = {};
try {
  // Access property of import.meta; some bundlers warn but it's fine
  ENV = (import.meta && import.meta.env) ? import.meta.env : {};
} catch (e) {
  ENV = {};
}

const pick = (...arr) => arr.find(v => typeof v === 'string' && v.trim().length > 0);
const sameOrigin = () => (typeof window !== 'undefined' && window.location ? `${window.location.origin}/api` : '/api');

const resolved = (pick(
  ENV.VITE_API_BASE_URL,
  typeof window !== 'undefined' ? window.__API_BASE_URL__ : '',
  sameOrigin()
) || '/api').replace(/\/+$/,'');

export const API_BASE = resolved;
if (typeof window !== 'undefined' && !window.__API_BASE_LOGGED__) {
  console.info('API_BASE', API_BASE);
  window.__API_BASE_LOGGED__ = true;
}
