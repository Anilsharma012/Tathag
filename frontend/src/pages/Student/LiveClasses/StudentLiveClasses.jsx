import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import Filters from '../../../components/LiveClasses/Filters';
import CalendarView from '../../../components/LiveClasses/CalendarView';
import '../../../components/LiveClasses/liveClasses.css';
import { fetchLiveClasses, downloadClassIcs } from '../../../utils/liveClassesApi';
import http from '../../../utils/http';
import { getCache, setCache, shouldRevalidate } from '../../../utils/liveClassesCache';
import { downloadICS } from '../../../utils/ics';

const scope = 'student';

const StudentLiveClasses = () => {
  const [tab, setTab] = useState('table');
  const [filters, setFilters] = useState({});
  const [items, setItems] = useState([]);
  const timersRef = useRef({});
  const [prefs, setPrefs] = useState(readPrefs());
  const [active, setActive] = useState(null);
  const [version, setVersion] = useState(readVersion());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ hydrate(); startVersionPolling(); return () => { clearAllTimers(); stopVersionPolling(); }; }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ scheduleReminders(items, prefs); }, [items, prefs]);

  const [offline, setOffline] = useState(false);
  const hydrate = async () => {
    const cached = getCache(scope);
    setItems(cached.items || []);
    setFilters(cached.filters || {});
    setVersion(readVersion());
    markLastViewed();
    if (shouldRevalidate(scope)) await refresh();
  };

  const refresh = async () => {
    try {
      const data = await fetchLiveClasses({ ...filters, role: 'student' });
      const cached = getCache(scope).items || [];
      const merged = mergeById(data, cached);
      setItems(merged);
      setCache(scope, merged, filters);
      mirrorStudentCache(merged, filters);
      setOffline(false);
      markLastViewed();
      try { const v = await fetchVersion(); setVersion(v); writeVersion(v); } catch {}
    } catch (e) {
      setOffline(true);
      const cached = getCache(scope).items || [];
      setItems(cached);
    }
  };

  const canJoin = (it) => {
    const now = new Date();
    const start = new Date(it.startTime);
    const end = new Date(it.endTime);
    return now >= new Date(start.getTime() - 10 * 60000) && now <= new Date(end.getTime() + 30 * 60000);
  };
  const countdown = (it) => {
    const now = new Date();
    const start = new Date(it.startTime);
    const diff = start - now;
    if (diff <= 0 || diff > 24*60*60000) return null;
    const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000);
    return `${h}h ${m}m`;
  };


  const clearAllTimers = () => { Object.values(timersRef.current).forEach(arr => arr.forEach(t=>clearTimeout(t))); timersRef.current = {}; };

  const scheduleReminders = (list, preferences) => {
    clearAllTimers();
    list.forEach(it => {
      const pref = preferences[it._id];
      if (!pref || !pref.browser) return;
      const reminders = Array.isArray(it.reminders) ? it.reminders : [1440,60,10];
      const start = new Date(it.startTime).getTime();
      const now = Date.now();
      const timers = [];
      reminders.forEach(mins => {
        const t = start - mins*60000 - now;
        if (t > 0 && t < 24*60*60000) {
          const id = setTimeout(()=> toast.info(`Reminder: ${it.title} starts in ${mins} minutes`), t);
          timers.push(id);
        }
      });
      timersRef.current[it._id] = timers;
    });
  };

  const downloadIcs = async (it) => {
    try { await downloadClassIcs(it._id, it.title); }
    catch { downloadICS({ title: it.title, description: it.description, startTime: it.startTime, endTime: it.endTime, url: it.joinLink }); }
  };

  const filteredItems = useMemo(()=> items, [items]);

  const onCopyLink = async (link) => {
    try { await navigator.clipboard.writeText(link || ''); toast.success('Link copied'); } catch { toast.error('Copy failed'); }
  };

  const onToggleReminder = async (it) => {
    const current = !!prefs[it._id]?.browser;
    const next = { ...prefs, [it._id]: { browser: !current } };
    setPrefs(next); writePrefs(next);
    // Local-only toggle to reduce server calls and credits
    toast.success(!current ? 'Reminder on' : 'Reminder off');
  };

  const openDetails = (it) => { setActive(it); markLastViewed(); };
  const closeDetails = () => setActive(null);

  const fetchVersion = async () => {
    const r = await http.get('/live-classes/version');
    return Number(r?.data?.v || Date.now());
  };

  let verTimer = null;
  const startVersionPolling = () => {
    stopVersionPolling();
    verTimer = setInterval(async () => {
      try {
        const v = await fetchVersion();
        if (v && v !== version) {
          setVersion(v); writeVersion(v);
          await refresh();
        }
      } catch {}
    }, 20000);
  };
  const stopVersionPolling = () => { if (verTimer) { clearInterval(verTimer); verTimer = null; } };

  const mirrorStudentCache = (data, f) => {
    try { sessionStorage.setItem('live:student:list:v1', JSON.stringify({ items: data, filters: f, ts: Date.now() })); } catch {}
  };
  const markLastViewed = () => { try { sessionStorage.setItem('live:student:lastViewed:v1', String(Date.now())); } catch {} };
  const mergeById = (server, cached) => {
    const map = new Map();
    (cached||[]).forEach(x=> map.set(x._id, x));
    (server||[]).forEach(x=> map.set(x._id, x));
    return Array.from(map.values());
  };

  return (
    <div className="lc-container">
      <h1 className="lc-page-title">Live Classes</h1>
      <div className="lc-header">
        <div className="lc-tabs">
          <button className={`lc-tab ${tab==='table'?'active':''}`} onClick={()=>setTab('table')}>List</button>
          <button className={`lc-tab ${tab==='calendar'?'active':''}`} onClick={()=>setTab('calendar')}>Calendar</button>
        </div>
        <div className="lc-actions">
          <button className="lc-btn" onClick={refresh}>Refresh</button>
        </div>
      </div>

      {offline && <div className="lc-banner">Offline/cache view</div>}

      <Filters courses={[]} filters={filters} onChange={setFilters} onSearch={refresh} />

      {tab==='table' ? (
        <div>
          <div className="lc-card-list">
            {filteredItems.map(it => (
              <div key={it._id} className="lc-card">
                <div className="lc-card-header" onClick={()=>openDetails(it)}>
                  <div className="lc-title">{it.title}</div>
                  <span className={`lc-badge ${it.platform}`}>{it.platform}</span>
                </div>
                <div className="lc-muted">{new Date(it.startTime).toLocaleString()}</div>
                {countdown(it) && <div className="lc-countdown">Starts in {countdown(it)}</div>}
                <div className="lc-card-actions">
                  <a className={`lc-btn ${canJoin(it)?'primary':''}`} href={canJoin(it) ? it.joinLink : undefined} target="_blank" rel="noreferrer" aria-disabled={!canJoin(it)}>{canJoin(it)? 'Join' : 'Locked'}</a>
                  <button className="lc-btn" onClick={()=>downloadIcs(it)}>Add to Calendar (.ics)</button>
                  <button className={`lc-btn ${prefs[it._id]?.browser? 'primary':''}`} aria-pressed={!!prefs[it._id]?.browser} onClick={()=>onToggleReminder(it)}>{prefs[it._id]?.browser? 'Remind On' : 'Remind me'}</button>
                  <button className="lc-btn" onClick={()=>onCopyLink(it.joinLink)}>Copy Link</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <CalendarView items={filteredItems} onSelectItem={openDetails} />
      )}

      <div style={{display: active ? 'block' : 'none'}}>
        {active && (
          <div className="lc-card">
            <div className="lc-card-header">
              <div className="lc-title">{active.title}</div>
              <span className={`lc-badge ${active.platform}`}>{active.platform}</span>
            </div>
            <div className="lc-muted">{new Date(active.startTime).toLocaleString()} — {new Date(active.endTime).toLocaleString()}</div>
            {countdown(active) && <div className="lc-countdown">Starts in {countdown(active)}</div>}
            <p className="lc-description">{active.description || ''}</p>
            <div className="lc-card-actions">
              <a className={`lc-btn ${canJoin(active)?'primary':''}`} href={canJoin(active) ? active.joinLink : undefined} target="_blank" rel="noreferrer" aria-disabled={!canJoin(active)}>{canJoin(active)? 'Join' : 'Locked'}</a>
              <button className="lc-btn" onClick={()=>downloadIcs(active)}>Add to Calendar (.ics)</button>
              <button className={`lc-btn ${prefs[active._id]?.browser? 'primary':''}`} aria-pressed={!!prefs[active._id]?.browser} onClick={()=>onToggleReminder(active)}>{prefs[active._id]?.browser? 'Remind On' : 'Remind me'}</button>
              <button className="lc-btn" onClick={()=>onCopyLink(active.joinLink)}>Copy Link</button>
              <button className="lc-btn" onClick={closeDetails}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PREF_KEY = 'live_classes_notify_prefs';
const readPrefs = () => { try { return JSON.parse(sessionStorage.getItem(PREF_KEY)) || {}; } catch { return {}; } };
const writePrefs = (p) => { try { sessionStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch {} };

const V_KEY = 'live:classes:version:v1';
const readVersion = () => { try { return Number(sessionStorage.getItem(V_KEY)) || 0; } catch { return 0; } };
const writeVersion = (v) => { try { sessionStorage.setItem(V_KEY, String(v)); } catch {} };

export default StudentLiveClasses;
