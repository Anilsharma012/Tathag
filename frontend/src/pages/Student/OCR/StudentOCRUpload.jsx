import React, { useEffect, useState } from 'react';
import http from '../../../utils/http';
import '../../../components/LiveClasses/liveClasses.css';

const key = 'student-ocr-cache';

const StudentOCRUpload = () => {
  const [rows, setRows] = useState([]);
  const [offline, setOffline] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{ try { setRows(JSON.parse(sessionStorage.getItem(key))||[]); } catch {} }, []);
  useEffect(()=>{ try { sessionStorage.setItem(key, JSON.stringify(rows)); } catch {} }, [rows]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/pdf|jpg|jpeg|png$/i.test(file.name)) { alert('Only jpg, png, pdf allowed'); return; }
    const form = new FormData(); form.append('file', file);
    setSubmitting(true);
    try {
      const r = await http.post('/ocr/evaluate', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setRows([{ ...r.data.result, name: file.name, offline:false }, ...rows]);
      setOffline(false);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setRows([{ name: file.name, fileUrl: reader.result, text: '(saved locally)', score: 0, remarks: 'Will sync later', offline:true }, ...rows]);
        setOffline(true);
      };
      reader.readAsDataURL(file);
    } finally { setSubmitting(false); e.target.value=''; }
  };

  return (
    <div className="lc-container">
      {offline && <div className="lc-banner">API offline — OCR saved locally.</div>}
      <div className="lc-card lc-section">
        <div className="lc-title">Upload Handwritten Answer (jpg/png/pdf)</div>
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onUpload} disabled={submitting} />
      </div>
      <div className="lc-card lc-section">
        {rows.map((r,idx)=>(
          <div key={idx} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div><img alt="uploaded" src={r.fileUrl} style={{maxWidth:'100%'}} /></div>
            <div>
              <div className="lc-title">{r.name} {r.offline && <span className="lc-badge local">offline</span>}</div>
              <div className="lc-muted">Score: {r.score} | {r.remarks}</div>
              <pre style={{whiteSpace:'pre-wrap'}}>{r.text}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentOCRUpload;
