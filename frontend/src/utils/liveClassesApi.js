import http, { API_BASE, req } from './http';

const base = '/live-classes';

export const fetchLiveClasses = async (params = {}) => {
  const qp = { ...params };
  const res = await http.get(base, { params: qp });
  return res.data.items || [];
};

export const fetchStats = async () => {
  const res = await http.get(`${base}/stats`);
  return res.data.data;
};

export const fetchOne = async (id) => {
  const res = await http.get(`${base}/${id}`);
  return res.data.item;
};

export const createLiveClass = async (payload) => {
  const res = await req('post', base, { data: payload });
  return res.data.item;
};

export const updateLiveClass = async (id, payload) => {
  const res = await req('put', `${base}/${id}`, { data: payload });
  return res.data.item;
};

export const deleteLiveClass = async (id) => {
  const res = await req('delete', `${base}/${id}`);
  return res.data;
};

export const postNotify = async (id, payload = { channels:['email','push','sms','whatsapp'], schedule:{ t24h:true, t1h:true, t10m:true } }) => req('post', `${base}/${id}/notify`, { data: payload });

// Student reminder subscribe/unsubscribe
export const subscribeReminder = async (id, channels = ['push']) => {
  return req('post', `${base}/${id}/reminders/subscribe`, { data: { channels } });
};
export const unsubscribeReminder = async (id, channels = ['push']) => {
  return req('post', `${base}/${id}/reminders/unsubscribe`, { data: { channels } });
};

// ICS download via API (blob)
export const downloadClassIcs = async (id, title = 'event') => {
  const r = await http.get(`${base}/${id}/ics`, { responseType: 'blob' });
  const blob = r.data instanceof Blob ? r.data : new Blob([r.data], { type: 'text/calendar' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=`${sanitize(title)}.ics`; document.body.appendChild(a); a.click(); setTimeout(()=>{ window.URL.revokeObjectURL(url); document.body.removeChild(a); },0);
};

const sanitize = (t) => (t || 'event').toString().replace(/[^a-z0-9-_]+/gi, '-').substring(0, 64);

export { API_BASE };
