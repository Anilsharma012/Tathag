import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Filters from '../../../components/LiveClasses/Filters';
import TableView from '../../../components/LiveClasses/TableView';
import CalendarView from '../../../components/LiveClasses/CalendarView';
import LiveClassForm from '../../../components/LiveClasses/LiveClassForm';
import '../../../components/LiveClasses/liveClasses.css';
import { fetchLiveClasses, createLiveClass, updateLiveClass } from '../../../utils/liveClassesApi';
import { getCache, setCache, shouldRevalidate } from '../../../utils/liveClassesCache';
import axios from '../../../utils/axiosConfig';

const scope = 'teacher';

const TeacherLiveClasses = () => {
  const [tab, setTab] = useState('table');
  const [filters, setFilters] = useState({});
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(()=>{ loadCourses(); hydrate(); }, []);

  const hydrate = async () => {
    const cached = getCache(scope);
    setItems(cached.items || []);
    setFilters(cached.filters || {});
    if (shouldRevalidate(scope)) {
      await refresh();
    }
  };

  const [offline, setOffline] = useState(false);
  const refresh = async () => {
    try {
      const data = await fetchLiveClasses({ ...filters, role: 'teacher' });
      setItems(data);
      setCache(scope, data, filters);
      setOffline(false);
    } catch (e) {
      setOffline(true);
      const cached = getCache(scope).items || [];
      setItems(cached);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses((res.data?.courses || res.data || []).map(c => ({ _id: c._id, name: c.name })));
    } catch {}
  };

  const startCreate = () => { setEditItem(null); setShowForm(true); };
  const startEdit = (it) => { setEditItem(it); setShowForm(true); };

  const onSubmit = async (payload) => {
    try {
      if (editItem) {
        await updateLiveClass(editItem._id, payload);
        toast.success('Updated');
      } else {
        const created = await createLiveClass(payload);
        try { sessionStorage.setItem('live:classes:lastCreated:v1', JSON.stringify(created)); } catch {}
        toast.success('Created');
      }
      setShowForm(false); setEditItem(null);
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Save failed');
    }
  };

  const filteredItems = useMemo(()=> items, [items]);

  return (
    <div className="lc-container">
      <div className="lc-header">
        <div className="lc-tabs">
          <button className={`lc-tab ${tab==='table'?'active':''}`} onClick={()=>setTab('table')}>Table</button>
          <button className={`lc-tab ${tab==='calendar'?'active':''}`} onClick={()=>setTab('calendar')}>Calendar</button>
        </div>
        <div className="lc-actions">
          <button className="lc-btn" onClick={refresh}>Refresh</button>
          <button className="lc-btn primary" onClick={startCreate}>Create</button>
        </div>
      </div>

      {offline && <div className="lc-banner">Offline/cache view</div>}

      <Filters courses={courses} filters={filters} onChange={setFilters} onSearch={refresh} />

      <div style={{display: tab==='table' ? 'block' : 'none'}}>
        <TableView items={filteredItems} onEdit={startEdit} />
      </div>
      <div style={{display: tab==='calendar' ? 'block' : 'none'}}>
        <CalendarView items={filteredItems} />
      </div>

      <div className="lc-stat-card lc-section" style={{display: showForm ? 'block' : 'none'}}>
        <LiveClassForm courses={courses} value={editItem} onCancel={()=>{ setShowForm(false); setEditItem(null); }} onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default TeacherLiveClasses;
