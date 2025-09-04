const KEY = 'live:classes:list:v1';

const readStore = () => {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch { return {}; }
};
const writeStore = (data) => { try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch {} };

export const getCache = (scope) => {
  const store = readStore();
  return store[scope] || { items: [], ts: 0, filters: {} };
};

export const setCache = (scope, data, filters = {}) => {
  const store = readStore();
  store[scope] = { items: data, ts: Date.now(), filters };
  writeStore(store);
};

export const shouldRevalidate = (scope, maxAgeMs = 5 * 60 * 1000) => {
  const { ts } = getCache(scope);
  return Date.now() - ts > maxAgeMs;
};

export const mergeMemory = (() => {
  const memory = {};
  return (scope, items) => {
    memory[scope] = items;
    return memory[scope];
  };
})();
