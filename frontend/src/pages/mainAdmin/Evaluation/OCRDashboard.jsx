import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import http from '../../../utils/http';
import '../../../components/LiveClasses/liveClasses.css';
import { toast } from 'react-toastify';

const CACHE_LAST = 'ocr:lastResult:v1';
const CACHE_ACT = 'ocr:recentActivities:v1';

const OCRDashboard = () => {
  const [kpis, setKpis] = useState({ scans: 0, avgScore: 0 });
  const [filters, setFilters] = useState({ from: '', to: '', q: '' });
  const [activities, setActivities] = useState(()=>rehydrateArray(CACHE_ACT));
  const [result, setResult] = useState(()=>rehydrateObj(CACHE_LAST));
  const [offline, setOffline] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ backgroundFetch(); }, []);

  const backgroundFetch = async () => {
    try {
      const { data } = await http.get('/tests/reports', { params: { type: 'ocr', from: filters.from || undefined, to: filters.to || undefined, q: filters.q || undefined } });
      const items = (data.items || []).map((it) => ({
        id: it.testId || String(Math.random()),
        title: it.testName || 'OCR Evaluation',
        date: it.date ? new Date(it.date).toISOString() : new Date().toISOString(),
        score: typeof it.score === 'number' ? it.score : (it.avgScore || 0),
        status: it.status || 'Completed'
      }));
      setActivities(items);
      persist(CACHE_ACT, items);
      const scans = items.length;
      const avgScore = Math.round(((items.reduce((s,a)=> s + (a.score||0),0)/Math.max(scans,1))||0)*100)/100;
      setKpis({ scans, avgScore });
      setOffline(false);
    } catch {
      setOffline(true);
    }
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData(); form.append('file', file);
    setSubmitting(true);
    try {
      let r;
      try {
        r = await http.post('/evaluation/ocr/extract', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } catch {
        r = await http.post('/ocr/evaluate', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      const res = r.data?.result || r.data;
      const payload = { name: file.name, text: res.text || '', score: res.score || 0, remarks: res.remarks || '', fileUrl: res.fileUrl || '' };
      setResult(payload);
      persist(CACHE_LAST, payload);
      setActivities(prev => [{ id: `local-${Date.now()}`, title: file.name, date: new Date().toISOString(), score: payload.score, status: 'Evaluated' }, ...prev]);
      persist(CACHE_ACT, [{ id: `local-${Date.now()}`, title: file.name, date: new Date().toISOString(), score: payload.score, status: 'Evaluated' }, ...activities]);
      setOffline(false);
      try { await http.post('/evaluation/ocr/save', payload); } catch {}
    } catch (e) {
      toast.error('OCR failed'); setOffline(true);
    } finally { setSubmitting(false); if (fileRef.current) fileRef.current.value=''; }
  };

  const filteredActivities = useMemo(()=> activities, [activities]);

  return (
    <AdminLayout>
      <div className="lc-container">
        {offline && <div className="lc-banner">Offline/cache view</div>}
        <div className="lc-header" style={{position:'sticky',top:0,zIndex:10,background:'transparent',paddingBottom:8}}>
          <h1 className="lc-page-title">OCR Evaluation</h1>
        </div>
        <div className="lc-stats">
          <div className="lc-stat-card"><div className="lc-muted">Total Scans</div><div className="lc-stat-value">{kpis.scans}</div></div>
          <div className="lc-stat-card"><div className="lc-muted">Average Score</div><div className="lc-stat-value">{kpis.avgScore}</div></div>
        </div>

        <div className="lc-filters" style={{position:'sticky',top:48,background:'#f4f6fc',padding:'8px 0',zIndex:9}}>
          <input className="lc-filter" type="date" value={filters.from} onChange={(e)=>setFilters({...filters, from:e.target.value})} />
          <input className="lc-filter" type="date" value={filters.to} onChange={(e)=>setFilters({...filters, to:e.target.value})} />
          <input className="lc-filter" placeholder="Search" value={filters.q} onChange={(e)=>setFilters({...filters, q:e.target.value})} />
          <div className="lc-actions"><button className="lc-btn" onClick={backgroundFetch}>Apply</button></div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1.2fr .8fr',gap:16}}>
          <div className="lc-card">
            <div className="lc-title">Upload & Evaluate</div>
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onUpload} disabled={submitting} />
            <div style={{height:10}} />
            <div className="lc-title">Activity</div>
            <div className="table-wrapper">
              <table className="lc-table">
                <thead><tr><th>Title</th><th>Date</th><th>Score</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredActivities.map(a => (
                    <tr key={a.id}>
                      <td>{a.title}</td>
                      <td>{new Date(a.date).toLocaleString()}</td>
                      <td><span className="lc-badge">{a.score}</span></td>
                      <td><span className="lc-badge">{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="lc-card">
            <div className="lc-title">Result</div>
            {!result ? (
              <div className="lc-muted">No result yet</div>
            ) : (
              <div>
                <div className="lc-countdown">Score: <span className="lc-badge">{result.score}</span></div>
                <div className="lc-muted">{result.remarks}</div>
                {result.fileUrl && <img src={result.fileUrl} alt="uploaded" style={{maxWidth:'100%',borderRadius:8,marginTop:8}} />}
                <pre style={{whiteSpace:'pre-wrap'}}>{result.text}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const rehydrateObj = (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } };
const rehydrateArray = (k) => { try { return JSON.parse(sessionStorage.getItem(k)) || []; } catch { return []; } };
const persist = (k,v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} };

export default OCRDashboard;
