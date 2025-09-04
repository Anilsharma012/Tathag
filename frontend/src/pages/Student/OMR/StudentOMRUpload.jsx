import React, { useEffect, useState } from 'react';
import http from '../../../utils/http';
import '../../../components/LiveClasses/liveClasses.css';

const key = 'student-omr-cache';

const StudentOMRUpload = () => {
  const [rows, setRows] = useState([]);
  const [offline, setOffline] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{ try { setRows(JSON.parse(sessionStorage.getItem(key))||[]); } catch {} }, []);
  useEffect(()=>{ try { sessionStorage.setItem(key, JSON.stringify(rows)); } catch {} }, [rows]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/pdf|jpg|jpeg|png$/i.test(file.name)) { alert('Only jpg, png, pdf allowed'); return; }
    const form = new FormData(); form.append('file', file); form.append('testId','unknown');
    setSubmitting(true);
    try {
      const r = await http.post('/omr/check', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setRows([{ ...r.data.result, name: file.name, offline:false }, ...rows]);
      setOffline(false);
    } catch {
      setRows([{ name: file.name, totalQuestions: 0, correct:0, incorrect:0, score:0, offline:true }, ...rows]);
      setOffline(true);
    } finally { setSubmitting(false); e.target.value=''; }
  };

  return (
    <div className="lc-container">
      {offline && <div className="lc-banner">API offline — OMR saved locally.</div>}
      <div className="lc-card lc-section">
        <div className="lc-title">Upload OMR Sheet (jpg/png/pdf)</div>
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onUpload} disabled={submitting} />
      </div>
      <div className="lc-card lc-section">
        <table className="lc-table">
          <thead><tr><th>File</th><th>Total</th><th>Correct</th><th>Incorrect</th><th>Score</th></tr></thead>
          <tbody>
            {rows.map((r,idx)=>(
              <tr key={idx}>
                <td>{r.name} {r.offline && <span className="lc-badge local">offline</span>}</td>
                <td>{r.totalQuestions}</td>
                <td>{r.correct}</td>
                <td>{r.incorrect}</td>
                <td>{Math.round(r.score*100)/100}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentOMRUpload;
