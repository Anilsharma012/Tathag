import React, { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import http from '../../../utils/http';
import '../../../components/LiveClasses/liveClasses.css';

const key = 'admin-reports-cache';

const AdminReports = () => {
  const [items, setItems] = useState([]);
  const [offline, setOffline] = useState(false);

  useEffect(()=>{ try { setItems(JSON.parse(sessionStorage.getItem(key))||[]); } catch {}; refresh(); }, []);

  const refresh = async () => {
    try {
      const r = await http.get('/tests/reports', { params: { role: 'admin' } });
      setItems(r.data?.items || []);
      setOffline(false);
      try { sessionStorage.setItem(key, JSON.stringify(r.data?.items || [])); } catch {}
    } catch {
      setOffline(true);
    }
  };

  return (
    <AdminLayout>
      <div className="lc-container">
        {offline && <div className="lc-banner">Offline — showing cached reports.</div>}
        <div className="lc-card">
          <div className="lc-header" style={{marginBottom:8}}>
            <div className="lc-title">Test Reports (Admin)</div>
            <div className="lc-actions"><button className="lc-btn" onClick={refresh}>Refresh</button></div>
          </div>
          <table className="lc-table">
            <thead><tr><th>Test</th><th>Attempts</th><th>Avg</th><th>Highest</th><th>Lowest</th></tr></thead>
            <tbody>
              {items.map((it,idx)=> (
                <tr key={idx}>
                  <td>{it.testName}</td>
                  <td>{it.attempts}</td>
                  <td>{it.avgScore}</td>
                  <td>{it.highest}</td>
                  <td>{it.lowest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
