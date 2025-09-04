import React, { useEffect, useState } from 'react';
import http from '../../../utils/http';
import '../../../components/LiveClasses/liveClasses.css';

const key = 'tests:reports:v1';

const StudentReports = () => {
  const [items, setItems] = useState([]);
  const [offline, setOffline] = useState(false);

  useEffect(()=>{ try { setItems(JSON.parse(sessionStorage.getItem(key))||[]); } catch {}; refresh(); }, []);

  const refresh = async () => {
    try {
      const r = await http.get('/tests/reports', { params: { role: 'student' } });
      const items = r.data?.items || [];
      setItems(items);
      setOffline(false);
      try { sessionStorage.setItem(key, JSON.stringify(items)); } catch {}
    } catch {
      setOffline(true);
    }
  };

  return (
    <div className="lc-container">
      {offline && <div className="lc-banner">Offline — showing cached reports.</div>}
      <div className="lc-card">
        <div className="lc-header" style={{marginBottom:8}}>
          <div className="lc-title">Test Reports</div>
          <div className="lc-actions"><button className="lc-btn" onClick={refresh}>Refresh</button></div>
        </div>
        <table className="lc-table">
          <thead><tr><th>Test</th><th>Date</th><th>Score</th><th>Accuracy</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((it,idx)=> (
              <tr key={idx}>
                <td>{it.testName || it.testId}</td>
                <td>{new Date(it.date || Date.now()).toLocaleString()}</td>
                <td>{it.score}</td>
                <td>{it.accuracy}%</td>
                <td>{it.status}</td>
                <td>
                  <button className="lc-btn" onClick={async()=>{
                    try {
                      const id = it._id || it.reportId;
                      const r = await http.get(`/tests/reports/${id}/pdf`, { responseType:'blob' });
                      const blob = r.data instanceof Blob ? r.data : new Blob([r.data], { type: 'application/pdf' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href=url; a.download=`${(it.testId||'report')}-${(it.studentId||'me')}.pdf`; document.body.appendChild(a); a.click();
                      setTimeout(()=>{ window.URL.revokeObjectURL(url); document.body.removeChild(a); },0);
                    } catch { alert('Failed to download'); }
                  }}>PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Simple chart */}
      <div className="lc-card lc-section">
        <div className="lc-title">Your Score vs Avg (last 5)</div>
        <div style={{display:'flex',gap:8,alignItems:'flex-end',height:120}}>
          {items.slice(0,5).map((it,idx)=>{
            const h = Math.max(4, Math.min(100, it.score));
            const avg = Math.max(4, Math.min(100, it.avgScore || it.score));
            return (
              <div key={idx} style={{display:'grid',gap:4}}>
                <div style={{display:'flex',gap:4,alignItems:'flex-end'}}>
                  <div style={{width:20,background:'#2d8cff',height:h}} title={`You: ${h}`}></div>
                  <div style={{width:20,background:'#a3c4ff',height:avg}} title={`Avg: ${avg}`}></div>
                </div>
                <div className="lc-muted" style={{maxWidth:40,fontSize:10}}>{it.testName}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentReports;
