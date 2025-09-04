import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Filters from '../../../components/LiveClasses/Filters';
import TableView from '../../../components/LiveClasses/TableView';
import CalendarView from '../../../components/LiveClasses/CalendarView';
import LiveClassForm from '../../../components/LiveClasses/LiveClassForm';
import '../../../components/LiveClasses/liveClasses.css';
import StatsCards from '../../../components/LiveClasses/StatsCards';
import { fetchLiveClasses, createLiveClass, updateLiveClass, deleteLiveClass, postNotify } from '../../../utils/liveClassesApi';
import http from '../../../utils/http';
import { getCache, setCache, shouldRevalidate } from '../../../utils/liveClassesCache';

const scope = 'admin';

const AdminLiveClasses = () => {
  const [filters, setFilters] = useState({});
  const [tab, setTab] = useState('list');
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ loadCourses(); hydrate(); }, []);
  useEffect(()=>{ mirrorAdminCache(items, filters); }, [items, filters]);

  const hydrate = async () => {
    const cached = getCache(scope);
    try { const m = sessionStorage.getItem('live:admin:list:v1'); if (m) { const parsed = JSON.parse(m); setItems(parsed.items||cached.items||[]); setFilters(parsed.filters||cached.filters||{}); } else { setItems(cached.items||[]); setFilters(cached.filters||{}); } } catch { setItems(cached.items||[]); setFilters(cached.filters||{}); }
    if (shouldRevalidate(scope)) {
      await refresh();
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await fetchLiveClasses({ ...filters, role: 'admin' });
      const merged = mergeWithDrafts(data);
      setItems(merged);
      setCache(scope, merged, filters);
      mirrorAdminCache(merged, filters);
      setOffline(false);
      await trySyncDrafts();
    } catch (e) {
      setOffline(true);
      const cached = getCache(scope).items || [];
      setItems(mergeWithDrafts(cached));
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await http.get('/courses');
      setCourses((res.data?.courses || res.data || []).map(c => ({ _id: c._id, name: c.name })));
    } catch {}
  };

  const startEdit = (it) => { setEditItem(it); };

  const onSubmit = async (payload) => {
    if (new Date(payload.endTime) <= new Date(payload.startTime)) {
      toast.error('End time must be after Start time');
      return;
    }
    try {
      if (editItem) {
        await updateLiveClass(editItem._id, payload);
        toast.success('Updated');
      } else {
        try {
          const created = await createLiveClass(payload);
          toast.success('Scheduled');
          setItems(prev => [created, ...prev.filter(x=>x._id!==created._id)]);
          setCache(scope, [created, ...items], filters);
          try { sessionStorage.setItem('live:admin:lastCreated:v1', JSON.stringify(created)); sessionStorage.setItem('live:classes:lastCreated:v1', JSON.stringify(created)); } catch {}
        } catch (err) {
          if (isOfflineErr(err)) {
            addDraft(payload);
            setOffline(true);
            const localItem = toLocalItem(payload, courses);
            setItems(prev => [localItem, ...prev]);
            setCache(scope, [localItem, ...items], filters);
            try { sessionStorage.setItem('live:admin:lastCreated:v1', JSON.stringify(localItem)); sessionStorage.setItem('live:classes:lastCreated:v1', JSON.stringify(localItem)); } catch {}
            toast.info('API offline — saved locally');
          } else {
            throw err;
          }
        }
      }
      setEditItem(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (it) => {
    if (!window.confirm('Delete this live class?')) return;
    try { await deleteLiveClass(it._id); toast.success('Deleted'); await refresh(); } catch { toast.error('Delete failed'); }
  };

  const [offline, setOffline] = useState(false);
  const filteredItems = useMemo(()=> items, [items]);
  const stats = useMemo(()=>{
    const now = Date.now();
    const week = now + 7*24*60*60*1000;
    const up = filteredItems.filter(it=>{
      const t = new Date(it.startTime).getTime();
      return t>=now && t<=week && (it.status==='scheduled' || it.status==='live');
    }).length;
    const total = filteredItems.length;
    const by = filteredItems.reduce((m,it)=>{ const k=it.platform||'custom'; m[k]=(m[k]||0)+1; return m; },{});
    return { upcomingWeek: up, totalScheduled: total, byPlatform: by };
  }, [filteredItems]);

  const mirrorAdminCache = (data, f) => { try { sessionStorage.setItem('live:admin:list:v1', JSON.stringify({ items: data, filters: f, ts: Date.now() })); } catch {} };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState(null);
  const openDrawer = (it) => { setActive(it); setDrawerOpen(true); };
  const closeDrawer = () => setDrawerOpen(false);

  const DRAFT_KEY = 'liveClassesDraft';
  const readDrafts = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || []; } catch { return []; } };
  const writeDrafts = (arr) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(arr)); } catch {} };
  const addDraft = (p) => { const arr = readDrafts(); arr.unshift({ id: `local-${Date.now()}`, payload: p }); writeDrafts(arr); };
  const toLocalItem = (p, coursesList) => ({
    _id: `local-${Date.now()}`,
    title: p.title,
    platform: p.platform,
    startTime: p.startTime,
    endTime: p.endTime,
    status: 'scheduled',
    joinLink: p.joinLink,
    courseId: { _id: p.courseId, name: (coursesList.find(c=>c._id===p.courseId)?.name) || '-' },
    local: true
  });
  const mergeWithDrafts = (server) => {
    const drafts = readDrafts();
    const locals = drafts.map(d => ({ ...toLocalItem(d.payload, courses), _id: d.id }));
    return [...locals, ...(server||[])];
  };
  const isOfflineErr = (err) => !err.response || err.response.status === 404 || err.message === 'Network Error';
  const trySyncDrafts = async () => {
    const drafts = readDrafts();
    if (!drafts.length) return;
    const remain = [];
    for (const d of drafts) {
      try {
        const created = await createLiveClass(d.payload);
        setItems(prev => [created, ...prev.filter(x => x._id !== d.id)]);
      } catch {
        remain.push(d);
      }
    }
    writeDrafts(remain);
    setOffline(remain.length > 0 ? true : false);
  };

  return (
    <div className="lc-container">
      <h1 className="lc-page-title">Manage Live Classes</h1>
      {offline && <div className="lc-banner">Offline/cache view</div>}

      <StatsCards stats={stats} />
      <div className="lc-sticky"><Filters courses={courses} filters={filters} onChange={setFilters} onSearch={refresh} /></div>

      <div className="lc-header lc-header-spaced">
        <div className="lc-tabs">
          <button className={`lc-tab ${tab==='list'?'active':''}`} onClick={()=>setTab('list')}>List View</button>
          <button className={`lc-tab ${tab==='calendar'?'active':''}`} onClick={()=>setTab('calendar')}>Calendar View</button>
          <button className={`lc-tab ${tab==='create'?'active':''}`} onClick={()=>setTab('create')}>Create Live Class</button>
        </div>
        <div className="lc-actions">
          <button className="lc-btn" onClick={refresh} disabled={loading}>Refresh List</button>
        </div>
      </div>

      <div className="lc-section">
        {tab==='list' && (
          <div className="table-wrapper">
            <TableView items={filteredItems} onView={openDrawer} onEdit={startEdit} onDelete={onDelete} onNotify={async(it)=>{ try { await postNotify(it._id); toast.success('Notifications sent'); } catch { toast.error('Notify failed'); } }} onIcs={async(it)=>{
              try {
                const r = await http.get(`/live-classes/${it._id}/ics`, { responseType: 'blob' });
                const blob = r.data instanceof Blob ? r.data : new Blob([r.data], { type: 'text/calendar' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href=url; a.download=`${it.title}.ics`; document.body.appendChild(a); a.click(); setTimeout(()=>{ window.URL.revokeObjectURL(url); document.body.removeChild(a); },0);
              } catch { toast.error('ICS download failed'); }
            }} />
          </div>
        )}
        {tab==='calendar' && (
          <div className="lc-card">
            <CalendarView items={filteredItems} onSelectItem={openDrawer} />
          </div>
        )}
        {tab==='create' && (
          <div className="lc-card">
            <LiveClassForm courses={courses} value={editItem} onCancel={()=>{ setEditItem(null); setTab('list'); }} onSubmit={(p)=>onSubmit(p)} />
          </div>
        )}
      </div>

      <div className={`lc-drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="lc-drawer-header">
          <h3 className="lc-title">Class Details</h3>
          <button className="lc-close" onClick={()=>setDrawerOpen(false)}>×</button>
        </div>
        <div className="lc-drawer-body">
          {active && (
            <div>
              <div className="lc-title">{active.title}</div>
              <div className="lc-muted">{new Date(active.startTime).toLocaleString()} — {new Date(active.endTime).toLocaleString()}</div>
              <div className="lc-badges-row lc-margin-8">
                <span className={`lc-badge ${active.platform}`}>{active.platform}</span>
                <span className="lc-badge">{active.status}</span>
              </div>
              <div className="lc-row-actions lc-mb-8">
                <button className="lc-btn" onClick={()=>navigator.clipboard.writeText(active.joinLink||'')}>Copy Join Link</button>
                <button className="lc-btn" onClick={()=>postNotify(active._id).then(()=>toast.success('Notifications sent')).catch(()=>toast.error('Notify failed'))}>Send Notifications</button>
                <button className="lc-btn" onClick={()=>{ setEditItem(active); setTab('create'); }}>Edit Class</button>
              </div>
              <div className="lc-muted">{active.description || ''}</div>
            </div>
          )}
        </div>
      </div>
      <div className={`lc-backdrop ${drawerOpen ? 'show' : ''}`} onClick={closeDrawer} />
    </div>
  );
};

export default AdminLiveClasses;
